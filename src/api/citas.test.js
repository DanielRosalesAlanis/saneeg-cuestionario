import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cancelarCita, listarCitas, listarSedes, listarTecnicos, obtenerDisponibilidad,
  reagendarCita, solicitarCita,
} from './citas';
import { apiRequest } from './http';

vi.mock('./http', () => ({ apiRequest: vi.fn() }));

describe('API de citas', () => {
  beforeEach(() => { vi.clearAllMocks(); apiRequest.mockResolvedValue([]); });

  it('construye consultas y mutaciones de agenda', async () => {
    await listarSedes();
    await listarTecnicos(3);
    await obtenerDisponibilidad(3, '2026-08-15', '2026-08-20', 'Psicología');
    await obtenerDisponibilidad(3, '2026-08-15', '2026-08-20');
    await listarCitas();
    await solicitarCita({ aplicacionId: 'a1' });
    await cancelarCita('c1');
    await reagendarCita('c1', { fecha: '2026-08-20' });
    expect(apiRequest).toHaveBeenCalledTimes(8);
    expect(apiRequest).toHaveBeenCalledWith('/api/cuenta/citas/tecnicos?idSede=3');
    expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining('especialidad=Psicolog%C3%ADa'));
    expect(apiRequest).toHaveBeenCalledWith('/api/cuenta/citas/c1/cancelar', { method: 'POST' });
  });
});
