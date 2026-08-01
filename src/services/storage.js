/**
 * Wrapper mínimo y seguro sobre localStorage.
 * Centraliza claves y serialización para que ningún componente toque
 * `window.localStorage` directamente.
 */

export const STORAGE_KEYS = {
  users: 'totalsleep:users',
  session: 'totalsleep:session',
  draft: 'totalsleep:draft',
};

export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn(`[storage] No se pudo leer "${key}":`, error);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`[storage] No se pudo escribir "${key}":`, error);
    return false;
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] No se pudo borrar "${key}":`, error);
  }
}

/** Simula la latencia de red para que la UI ejercite sus estados de carga. */
export function delay(ms = 550) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Identificador local mientras no exista backend. */
export function createId(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}
