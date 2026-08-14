import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import * as aplicaciones from './api/aplicaciones';

vi.mock('./api/aplicaciones', () => ({
  iniciarAplicacion: vi.fn(),
  guardarBloque: vi.fn(),
  obtenerEstado: vi.fn(),
  reemitirCodigoVinculacion: vi.fn(),
  saveProgress: vi.fn(),
  loadProgress: vi.fn(() => null),
  clearProgress: vi.fn(),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aplicaciones.loadProgress.mockReturnValue(null);
    window.history.replaceState({}, '', '/');
  });

  it('navega de bienvenida al aviso y crea una evaluación tras el consentimiento', async () => {
    const user = userEvent.setup();
    aplicaciones.iniciarAplicacion.mockResolvedValue({ aplicacionId: 'app-test' });
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Iniciar test' }));
    expect(screen.getByRole('heading', { name: 'Aviso de Privacidad' })).toBeInTheDocument();
    await user.click(screen.getByText('Doy mi consentimiento expreso*'));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(aplicaciones.iniciarAplicacion)
      .toHaveBeenCalledWith('2026-08-09-citas-v1', false));
    expect(aplicaciones.saveProgress).toHaveBeenCalledWith('app-test');
    expect(screen.getByText(/interesado\(a\).*Depresión/i)).toBeInTheDocument();
  });

  it('descarta progreso inaccesible y vuelve a bienvenida', async () => {
    aplicaciones.loadProgress.mockReturnValue({ aplicacionId: 'perdida' });
    aplicaciones.obtenerEstado.mockRejectedValue(new Error('Sesión no encontrada'));
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Bienvenido/a' })).toBeInTheDocument();
    expect(aplicaciones.clearProgress).toHaveBeenCalled();
  });
});
