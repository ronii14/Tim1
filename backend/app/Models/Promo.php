<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promo extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_spend',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_spend'      => 'decimal:2',
        'is_active'      => 'boolean',
        'expires_at'     => 'datetime',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
