import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearProgress, guardarBloque, iniciarAplicacion, loadProgress,
  obtenerEstado, reemitirCodigoVinculacion, saveProgress,
} from './aplicaciones';

function fetchResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    text: vi.fn().mockResolvedValue(body === null ? '' : JSON.stringify(body)),
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('API de aplicaciones', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('construye los cuatro contratos HTTP del cuestionario', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(fetchResponse({ aplicacionId: 'a1' }))
      .mockResolvedValueOnce(fetchResponse({ estado: 'EN_PROGRESO' }))
      .mockResolvedValueOnce(fetchResponse({ estado: 'EN_PROGRESO' }))
      .mockResolvedValueOnce(fetchResponse({ folio: 'F1', codigoVinculacion: 'C1' }));

    await iniciarAplicacion('v1', true);
    await guardarBloque('a1', 2, { dass_1: 'x' });
    await obtenerEstado('a1');
    await reemitirCodigoVinculacion('a1');

    expect(fetchMock.mock.calls.map(call => [call[0], call[1].method])).toEqual([
      ['/api/aplicaciones', 'POST'],
      ['/api/aplicaciones/a1/bloques/2', 'PATCH'],
      ['/api/aplicaciones/a1', 'GET'],
      ['/api/aplicaciones/a1/codigo-vinculacion', 'POST'],
    ]);
  });

  it('propaga el mensaje y estatus del servidor', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(fetchResponse(
      { error: 'Bloque inválido' }, { ok: false, status: 400 },
    ));
    await expect(guardarBloque('a1', 4, {})).rejects.toMatchObject({
      message: 'Bloque inválido', status: 400,
    });
  });

  it('maneja progreso de sesión y limpia el formato legacy', () => {
    localStorage.setItem('saneeg_aplicacion', 'legacy');
    saveProgress('a1');
    expect(loadProgress()).toEqual({ aplicacionId: 'a1' });
    expect(localStorage.getItem('saneeg_aplicacion')).toBeNull();
    clearProgress();
    expect(loadProgress()).toBeNull();
  });

  it('tolera progreso corrupto', () => {
    sessionStorage.setItem('saneeg_aplicacion', '{');
    expect(loadProgress()).toBeNull();
  });
});
