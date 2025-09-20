import { randomUUID } from 'crypto';

/**
 * Genera un UUID v4 utilizando la función nativa de Node.js crypto.randomUUID()
 * Esta función es compatible con CommonJS y ES Modules
 * 
 * @returns {string} Un UUID v4 válido
 */
export function generateUUID(): string {
  return randomUUID();
}

/**
 * Genera múltiples UUIDs de manera eficiente
 * 
 * @param {number} count - Cantidad de UUIDs a generar
 * @returns {string[]} Array de UUIDs generados
 */
export function generateMultipleUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID());
}

/**
 * Verifica si una cadena es un UUID v4 válido
 * 
 * @param {string} uuid - Cadena a validar
 * @returns {boolean} True si es un UUID v4 válido, false en caso contrario
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
