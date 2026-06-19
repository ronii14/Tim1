<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * Guard name untuk Spatie + Sanctum.
     * Wajib di-set ke 'sanctum' agar kompatibel.
     */
    protected $guard_name = 'sanctum';

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function customerServiceConversations(): HasMany
    {
        return $this->hasMany(CustomerServiceConversation::class, 'customer_id');
    }

    public function assignedCustomerServiceConversations(): HasMany
    {
        return $this->hasMany(CustomerServiceConversation::class, 'assigned_admin_id');
    }

    public function customerServiceMessages(): HasMany
    {
        return $this->hasMany(CustomerServiceMessage::class, 'sender_id');
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
