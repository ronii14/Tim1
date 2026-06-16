<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Promo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * List authenticated user's orders.
     */
    public function index(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['payment', 'address', 'promo'])
            ->withCount('items')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $orders,
        ]);
    }

    /**
     * Show details of a specific user order.
     */
    public function show(Request $request, string $id)
    {
        $order = $request->user()->orders()
            ->with(['items.product', 'items.variant', 'payment', 'address', 'promo'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $order,
        ]);
    }

    /**
     * Checkout (Place Order).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'address_id'      => 'nullable|uuid|exists:addresses,id',
            'promo_code'      => 'nullable|string|exists:promos,code',
            'shipping_method' => 'nullable|string|max:100',
            'shipping_cost'   => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string',
            'payment_method'  => 'required|string|max:50',
        ]);

        $user = $request->user();

        // 1. Get cart items
        $cartItems = CartItem::where('user_id', $user->id)
            ->with(['product', 'variant'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang belanja Anda kosong.',
            ], 400);
        }

        // 2. Validate Address
        $address = null;
        if (!empty($validated['address_id'])) {
            $address = $user->addresses()->where('id', $validated['address_id'])->first();
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Alamat tidak ditemukan.',
                ], 400);
            }
        } else {
            $address = $user->addresses()->where('is_default', true)->first();
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan tambahkan alamat pengiriman terlebih dahulu.',
                ], 400);
            }
        }

        // 3. Compute Subtotal & Validate Stock
        $subtotal = 0;
        $itemsToCreate = [];

        foreach ($cartItems as $cartItem) {
            $product = $cartItem->product;
            $variant = $cartItem->variant;
            $quantity = $cartItem->quantity;

            if ($variant) {
                // Use variant stock and price
                if ($variant->stock < $quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok produk {$product->name} (Varian: {$variant->name}) tidak mencukupi. Tersedia: {$variant->stock}.",
                    ], 400);
                }
                $unitPrice = $variant->price;
                $sku = $variant->name; // or generate some sku
                $nameSnapshot = "{$product->name} - {$variant->name}";
            } else {
                // Use product stock and price
                if ($product->stock < $quantity) {
                    return response()->json([
                        'success' => false,
                        'message' => "Stok produk {$product->name} tidak mencukupi. Tersedia: {$product->stock}.",
                    ], 400);
                }
                $unitPrice = $product->price;
                $sku = $product->slug;
                $nameSnapshot = $product->name;
            }

            $subtotal += $unitPrice * $quantity;

            $itemsToCreate[] = [
                'product_id' => $product->id,
                'variant_id' => $variant ? $variant->id : null,
                'name'       => $nameSnapshot,
                'sku'        => $sku,
                'quantity'   => $quantity,
                'unit_price' => $unitPrice,
            ];
        }

        // 4. Validate Promo
        $discount = 0;
        $promo = null;
        if (!empty($validated['promo_code'])) {
            $promo = Promo::where('code', $validated['promo_code'])
                ->where('is_active', true)
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->first();

            if (!$promo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode promo tidak valid atau sudah kadaluwarsa.',
                ], 400);
            }

            if ($subtotal < $promo->min_spend) {
                return response()->json([
                    'success' => false,
                    'message' => "Minimal belanja untuk menggunakan promo ini adalah Rp " . number_format($promo->min_spend, 0, ',', '.'),
                ], 400);
            }

            if ($promo->discount_type === 'percentage') {
                $discount = $subtotal * ($promo->discount_value / 100);
            } else {
                $discount = $promo->discount_value;
            }

            // Discount cannot exceed subtotal
            $discount = min($discount, $subtotal);
        }

        $shippingCost = $validated['shipping_cost'] ?? 0;
        $total = $subtotal - $discount + $shippingCost;

        // 5. DB Transaction
        $order = DB::transaction(function () use ($user, $address, $promo, $subtotal, $discount, $shippingCost, $total, $validated, $itemsToCreate, $cartItems) {
            // Create Order
            $order = Order::create([
                'user_id'         => $user->id,
                'address_id'      => $address->id,
                'promo_id'        => $promo ? $promo->id : null,
                'status'          => 'pending',
                'subtotal'        => $subtotal,
                'discount'        => $discount,
                'shipping_cost'   => $shippingCost,
                'total'           => $total,
                'shipping_method' => $validated['shipping_method'] ?? null,
                'notes'           => $validated['notes'] ?? null,
            ]);

            // Create Order Items & Decrement Stock
            foreach ($itemsToCreate as $itemData) {
                $order->items()->create($itemData);

                if ($itemData['variant_id']) {
                    ProductVariant::where('id', $itemData['variant_id'])->decrement('stock', $itemData['quantity']);
                } else {
                    Product::where('id', $itemData['product_id'])->decrement('stock', $itemData['quantity']);
                }
            }

            // Create Payment
            Payment::create([
                'order_id'       => $order->id,
                'payment_method' => $validated['payment_method'],
                'status'         => 'pending',
                'amount'         => $total,
                'ref_code'       => 'PAY-' . strtoupper(Str::random(10)) . '-' . time(),
                'va_number'      => '8832' . rand(1000000000, 9999999999),
                'expired_at'     => now()->addHours(24),
            ]);

            // Clear Cart
            CartItem::where('user_id', $user->id)->delete();

            return $order;
        });

        $order->load(['items.product', 'items.variant', 'payment', 'address', 'promo']);

        return response()->json([
            'success' => true,
            'data'    => $order,
            'message' => 'Pesanan berhasil dibuat.',
        ], 201);
    }

    /**
     * Cancel Order.
     */
    public function cancel(Request $request, string $id)
    {
        $order = $request->user()->orders()
            ->with(['items', 'payment'])
            ->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pesanan berstatus pending yang dapat dibatalkan.',
            ], 400);
        }

        DB::transaction(function () use ($order) {
            // Update Order Status
            $order->update(['status' => 'cancelled']);

            // Update Payment Status
            if ($order->payment) {
                $order->payment->update(['status' => 'failed']);
            }

            // Restore Stock
            foreach ($order->items as $item) {
                if ($item->variant_id) {
                    ProductVariant::where('id', $item->variant_id)->increment('stock', $item->quantity);
                } else {
                    Product::where('id', $item->product_id)->increment('stock', $item->quantity);
                }
            }
        });

        $order->load(['payment']);

        return response()->json([
            'success' => true,
            'data'    => $order,
            'message' => 'Pesanan berhasil dibatalkan dan stok dikembalikan.',
        ]);
    }
}
