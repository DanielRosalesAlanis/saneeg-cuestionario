import { apiRequest } from './http';

export const listarSedes = () => apiRequest('/api/cuenta/citas/sedes');

export const listarTecnicos = idSede => {
  const query = new URLSearchParams({ idSede: String(idSede) });
  return apiRequest(`/api/cuenta/citas/tecnicos?${query}`);
};

export const obtenerDisponibilidad = (idSede, desde, hasta, especialidad) => {
  const query = new URLSearchParams({ idSede: String(idSede), desde, hasta });
  if (especialidad) query.set('especialidad', especialidad);
  return apiRequest(`/api/cuenta/citas/disponibilidad?${query}`);
};

export const listarCitas = () => apiRequest('/api/cuenta/citas');

export const solicitarCita = payload => apiRequest('/api/cuenta/citas', {
  method: 'POST', body: JSON.stringify(payload),
});

export const cancelarCita = idCita => apiRequest(`/api/cuenta/citas/${idCita}/cancelar`, {
  method: 'POST',
});

export const reagendarCita = (idCita, payload) => apiRequest(`/api/cuenta/citas/${idCita}/reagendar`, {
  method: 'POST', body: JSON.stringify(payload),
});
