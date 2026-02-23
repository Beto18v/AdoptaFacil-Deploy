/**
 * Utilidades para manejo de avatares de usuario
 */

/**
 * Construye la URL completa del avatar de un usuario
 * @param avatar - Ruta del avatar almacenada en la base de datos
 * @returns URL completa del avatar o undefined si no existe
 */
export function getAvatarUrl(avatar?: string): string | undefined {
    if (!avatar) return undefined;
    return `/storage/${avatar}`;
}

/**
 * Genera las iniciales de un nombre de usuario
 * @param name - Nombre completo del usuario
 * @returns Iniciales en mayúsculas (máximo 2 caracteres)
 */
export function getUserInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
