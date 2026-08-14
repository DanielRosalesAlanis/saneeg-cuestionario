import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfessionalSearch } from './ProfessionalSearch';
import * as citasApi from '../api/citas';

vi.mock('../api/citas', () => ({
  listarSedes: vi.fn(), listarTecnicos: vi.fn(), obtenerDisponibilidad: vi.fn(),
  listarCitas: vi.fn(), solicitarCita: vi.fn(), cancelarCita: vi.fn(), reagendarCita: vi.fn(),
}));

const site = { idSede: 3, nombre: 'CENIDET' };
const slot1 = { fecha: '2026-08-20', horaInicio: '10:00:00', horaFin: '11:00:00' };
const slot2 = { fecha: '2026-08-21', horaInicio: '12:00:00', horaFin: '13:00:00' };

describe('ProfessionalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    citasApi.listarSedes.mockResolvedValue([site]);
    citasApi.listarCitas.mockResolvedValue([]);
    citasApi.listarTecnicos.mockResolvedValue([{ especialidad: 'Psicología' }]);
    citasApi.obtenerDisponibilidad.mockResolvedValue([slot1, slot2]);
  });

  it('consulta disponibilidad y crea una cita', async () => {
    const user = userEvent.setup();
    citasApi.solicitarCita.mockResolvedValue({
      idCita: 'c1', aplicacionId: 'a1', idSede: 3, sedeNombre: 'CENIDET',
      fecha: slot1.fecha, hora: slot1.horaInicio, horaFin: slot1.horaFin, estado: 'PENDIENTE',
    });
    render(<ProfessionalSearch aplicacionId="a1" onBack={vi.fn()} onExit={vi.fn()} />);
    await screen.findByRole('heading', { name: 'Agenda tu estudio' });
    await user.selectOptions(screen.getByLabelText('Sede'), '3');
    await waitFor(() => expect(citasApi.obtenerDisponibilidad).toHaveBeenCalled());
    await user.selectOptions(screen.getByLabelText('Especialidad'), 'Psicología');
    await user.selectOptions(await screen.findByLabelText('Fecha'), slot1.fecha);
    await user.click(screen.getByRole('button', { name: '10:00' }));
    await user.click(screen.getByRole('button', { name: 'Solicitar cita' }));
    expect(citasApi.solicitarCita).toHaveBeenCalledWith(expect.objectContaining({
      aplicacionId: 'a1', idSede: 3, fecha: slot1.fecha, hora: slot1.horaInicio,
    }));
    expect(await screen.findByText('CITA ACTUAL')).toBeVisible();
  });

  it('reagenda y cancela una cita activa', async () => {
    const user = userEvent.setup();
    const current = {
      idCita: 'c1', aplicacionId: 'a1', idSede: 3, sedeNombre: 'CENIDET',
      fecha: slot1.fecha, hora: slot1.horaInicio, horaFin: slot1.horaFin, estado: 'APROBADA',
    };
    citasApi.listarCitas.mockResolvedValue([current]);
    citasApi.reagendarCita.mockResolvedValue({ ...current, fecha: slot2.fecha, hora: slot2.horaInicio, estado: 'PENDIENTE' });
    citasApi.cancelarCita.mockResolvedValue({ ...current, estado: 'CANCELADA' });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<ProfessionalSearch aplicacionId="a1" onBack={vi.fn()} onExit={vi.fn()} />);
    await screen.findByText('CITA ACTUAL');
    await user.click(screen.getByRole('button', { name: 'Reagendar' }));
    await user.selectOptions(await screen.findByLabelText('Fecha'), slot2.fecha);
    await user.click(screen.getByRole('button', { name: '12:00' }));
    await user.click(screen.getByRole('button', { name: 'Solicitar reagenda' }));
    expect(citasApi.reagendarCita).toHaveBeenCalledWith('c1', expect.objectContaining({ fecha: slot2.fecha }));

    citasApi.listarCitas.mockResolvedValue([current]);
    const second = render(<ProfessionalSearch aplicacionId="a1" onBack={vi.fn()} onExit={vi.fn()} />);
    await screen.findAllByText('CITA ACTUAL');
    await user.click(screen.getAllByRole('button', { name: 'Cancelar' }).at(-1));
    expect(citasApi.cancelarCita).toHaveBeenCalledWith('c1');
    second.unmount();
  });

  it('muestra fallo de carga y opciones para una evaluación usada', async () => {
    citasApi.listarSedes.mockRejectedValue(new Error('Agenda fuera de servicio'));
    const view = render(<ProfessionalSearch aplicacionId="a1" onBack={vi.fn()} onExit={vi.fn()} />);
    expect(await screen.findByText('Agenda fuera de servicio')).toBeVisible();
    view.unmount();

    citasApi.listarSedes.mockResolvedValue([site]);
    citasApi.listarCitas.mockResolvedValue([{ idCita: 'c2', aplicacionId: 'a1', estado: 'CANCELADA' }]);
    render(<ProfessionalSearch aplicacionId="a1" onBack={vi.fn()} onExit={vi.fn()} onNewEvaluation={vi.fn()} onLinkEvaluation={vi.fn()} />);
    expect(await screen.findByText(/folio anterior ya fue utilizado/i)).toBeVisible();
  });
});
