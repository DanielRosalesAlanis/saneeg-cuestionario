const STORAGE_KEY = 'saneeg_aplicacion';

// Mock temporal para probar el flujo completo sin backend levantado.
// Actívalo con VITE_MOCK_BACKEND=true en .env.local (nunca en producción).
const MOCK = import.meta.env.VITE_MOCK_BACKEND === 'true';
const MOCK_DELAY_MS = 400;
const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.error || `Error del servidor (${res.status})`);
    error.status = res.status;
    throw error;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function iniciarAplicacion(avisoVersion, aceptaFinalidadesSecundarias = false) {
  if (MOCK) {
    await mockDelay();
    return {
      aplicacionId: crypto.randomUUID(),
      estado: 'EN_PROGRESO',
      bloquesGuardados: [],
      resultado: null,
      folio: null,
    };
  }
  return request('/api/aplicaciones', {
    method: 'POST',
    body: JSON.stringify({ avisoVersion, aceptaFinalidadesSecundarias }),
  });
}

export async function guardarBloque(aplicacionId, bloque, respuestas) {
  if (MOCK) {
    await mockDelay();
    return {
      aplicacionId,
      estado: bloque === 3 ? 'COMPLETA' : 'EN_PROGRESO',
      bloquesGuardados: [bloque],
      resultado: null,
      folio: bloque === 3 ? {
        folio: 'SNG-DEMO-2026',
        codigoVinculacion: 'DEMO-1234-DEMO-5678',
      } : null,
    };
  }
  return request(`/api/aplicaciones/${aplicacionId}/bloques/${bloque}`, {
    method: 'PATCH',
    body: JSON.stringify({ respuestas }),
  });
}

export async function obtenerEstado(aplicacionId) {
  if (MOCK) {
    await mockDelay();
    return {
      aplicacionId,
      estado: 'EN_PROGRESO',
      bloquesGuardados: [],
      resultado: null,
      folio: null,
    };
  }
  return request(`/api/aplicaciones/${aplicacionId}`, { method: 'GET' });
}

export async function reemitirCodigoVinculacion(aplicacionId) {
  if (MOCK) {
    await mockDelay();
    return {
      folio: 'SNG-DEMO-2026',
      codigoVinculacion: 'DEMO-1234-DEMO-5678',
    };
  }
  return request(`/api/aplicaciones/${aplicacionId}/codigo-vinculacion`, {
    method: 'POST',
  });
}

export function saveProgress(aplicacionId) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ aplicacionId }));
}

export function loadProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clearProgress() {
  sessionStorage.removeItem(STORAGE_KEY);
  // Limpia el formato legacy que contenía también el teléfono.
  localStorage.removeItem(STORAGE_KEY);
}
