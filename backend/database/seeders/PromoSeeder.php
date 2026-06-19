<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Seeder;

class PromoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Promo::updateOrCreate(
            ['code' => 'DISKON10'],
            [
                'discount_type'  => 'fixed',
                'discount_value' => 10000.00,
                'min_spend'      => 50000.00,
                'is_active'      => true,
                'expires_at'     => now()->addYear(),
            ]
        );

        Promo::updateOrCreate(
            ['code' => 'HEMAT20'],
            [
                'discount_type'  => 'percentage',
                'discount_value' => 20.00, // 20%
                'min_spend'      => 30000.00,
                'is_active'      => true,
                'expires_at'     => now()->addYear(),
            ]
        );
    }
}
