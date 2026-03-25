<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShelterPaymentMethod extends Model
{
    use HasFactory;

    public const TYPE_BANK_ACCOUNT = 'bank_account';

    public const TYPE_NEQUI = 'nequi';

    public const TYPE_DAVIPLATA = 'daviplata';

    protected $fillable = [
        'shelter_id',
        'type',
        'account_holder',
        'document_number',
        'bank_name',
        'account_type',
        'account_number',
        'phone_number',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }
}
