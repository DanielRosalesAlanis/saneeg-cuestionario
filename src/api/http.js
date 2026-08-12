const ACCOUNT_SESSION_KEY = 'saneeg.citas.session-token';
const ACCOUNT_SESSION_HEADER = 'X-Saneeg-Session';
const ACCOUNT_AUTH_PREFIX = '/api/cuenta/auth/';

export function clearAccountSessionToken() {
  sessionStorage.removeItem(ACCOUNT_SESSION_KEY);
}

export async function apiRequest(path, options = {}) {
  const sessionToken = sessionStorage.getItem(ACCOUNT_SESSION_KEY);
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionToken ? { [ACCOUNT_SESSION_HEADER]: sessionToken } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = { error: text }; }
  }

  const nextSessionToken = response.headers.get(ACCOUNT_SESSION_HEADER);
  if (response.ok && nextSessionToken) {
    sessionStorage.setItem(ACCOUNT_SESSION_KEY, nextSessionToken);
  }

  if (!response.ok) {
    // Los endpoints públicos de autenticación también responden 401 cuando un
    // OTP es inválido. Esa respuesta no debe borrar una sesión que otra
    // solicitud de verificación concurrente acaba de emitir.
    if (response.status === 401
      && path.startsWith('/api/cuenta/')
      && !path.startsWith(ACCOUNT_AUTH_PREFIX)) {
      clearAccountSessionToken();
    }
    const error = new Error(body?.error || body?.message || `Error del servidor (${response.status})`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}
