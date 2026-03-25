<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use App\Models\Shelter;
use App\Models\ShelterPaymentMethod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ShelterController extends Controller
{
    public function index(Request $request)
    {
        $cityFilter = (string) Str::of((string) $request->query('ciudad'))->trim()->squish();
        $selectedCity = $cityFilter !== '' ? $cityFilter : null;

        $shelters = Shelter::query()
            ->visible()
            ->with('user')
            ->withCount([
                'donations as donations_count' => fn ($query) => $query->where('status', Donation::STATUS_COMPLETED),
            ])
            ->orderBy('donations_count', 'desc')
            ->get()
            ->map(function (Shelter $shelter) {
                $shelter->city = (string) Str::of((string) $shelter->city)->trim()->squish();

                return $shelter;
            });

        if ($cityFilter !== '') {
            $shelters = $shelters
                ->filter(fn (Shelter $shelter) => Str::lower($shelter->city) === Str::lower($cityFilter))
                ->values();

            $selectedCity = $shelters->first()?->city ?? $selectedCity;
        }

        return Inertia::render('refugios', [
            'shelters' => $shelters,
            'selectedCity' => $selectedCity,
        ]);
    }

    public function create()
    {
        return Inertia::render('shelter/register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validatedData = $this->validateShelter($request);
        $validatedData['user_id'] = Auth::id();

        $shelter = Shelter::create($this->extractShelterAttributes($validatedData));

        $this->syncPaymentMethod($shelter, $validatedData);

        return redirect()->route('donaciones.index')->with('success', 'Tu fundacion ha sido registrada exitosamente.');
    }

    public function update(Request $request, Shelter $shelter): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user && ($user->id === $shelter->user_id || $user->role === 'admin'), 403);

        $validatedData = $this->validateShelter($request, $shelter);

        $shelter->update($this->extractShelterAttributes($validatedData));

        $this->syncPaymentMethod($shelter, $validatedData);

        return redirect()->route('donaciones.index')->with('success', 'El metodo de recepcion del refugio fue actualizado.');
    }

    public function topShelters()
    {
        $shelters = Shelter::query()
            ->visible()
            ->select('shelters.*')
            ->selectSub(function ($query) {
                $query->from('mascotas')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn('mascotas.user_id', 'shelters.user_id');
            }, 'mascotas_count')
            ->orderBy('mascotas_count', 'desc')
            ->limit(5)
            ->with('user')
            ->get()
            ->map(function ($shelter) {
                return [
                    'id' => $shelter->id,
                    'name' => $shelter->name,
                    'avatarUrl' => $shelter->user?->avatar ? asset('storage/'.$shelter->user->avatar) : '',
                    'mascotas' => $shelter->mascotas_count,
                    'link' => route('refugios'),
                ];
            });

        return response()->json($shelters);
    }

    /**
     * @return array<string, mixed>
     */
    private function validateShelter(Request $request, ?Shelter $shelter = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('shelters', 'name')->ignore($shelter)],
            'description' => 'required|string|max:1000',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'payment_receiver_type' => ['required', Rule::in([
                ShelterPaymentMethod::TYPE_BANK_ACCOUNT,
                ShelterPaymentMethod::TYPE_NEQUI,
                ShelterPaymentMethod::TYPE_DAVIPLATA,
            ])],
            'bank_name' => [
                Rule::requiredIf(fn () => $request->input('payment_receiver_type') === ShelterPaymentMethod::TYPE_BANK_ACCOUNT),
                'nullable',
                'string',
                'max:100',
            ],
            'account_type' => [
                Rule::requiredIf(fn () => $request->input('payment_receiver_type') === ShelterPaymentMethod::TYPE_BANK_ACCOUNT),
                'nullable',
                Rule::in(['Ahorros', 'Corriente']),
            ],
            'account_number' => [
                Rule::requiredIf(fn () => $request->input('payment_receiver_type') === ShelterPaymentMethod::TYPE_BANK_ACCOUNT),
                'nullable',
                'string',
                'max:50',
                Rule::unique('shelters', 'account_number')->ignore($shelter),
            ],
            'payment_receiver_phone' => [
                Rule::requiredIf(fn () => in_array(
                    $request->input('payment_receiver_type'),
                    [ShelterPaymentMethod::TYPE_NEQUI, ShelterPaymentMethod::TYPE_DAVIPLATA],
                    true,
                )),
                'nullable',
                'string',
                'max:20',
            ],
            'account_holder' => 'required|string|max:255',
            'document_number' => 'nullable|string|max:50',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);
    }

    /**
     * @param  array<string, mixed>  $validatedData
     * @return array<string, mixed>
     */
    private function extractShelterAttributes(array $validatedData): array
    {
        $isBankAccount = $validatedData['payment_receiver_type'] === ShelterPaymentMethod::TYPE_BANK_ACCOUNT;

        $attributes = [
            'name' => $validatedData['name'],
            'description' => $validatedData['description'],
            'address' => (string) Str::of($validatedData['address'])->trim()->squish(),
            'city' => (string) Str::of($validatedData['city'])->trim()->squish(),
            'phone' => (string) Str::of($validatedData['phone'])->trim()->squish(),
            'latitude' => $validatedData['latitude'],
            'longitude' => $validatedData['longitude'],
            'bank_name' => $isBankAccount ? $validatedData['bank_name'] : null,
            'account_type' => $isBankAccount ? $validatedData['account_type'] : null,
            'account_number' => $isBankAccount ? $validatedData['account_number'] : null,
        ];

        if (array_key_exists('user_id', $validatedData)) {
            $attributes['user_id'] = $validatedData['user_id'];
        }

        return $attributes;
    }

    /**
     * @param  array<string, mixed>  $validatedData
     */
    private function syncPaymentMethod(Shelter $shelter, array $validatedData): void
    {
        $attributes = [
            'type' => $validatedData['payment_receiver_type'],
            'account_holder' => $validatedData['account_holder'],
            'document_number' => $validatedData['document_number'] ?? null,
            'bank_name' => $validatedData['payment_receiver_type'] === ShelterPaymentMethod::TYPE_BANK_ACCOUNT
                ? $validatedData['bank_name']
                : null,
            'account_type' => $validatedData['payment_receiver_type'] === ShelterPaymentMethod::TYPE_BANK_ACCOUNT
                ? $validatedData['account_type']
                : null,
            'account_number' => $validatedData['payment_receiver_type'] === ShelterPaymentMethod::TYPE_BANK_ACCOUNT
                ? $validatedData['account_number']
                : null,
            'phone_number' => in_array(
                $validatedData['payment_receiver_type'],
                [ShelterPaymentMethod::TYPE_NEQUI, ShelterPaymentMethod::TYPE_DAVIPLATA],
                true,
            )
                ? ($validatedData['payment_receiver_phone'] ?? null)
                : null,
            'is_active' => true,
        ];

        $currentMethod = $shelter->paymentMethods()
            ->where('is_active', true)
            ->latest('id')
            ->first();

        if ($currentMethod) {
            $currentMethod->update($attributes);
        } else {
            $currentMethod = $shelter->paymentMethods()->create($attributes);
        }

        $shelter->paymentMethods()
            ->whereKeyNot($currentMethod->id)
            ->update(['is_active' => false]);
    }
}
