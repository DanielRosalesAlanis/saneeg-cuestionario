import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Results } from './Results';

const normal = {
  depresionScore: 0, depresionSeveridad: 'Normal',
  ansiedadScore: 0, ansiedadSeveridad: 'Normal',
  estresScore: 0, estresSeveridad: 'Normal',
};

describe('Results', () => {
  it('muestra el resultado autoritativo, copia credenciales y permite continuar', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    const professionals = vi.fn();
    const exit = vi.fn();
    render(<Results data={{}} resultado={normal} folio={{ folio: 'F-1', codigoVinculacion: 'C-1' }} onRegenerateCode={vi.fn()} onProfessionals={professionals} onExit={exit} />);
    expect(screen.getAllByText('0%')).toHaveLength(3);
    expect(screen.getByText('¡Buen estado emocional!')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Copiar folio/i }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Folio: F-1'));
    await user.click(screen.getByRole('button', { name: /Buscar citas/i }));
    await user.click(screen.getByRole('button', { name: 'Salir del test' }));
    expect(professionals).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledOnce();
  });

  it('destaca niveles críticos y permite regenerar un código ausente', async () => {
    const user = userEvent.setup();
    const regenerate = vi.fn().mockResolvedValue(undefined);
    render(<Results data={{}} resultado={{
      depresionScore: 14, depresionSeveridad: 'Extremadamente severo',
      ansiedadScore: 8, ansiedadSeveridad: 'Severo',
      estresScore: 10, estresSeveridad: 'Moderado',
    }} folio={{ folio: 'F-2', codigoVinculacion: null }} onRegenerateCode={regenerate} onExit={vi.fn()} />);
    expect(screen.getByText('Te recomendamos buscar apoyo')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /Generar un código nuevo/i }));
    expect(regenerate).toHaveBeenCalledOnce();
  });

  it('usa el cálculo local como respaldo si el backend no envía resultado', () => {
    render(<Results data={{}} resultado={null} folio={null} onRegenerateCode={vi.fn()} onExit={vi.fn()} />);
    expect(screen.getAllByText('Normal')).toHaveLength(3);
  });
});
