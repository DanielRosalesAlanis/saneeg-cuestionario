import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cerrarSesion, iniciarSesion, listarEvaluaciones, obtenerCuenta, reenviarOtp,
  registrarCuenta, verificarOtp, vincularEvaluacion,
} from './cuenta';
import { apiRequest, clearAccountSessionToken } from './http';

vi.mock('./http', () => ({ apiRequest: vi.fn(), clearAccountSessionToken: vi.fn() }));

describe('API de cuenta', () => {
  beforeEach(() => vi.clearAllMocks());

  it('construye contratos de registro, login, OTP, cuenta y vinculación', async () => {
    apiRequest.mockResolvedValue({ ok: true });
    await registrarCuenta({ telefono: '5512345678' });
    await iniciarSesion('5512345678');
    await verificarOtp('d1', '123456');
    await reenviarOtp('d1');
    await obtenerCuenta();
    await listarEvaluaciones();
    await vincularEvaluacion('F1', 'C1');
    expect(apiRequest).toHaveBeenCalledTimes(7);
    expect(apiRequest).toHaveBeenCalledWith('/api/cuenta/auth/login', expect.objectContaining({
      body: JSON.stringify({ telefono: '5512345678' }),
    }));
    expect(apiRequest).toHaveBeenLastCalledWith('/api/cuenta/evaluaciones/vincular', expect.objectContaining({
      body: JSON.stringify({ folio: 'F1', codigo: 'C1' }),
    }));
  });

  it('siempre limpia la sesión al cerrar, incluso si falla el servidor', async () => {
    apiRequest.mockRejectedValue(new Error('sin red'));
    await expect(cerrarSesion()).rejects.toThrow('sin red');
    expect(clearAccountSessionToken).toHaveBeenCalledOnce();
  });
});
