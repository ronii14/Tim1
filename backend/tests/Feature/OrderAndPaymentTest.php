<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Promo;
use App\Models\Status;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\StatusSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Address $address;
    protected Status $productStatus;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles, permissions and statuses
        $this->seed(RolePermissionSeeder::class);
        $this->seed(StatusSeeder::class);

        $this->user = User::factory()->create();
        $this->user->assignRole('user');

        $this->productStatus = Status::where('type_status', 'product')->where('name_status', 'Aktif')->first();

        // Create a default shipping address for the user
        $this->address = Address::create([
            'user_id'      => $this->user->id,
            'label'        => 'Rumah',
            'recipient'    => 'John Doe',
            'phone'        => '08123456789',
            'province'     => 'DKI Jakarta',
            'city'         => 'Jakarta Selatan',
            'district'     => 'Kebon Baru',
            'postal_code'  => '12830',
            'full_address' => 'Jl. Tebet Dalam No. 15',
            'is_default'   => true,
        ]);
    }

    public function test_user_cannot_checkout_empty_cart(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->postJson('/api/orders', [
            'payment_method' => 'bca',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Keranjang belanja Anda kosong.');
    }

    public function test_user_checkout_success(): void
    {
        Sanctum::actingAs($this->user);

        // Create a product
        $product = Product::create([
            'name'        => 'Bibit Tomat',
            'slug'        => 'bibit-tomat',
            'description' => 'Bibit tomat berkualitas',
            'price'       => 25000.00,
            'stock'       => 10,
            'status_id'   => $this->productStatus->id,
        ]);

        // Add to cart
        CartItem::create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
        ]);

        $payload = [
            'payment_method'  => 'gopay',
            'shipping_method' => 'JNE Reguler',
            'shipping_cost'   => 9000.00,
            'notes'           => 'Tolong dipacking kayu',
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Pesanan berhasil dibuat.')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.subtotal', '50000.00')
            ->assertJsonPath('data.shipping_cost', '9000.00')
            ->assertJsonPath('data.total', '59000.00');

        // Check stock decremented
        $this->assertEquals(8, $product->fresh()->stock);

        // Check cart cleared
        $this->assertDatabaseEmpty('cart_items');

        // Check payment record exists
        $this->assertDatabaseHas('payments', [
            'amount' => 59000.00,
            'status' => 'pending',
        ]);
    }

    public function test_checkout_out_of_stock_fails(): void
    {
        Sanctum::actingAs($this->user);

        $product = Product::create([
            'name'        => 'Bibit Cabai',
            'slug'        => 'bibit-cabai',
            'description' => 'Bibit cabai pedas',
            'price'       => 15000.00,
            'stock'       => 1, // Only 1 in stock
            'status_id'   => $this->productStatus->id,
        ]);

        CartItem::create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2, // Ordering 2
        ]);

        $response = $this->postJson('/api/orders', [
            'payment_method' => 'bca',
        ]);

        $response->assertStatus(400)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Stok produk Bibit Cabai tidak mencukupi. Tersedia: 1.');
    }

    public function test_checkout_applies_fixed_promo_correctly(): void
    {
        Sanctum::actingAs($this->user);

        $product = Product::create([
            'name'        => 'Pupuk Organik',
            'slug'        => 'pupuk-organik',
            'description' => 'Pupuk organik subur',
            'price'       => 30000.00,
            'stock'       => 10,
            'status_id'   => $this->productStatus->id,
        ]);

        CartItem::create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2, // Total 60,000
        ]);

        // Create Promo (min spend 50k, discount 10k)
        $promo = Promo::create([
            'code'           => 'DISKON10',
            'discount_type'  => 'fixed',
            'discount_value' => 10000.00,
            'min_spend'      => 50000.00,
            'is_active'      => true,
            'expires_at'     => now()->addDay(),
        ]);

        $response = $this->postJson('/api/orders', [
            'payment_method' => 'bca',
            'promo_code'     => 'DISKON10',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', '60000.00')
            ->assertJsonPath('data.discount', '10000.00')
            ->assertJsonPath('data.total', '50000.00');
    }

    public function test_user_can_cancel_pending_order_and_restores_stock(): void
    {
        Sanctum::actingAs($this->user);

        $product = Product::create([
            'name'        => 'Pot Gantung',
            'slug'        => 'pot-gantung',
            'description' => 'Pot gantung dekoratif',
            'price'       => 20000.00,
            'stock'       => 5,
            'status_id'   => $this->productStatus->id,
        ]);

        CartItem::create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 2,
        ]);

        $orderResponse = $this->postJson('/api/orders', [
            'payment_method' => 'bca',
        ]);

        $orderId = $orderResponse->json('data.id');

        $this->assertEquals(3, $product->fresh()->stock); // Stock decremented

        // Cancel order
        $cancelResponse = $this->postJson("/api/orders/{$orderId}/cancel");

        $cancelResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'cancelled')
            ->assertJsonPath('data.payment.status', 'failed');

        // Check stock restored
        $this->assertEquals(5, $product->fresh()->stock);
    }

    public function test_payment_simulation_success(): void
    {
        Sanctum::actingAs($this->user);

        $product = Product::create([
            'name'        => 'Bibit Melon',
            'slug'        => 'bibit-melon',
            'description' => 'Melon manis',
            'price'       => 40000.00,
            'stock'       => 5,
            'status_id'   => $this->productStatus->id,
        ]);

        CartItem::create([
            'user_id'    => $this->user->id,
            'product_id' => $product->id,
            'quantity'   => 1,
        ]);

        $orderResponse = $this->postJson('/api/orders', [
            'payment_method' => 'bca',
        ]);

        $refCode = $orderResponse->json('data.payment.ref_code');

        // Simulate success
        $simulateResponse = $this->postJson("/api/payments/{$refCode}/simulate", [
            'status' => 'success',
        ]);

        $simulateResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'success')
            ->assertJsonPath('data.order.status', 'paid');
    }

    public function test_admin_can_update_status_to_shipped_with_tracking_number(): void
    {
        // Setup Admin User
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        Sanctum::actingAs($admin);

        // Place a pre-paid order
        $order = Order::create([
            'user_id'       => $this->user->id,
            'address_id'    => $this->address->id,
            'status'        => 'paid',
            'subtotal'      => 40000.00,
            'discount'      => 0,
            'shipping_cost' => 10000.00,
            'total'         => 50000.00,
        ]);

        $response = $this->patchJson("/api/admin/orders/{$order->id}/status", [
            'status'          => 'shipped',
            'tracking_number' => 'TRK-987654321',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'shipped')
            ->assertJsonPath('data.tracking_number', 'TRK-987654321');
    }
}
