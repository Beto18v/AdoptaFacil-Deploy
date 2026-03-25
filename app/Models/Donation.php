<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Donation extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_FAILED = 'failed';

    public const GATEWAY_WOMPI = 'wompi';

    public const GATEWAY_MANUAL = 'manual';

    protected $fillable = [
        'donor_name',
        'donor_email',
        'amount',
        'shelter_id',
        'description',
        'payment_method',
        'status',
        'gateway',
        'reference',
        'gateway_transaction_id',
        'gateway_payment_method',
        'gateway_payload',
        'paid_at',
        'failed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gateway_payload' => 'array',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    /**
     * @return array<int, string>
     */
    public static function finalStatuses(): array
    {
        return [
            self::STATUS_COMPLETED,
            self::STATUS_CANCELLED,
            self::STATUS_FAILED,
        ];
    }

    public function isImported(): bool
    {
        return $this->shelter_id !== null && $this->donor_email === null;
    }

    public function getDonorDisplayName(): string
    {
        if ($this->isImported()) {
            return $this->donor_name ?: 'Donante importado';
        }

        return $this->donor_name;
    }
}
