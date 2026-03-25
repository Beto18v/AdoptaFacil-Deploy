<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('donations')) {
            return;
        }

        $this->addColumnIfMissing('status', fn (Blueprint $table) => $table->string('status')->default('completed')->after('payment_method'));
        $this->addColumnIfMissing('gateway', fn (Blueprint $table) => $table->string('gateway')->nullable()->after('status'));
        $this->addColumnIfMissing('reference', fn (Blueprint $table) => $table->string('reference')->nullable()->unique()->after('gateway'));
        $this->addColumnIfMissing('gateway_transaction_id', fn (Blueprint $table) => $table->string('gateway_transaction_id')->nullable()->unique()->after('reference'));
        $this->addColumnIfMissing('gateway_payment_method', fn (Blueprint $table) => $table->string('gateway_payment_method')->nullable()->after('gateway_transaction_id'));
        $this->addColumnIfMissing('gateway_payload', fn (Blueprint $table) => $table->json('gateway_payload')->nullable()->after('gateway_payment_method'));
        $this->addColumnIfMissing('paid_at', fn (Blueprint $table) => $table->timestamp('paid_at')->nullable()->after('gateway_payload'));
        $this->addColumnIfMissing('failed_at', fn (Blueprint $table) => $table->timestamp('failed_at')->nullable()->after('paid_at'));
        $this->addColumnIfMissing('cancelled_at', fn (Blueprint $table) => $table->timestamp('cancelled_at')->nullable()->after('failed_at'));

        $updates = [];

        if (Schema::hasColumn('donations', 'status')) {
            $updates['status'] = 'completed';
        }

        if (Schema::hasColumn('donations', 'gateway')) {
            $updates['gateway'] = 'manual';
        }

        if (Schema::hasColumn('donations', 'paid_at')) {
            $updates['paid_at'] = DB::raw('COALESCE(paid_at, created_at, CURRENT_TIMESTAMP)');
        }

        if ($updates !== []) {
            DB::table('donations')->update($updates);
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('donations')) {
            return;
        }

        if (Schema::hasColumn('donations', 'gateway_transaction_id')) {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropUnique(['gateway_transaction_id']);
            });
        }

        if (Schema::hasColumn('donations', 'reference')) {
            Schema::table('donations', function (Blueprint $table) {
                $table->dropUnique(['reference']);
            });
        }

        foreach ([
            'status',
            'gateway',
            'reference',
            'gateway_transaction_id',
            'gateway_payment_method',
            'gateway_payload',
            'paid_at',
            'failed_at',
            'cancelled_at',
        ] as $column) {
            if (! Schema::hasColumn('donations', $column)) {
                continue;
            }

            Schema::table('donations', function (Blueprint $table) use ($column) {
                $table->dropColumn($column);
            });
        }
    }

    private function addColumnIfMissing(string $column, callable $definition): void
    {
        if (Schema::hasColumn('donations', $column)) {
            return;
        }

        Schema::table('donations', $definition);
    }
};
