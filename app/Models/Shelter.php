<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shelter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'user_id',
        'description',
        'address',
        'city',
        'latitude',
        'longitude',
        'phone',
        'bank_name',
        'account_type',
        'account_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    public function paymentMethods(): HasMany
    {
        return $this->hasMany(ShelterPaymentMethod::class);
    }

    public function activePaymentMethod(): HasOne
    {
        return $this->hasOne(ShelterPaymentMethod::class)->where('is_active', true);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereHas('user');
    }
}
