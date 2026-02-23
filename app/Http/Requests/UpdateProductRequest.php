<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateProductRequest - Validación para actualización de productos
 * Autoriza solo al propietario y admin, imágenes opcionales
 */
class UpdateProductRequest extends FormRequest
{
    /**
     * Autorización: solo el propietario o admin pueden actualizar
     */
    public function authorize(): bool
    {
        $user = auth()->user();
        $product = $this->route('product');

        return auth()->check() &&
            ($user->role === 'admin' || $user->id === $product->user_id);
    }

    /**
     * Reglas de validación para actualización (usando nombres del formulario)
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'descripcion' => 'required|string|max:1000',
            'precio' => 'required|numeric|min:0|max:999999999',
            'cantidad' => 'required|integer|min:0|max:999999',
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
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'descripcion.required' => 'La descripción es obligatoria.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número válido.',
            'precio.min' => 'El precio no puede ser negativo.',
            'cantidad.required' => 'La cantidad es obligatoria.',
            'cantidad.integer' => 'La cantidad debe ser un número entero.',
            'cantidad.min' => 'La cantidad no puede ser negativa.',
            'imagenes.array' => 'Las imágenes deben ser un array válido.',
            'imagenes.max' => 'Máximo 3 imágenes permitidas.',
            'imagenes.*.image' => 'Cada archivo debe ser una imagen válida.',
            'imagenes.*.mimes' => 'Las imágenes deben ser de tipo: jpeg, png, jpg, gif.',
            'imagenes.*.max' => 'Cada imagen no debe superar los 2MB.',
        ];
    }
}
