<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateMascotaRequest - Validación para actualización de mascotas
 * Autoriza solo al propietario y admin, imágenes opcionales
 */
class UpdateMascotaRequest extends FormRequest
{
    /**
     * Autorización: solo el propietario o admin pueden actualizar
     */
    public function authorize(): bool
    {
        $user = auth()->user();
        $mascota = $this->route('mascota');

        return auth()->check() &&
            ($user->role === 'admin' || $user->role === 'aliado' || $user->id === $mascota->user_id);
    }

    /**
     * Reglas de validación para actualización (imágenes opcionales)
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
            'imagenes' => 'nullable|array|max:3', // Imágenes opcionales en actualización
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB máximo c/u
        ];
    }

    /**
     * Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la mascota es obligatorio.',
            'especie.required' => 'La especie es obligatoria.',
            'raza.required' => 'La raza es obligatoria.',
            'fecha_nacimiento.required' => 'La fecha de nacimiento es obligatoria.',
            'fecha_nacimiento.before_or_equal' => 'La fecha de nacimiento no puede ser futura.',
            'sexo.required' => 'El sexo es obligatorio.',
            'sexo.in' => 'El sexo debe ser Macho o Hembra.',
            'ciudad.required' => 'La ciudad es obligatoria.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'imagenes.array' => 'Las imágenes deben ser un array válido.',
            'imagenes.max' => 'Máximo 3 imágenes permitidas.',
            'imagenes.*.image' => 'Cada archivo debe ser una imagen válida.',
            'imagenes.*.mimes' => 'Las imágenes deben ser de tipo: jpeg, png, jpg, gif.',
            'imagenes.*.max' => 'Cada imagen no debe superar los 2MB.',
        ];
    }
}
