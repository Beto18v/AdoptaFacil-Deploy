<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('shelter_payment_methods')) {
            Schema::create('shelter_payment_methods', function (Blueprint $table) {
                $table->id();
                $table->foreignId('shelter_id')->constrained()->cascadeOnDelete();
                $table->string('type');
                $table->string('account_holder')->nullable();
                $table->string('document_number')->nullable();
                $table->string('bank_name')->nullable();
                $table->string('account_type')->nullable();
                $table->string('account_number')->nullable();
                $table->string('phone_number')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['shelter_id', 'is_active']);
            });
        }

        if (Schema::hasTable('shelters')) {
            $timestamp = now();
            $shelters = DB::table('shelters')
                ->whereNotNull('account_number')
                ->whereNotExists(function ($query) {
                    $query->selectRaw('1')
                        ->from('shelter_payment_methods')
                        ->whereColumn('shelter_payment_methods.shelter_id', 'shelters.id')
                        ->where('shelter_payment_methods.is_active', true);
                })
                ->get(['id', 'name', 'bank_name', 'account_type', 'account_number']);

            if (! $shelters->isEmpty()) {
                DB::table('shelter_payment_methods')->insert(
                    $shelters
                        ->map(fn (object $shelter) => [
                            'shelter_id' => $shelter->id,
                            'type' => 'bank_account',
                            'account_holder' => $shelter->name ?: 'Refugio',
                            'document_number' => null,
                            'bank_name' => $shelter->bank_name,
                            'account_type' => $shelter->account_type,
                            'account_number' => $shelter->account_number,
                            'phone_number' => null,
                            'is_active' => true,
                            'created_at' => $timestamp,
                            'updated_at' => $timestamp,
                        ])
                        ->all(),
                );
            }
        }

        if (! Schema::hasTable('donations') || ! Schema::hasColumn('donations', 'reference')) {
            return;
        }

        DB::table('donations')
            ->whereNull('reference')
            ->lazyById()
            ->each(function (object $donation): void {
                DB::table('donations')
                    ->where('id', $donation->id)
                    ->update([
                        'reference' => 'legacy-' . Str::upper((string) Str::ulid()),
                    ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('shelter_payment_methods');
    }
};
