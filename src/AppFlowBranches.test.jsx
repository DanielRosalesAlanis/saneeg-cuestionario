import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as aplicaciones from './api/aplicaciones';

vi.mock('./api/aplicaciones', () => ({
  iniciarAplicacion: vi.fn(), guardarBloque: vi.fn(), obtenerEstado: vi.fn(),
  reemitirCodigoVinculacion: vi.fn(), saveProgress: vi.fn(), loadProgress: vi.fn(), clearProgress: vi.fn(),
}));
vi.mock('./screens/Welcome', () => ({ Welcome: ({ onNext }) => <button onClick={onNext}>welcome-next</button> }));
vi.mock('./screens/Privacy', () => ({ Privacy: ({ onNext, onBack }) => <><button onClick={() => onNext({ aceptaFinalidadesSecundarias: true })}>privacy-accept</button><button onClick={onBack}>privacy-back</button></> }));
vi.mock('./screens/QuestionBlock', () => ({ QuestionBlock: ({ blockIndex, onFinish, onBack }) => <><div>block-{blockIndex}</div><button onClick={onFinish}>finish-{blockIndex}</button><button onClick={onBack}>back-{blockIndex}</button></> }));
vi.mock('./screens/Results', () => ({ Results: ({ onRegenerateCode, onProfessionals, onExit, folio }) => <><div>results-{folio?.folio}</div><button onClick={onRegenerateCode}>regenerate</button><button onClick={onProfessionals}>appointments</button><button onClick={onExit}>reset</button></> }));
vi.mock('./screens/SaveError', () => ({ SaveError: ({ message, onRetry, onBack }) => <><div>save-error-{message}</div><button onClick={onRetry}>retry</button><button onClick={onBack}>error-back</button></> }));
vi.mock('./appointments/AppointmentsRouter', () => ({ AppointmentsRouter: ({ handoff, onHandoffConsumed }) => <><div>appointments-screen-{handoff?.aplicacionId}</div><button onClick={onHandoffConsumed}>consume</button></> }));

describe('ramas del flujo principal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aplicaciones.loadProgress.mockReturnValue(null);
    window.history.replaceState({}, '', '/');
  });

  it('completa tres bloques, regenera código, entrega cita y reinicia', async () => {
    const user = userEvent.setup();
    aplicaciones.iniciarAplicacion.mockResolvedValue({ aplicacionId: 'a1' });
    aplicaciones.guardarBloque
      .mockResolvedValueOnce({ estado: 'EN_PROGRESO' })
      .mockResolvedValueOnce({ estado: 'EN_PROGRESO' })
      .mockResolvedValueOnce({ estado: 'COMPLETA', resultado: { depresionScore: 0 }, folio: { folio: 'F1' } });
    aplicaciones.reemitirCodigoVinculacion.mockResolvedValue({ folio: 'F2' });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'welcome-next' }));
    await user.click(screen.getByRole('button', { name: 'privacy-accept' }));
    for (const block of [1, 2, 3]) await user.click(await screen.findByRole('button', { name: `finish-${block}` }));
    expect(await screen.findByText('results-F1')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'regenerate' }));
    expect(await screen.findByText('results-F2')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'appointments' }));
    expect(await screen.findByText('appointments-screen-a1')).toBeVisible();
  });

  it('recupera una finalización idempotente después de 409', async () => {
    const user = userEvent.setup();
    aplicaciones.iniciarAplicacion.mockResolvedValue({ aplicacionId: 'a2' });
    aplicaciones.guardarBloque
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(Object.assign(new Error('ya completa'), { status: 409 }));
    aplicaciones.obtenerEstado.mockResolvedValue({ estado: 'COMPLETA', resultado: {}, folio: { folio: 'F409' } });
    render(<App />);
    await user.click(screen.getByText('welcome-next'));
    await user.click(screen.getByText('privacy-accept'));
    for (const block of [1, 2, 3]) await user.click(await screen.findByText(`finish-${block}`));
    expect(await screen.findByText('results-F409')).toBeVisible();
  });

  it('muestra error, permite volver y reintenta la misma operación', async () => {
    const user = userEvent.setup();
    aplicaciones.iniciarAplicacion
      .mockRejectedValueOnce(new Error('sin red'))
      .mockResolvedValueOnce({ aplicacionId: 'a3' });
    render(<App />);
    await user.click(screen.getByText('welcome-next'));
    await user.click(screen.getByText('privacy-accept'));
    expect(await screen.findByText('save-error-sin red')).toBeVisible();
    await user.click(screen.getByText('error-back'));
    expect(screen.getByText('privacy-accept')).toBeVisible();
    await user.click(screen.getByText('privacy-accept'));
    await waitFor(() => expect(aplicaciones.iniciarAplicacion).toHaveBeenCalledTimes(2));
  });

  it('reanuda completa, incompleta o descarta progreso inválido', async () => {
    aplicaciones.loadProgress.mockReturnValue({ aplicacionId: 'saved' });
    aplicaciones.obtenerEstado.mockResolvedValue({ estado: 'COMPLETA', resultado: {}, folio: { folio: 'FS' } });
    const complete = render(<App />);
    expect(await screen.findByText('results-FS')).toBeVisible();
    complete.unmount();

    aplicaciones.obtenerEstado.mockResolvedValue({ estado: 'EN_PROGRESO', bloquesGuardados: [1] });
    const partial = render(<App />);
    expect(await screen.findByText('block-2')).toBeVisible();
    partial.unmount();

    aplicaciones.obtenerEstado.mockRejectedValue(new Error('perdida'));
    render(<App />);
    expect(await screen.findByText('welcome-next')).toBeVisible();
    expect(aplicaciones.clearProgress).toHaveBeenCalled();
  });
});
