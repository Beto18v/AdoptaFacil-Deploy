<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreMascotaRequest - Validación para registro de mascotas
 * Autoriza solo usuarios aliados y valida datos + múltiples imágenes
 */
class StoreMascotaRequest extends FormRequest
{
    /**
     * Autorización: solo aliados pueden registrar mascotas
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->role === 'aliado';
    }

    /**
     * Reglas de validación para mascota y sus imágenes (1-3)
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'especie' => 'required|string|max:100',
            'raza' => 'required|string|max:100',
            'fecha_nacimiento' => 'required|date|before_or_equal:today|after:1970-01-01',
            'sexo' => 'required|string|in:Macho,Hembra',
            'ciudad' => 'required|string|max:100',
            'descripcion' => 'required|string|max:1000',
            'imagenes' => 'required|array|min:1|max:3', // 1-3 imágenes obligatorias
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB máximo c/u
        ];
    }

    /**
     * Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'fecha_nacimiento.after' => 'La fecha de nacimiento debe ser posterior a 1970.',
        ];
    }
}
