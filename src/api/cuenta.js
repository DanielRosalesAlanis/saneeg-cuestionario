import { apiRequest, clearAccountSessionToken } from './http';

export const registrarCuenta = payload => apiRequest('/api/cuenta/auth/registro', {
  method: 'POST', body: JSON.stringify(payload),
});

export const iniciarSesion = telefono => apiRequest('/api/cuenta/auth/login', {
  method: 'POST', body: JSON.stringify({ telefono }),
});

export const verificarOtp = (desafioId, codigo) => apiRequest('/api/cuenta/auth/verificar', {
  method: 'POST', body: JSON.stringify({ desafioId, codigo }),
});

export const reenviarOtp = desafioId => apiRequest('/api/cuenta/auth/reenviar', {
  method: 'POST', body: JSON.stringify({ desafioId }),
});

export const obtenerCuenta = () => apiRequest('/api/cuenta/me');

export const listarEvaluaciones = () => apiRequest('/api/cuenta/evaluaciones');

export const vincularEvaluacion = (folio, codigo) => apiRequest('/api/cuenta/evaluaciones/vincular', {
  method: 'POST', body: JSON.stringify({ folio, codigo }),
});

export async function cerrarSesion() {
  try { return await apiRequest('/api/cuenta/auth/logout', { method: 'POST' }); }
  finally { clearAccountSessionToken(); }
}
