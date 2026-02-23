import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    // Se centralizan todos los mensajes de validación de Laravel.
    const traducciones: { [key: string]: string } = {
        'The password is incorrect.': 'La contraseña es incorrecta.',
        'The email field is required.': 'El campo de email es obligatorio.',
        'The password field must be at least 8 characters.': 'La contraseña debe tener al menos 8 caracteres.',
        'The password field confirmation does not match.': 'Las contraseñas no coinciden.',
        'These credentials do not match our records.': 'Credenciales incorrectas.',
        'The email has already been taken.': 'Correo electrónico ya en uso.',
        'The name has already been taken.': 'El nombre ya está en uso.',
        'The account number has already been taken.': 'El número de cuenta ya está en uso.',
        'The email field must be lowercase.': 'El campo de correo electrónico debe estar en minúsculas.',
        'The acepta contrato adopcion field must be accepted.': 'Debe aceptar el contrato de adopción.',
        'The acepta cuidado responsable field must be accepted.': 'Debe aceptar el cuidado responsable.',
        'The acepta proceso evaluacion field must be accepted.': 'Debe aceptar el proceso de evaluación.',
        'The imagen field is required.': 'El campo imagen es requerido',
        'The nombre field is required.': 'El campo nombre es requerido',
        'The especie field is required.': 'El campo especie es requerido',
        'The raza field is required.': 'El campo raza es requerido',
        'The edad field is required.': 'El campo edad es requerido',
        'The descripcion field is required.': 'El campo descripcion es requerido',
    };

    // Buscamos si el mensaje en inglés tiene una traducción; si no, usamos el mensaje original.
    let mensajeTraducido = message;

    if (message && traducciones[message]) {
        mensajeTraducido = traducciones[message];
    } else if (message) {
        // Manejo de casos especiales para mensajes del navegador
        if (message.includes("is missing an '@'")) {
            const parts = message.split("'");
            mensajeTraducido = `Al correo '${parts[1]}' le falta un '@'.`;
        } else if (message.includes("' is used at a wrong position in ")) {
            const parts = message.split("'");
            mensajeTraducido = `El carácter '.' está en una posición incorrecta en '${parts[3]}'.`;
        }
    }

    return mensajeTraducido ? (
        <p {...props} className={cn('text-sm text-red-600 dark:text-red-400', className)}>
            {mensajeTraducido}
        </p>
    ) : null;
}
