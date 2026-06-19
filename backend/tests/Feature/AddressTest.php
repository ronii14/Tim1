<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_user_can_create_address(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'label'        => 'Rumah',
            'recipient'    => 'John Doe',
            'phone'        => '08123456789',
            'province'     => 'DKI Jakarta',
            'city'         => 'Jakarta Selatan',
            'district'     => 'Kebon Baru',
            'postal_code'  => '12830',
            'full_address' => 'Jl. Tebet Dalam No. 15',
            'is_default'   => false, // Will become true because it is the first address
        ];

        $response = $this->postJson('/api/addresses', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.label', 'Rumah')
            ->assertJsonPath('data.is_default', true); // Automitically set to true

        $this->assertDatabaseHas('addresses', [
            'user_id'    => $this->user->id,
            'recipient'  => 'John Doe',
            'is_default' => true,
        ]);
    }

    public function test_creating_new_default_address_unsets_previous_default(): void
    {
        Sanctum::actingAs($this->user);

        // Create first address (will be default)
        $address1 = Address::create([
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

        $payload = [
            'label'        => 'Kantor',
            'recipient'    => 'John Doe Office',
            'phone'        => '08123456789',
            'province'     => 'DKI Jakarta',
            'city'         => 'Jakarta Pusat',
            'district'     => 'Gambir',
            'postal_code'  => '10110',
            'full_address' => 'Gedung Balai Kota',
            'is_default'   => true,
        ];

        $response = $this->postJson('/api/addresses', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_default', true);

        // Check database
        $this->assertDatabaseHas('addresses', [
            'id'         => $address1->id,
            'is_default' => false,
        ]);

        $this->assertDatabaseHas('addresses', [
            'label'      => 'Kantor',
            'is_default' => true,
        ]);
    }

    public function test_user_can_list_addresses(): void
    {
        Sanctum::actingAs($this->user);

        Address::create([
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

        Address::create([
            'user_id'      => $this->user->id,
            'label'        => 'Kos',
            'recipient'    => 'John Doe',
            'phone'        => '08123456789',
            'province'     => 'Jawa Barat',
            'city'         => 'Bandung',
            'district'     => 'Coblong',
            'postal_code'  => '40132',
            'full_address' => 'Jl. Dago No. 10',
            'is_default'   => false,
        ]);

        $response = $this->getJson('/api/addresses');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data');
    }

    public function test_user_can_show_address(): void
    {
        Sanctum::actingAs($this->user);

        $address = Address::create([
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

        $response = $this->getJson("/api/addresses/{$address->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $address->id);
    }

    public function test_user_can_update_address(): void
    {
        Sanctum::actingAs($this->user);

        $address = Address::create([
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

        $payload = [
            'label'     => 'Rumah Baru',
            'recipient' => 'John Doe updated',
        ];

        $response = $this->putJson("/api/addresses/{$address->id}", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.label', 'Rumah Baru')
            ->assertJsonPath('data.recipient', 'John Doe updated');

        $this->assertDatabaseHas('addresses', [
            'id'        => $address->id,
            'label'     => 'Rumah Baru',
            'recipient' => 'John Doe updated',
        ]);
    }

    public function test_user_can_delete_address(): void
    {
        Sanctum::actingAs($this->user);

        $address = Address::create([
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

        $response = $this->deleteJson("/api/addresses/{$address->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
        ]);
    }
}
