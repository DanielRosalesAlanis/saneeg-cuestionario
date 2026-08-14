import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest, clearAccountSessionToken } from './http';

const SESSION_KEY = 'saneeg.citas.session-token';

function response({ ok = true, status = 200, body = null, sessionToken = null }) {
  return {
    ok,
    status,
    headers: new Headers(sessionToken ? { 'X-Saneeg-Session': sessionToken } : {}),
    text: vi.fn().mockResolvedValue(body === null ? '' : JSON.stringify(body)),
  };
}

describe('apiRequest', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('envía la sesión existente y conserva la sesión rotada', async () => {
    sessionStorage.setItem(SESSION_KEY, 'token-anterior');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({
      body: { ok: true }, sessionToken: 'token-nuevo',
    }));

    await expect(apiRequest('/api/cuenta/me')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/cuenta/me', expect.objectContaining({
      credentials: 'include',
      headers: expect.objectContaining({ 'X-Saneeg-Session': 'token-anterior' }),
    }));
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('token-nuevo');
  });

  it('borra la sesión si una ruta protegida responde 401', async () => {
    sessionStorage.setItem(SESSION_KEY, 'caducado');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({
      ok: false, status: 401, body: { error: 'Debes iniciar sesión' },
    }));

    await expect(apiRequest('/api/cuenta/me')).rejects.toMatchObject({ status: 401 });
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('no borra una sesión al fallar la verificación pública de OTP', async () => {
    sessionStorage.setItem(SESSION_KEY, 'sesion-vigente');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response({
      ok: false, status: 401, body: { error: 'Código inválido' },
    }));

    await expect(apiRequest('/api/cuenta/auth/verificar')).rejects.toMatchObject({ status: 401 });
    expect(sessionStorage.getItem(SESSION_KEY)).toBe('sesion-vigente');
  });

  it('permite limpiar expresamente el token', () => {
    sessionStorage.setItem(SESSION_KEY, 'token');
    clearAccountSessionToken();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();
  });
});
