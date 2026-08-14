import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsRouter } from './AppointmentsRouter';
import * as cuentaApi from '../api/cuenta';

vi.mock('../api/cuenta', () => ({
  cerrarSesion: vi.fn(), iniciarSesion: vi.fn(), listarEvaluaciones: vi.fn(), obtenerCuenta: vi.fn(),
  reenviarOtp: vi.fn(), registrarCuenta: vi.fn(), verificarOtp: vi.fn(), vincularEvaluacion: vi.fn(),
}));
vi.mock('../screens/Login', () => ({ Login: ({ onNext, onRegister }) => <><button onClick={() => onNext('5512345678')}>login</button><button onClick={onRegister}>register-route</button></> }));
vi.mock('../screens/Register', () => ({ Register: ({ onNext, onLogin }) => <><button onClick={() => onNext({ telefono: '5512345678' })}>register</button><button onClick={onLogin}>login-route</button></> }));
vi.mock('../screens/VerifyCode', () => ({ VerifyCode: ({ onVerify, onResend }) => <><button onClick={() => onVerify('123456')}>verify</button><button onClick={onResend}>resend</button></> }));
vi.mock('../screens/LinkEvaluation', () => ({ LinkEvaluation: ({ onLink, onLogout }) => <><button onClick={() => onLink('F1', 'C1')}>link</button><button onClick={onLogout}>logout-link</button></> }));
vi.mock('../screens/ProfessionalSearch', () => ({ ProfessionalSearch: ({ onExit, onLinkEvaluation, onNewEvaluation }) => <><div>professional</div><button onClick={onExit}>logout-professional</button><button onClick={onLinkEvaluation}>link-route</button><button onClick={onNewEvaluation}>new-evaluation</button></> }));

function renderRouter(path, props = {}) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/citas/*" element={<AppointmentsRouter handoff={null} onHandoffConsumed={vi.fn()} {...props} />} />
    <Route path="/" element={<div>root</div>} />
  </Routes></MemoryRouter>);
}

describe('AppointmentsRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    cuentaApi.obtenerCuenta.mockResolvedValue({ idUsuario: 1 });
    cuentaApi.listarEvaluaciones.mockResolvedValue([{ aplicacionId: 'a1', folio: 'F1', usadaParaCita: false }]);
    cuentaApi.cerrarSesion.mockResolvedValue(null);
  });

  it('inicia sesión, conserva desafío y verifica OTP', async () => {
    const user = userEvent.setup();
    cuentaApi.iniciarSesion.mockResolvedValue({ desafioId: 'd1', destino: 'p***' });
    cuentaApi.verificarOtp.mockResolvedValue({ idUsuario: 1 });
    renderRouter('/citas/acceso');
    await user.click(screen.getByRole('button', { name: 'login' }));
    expect(await screen.findByRole('button', { name: 'verify' })).toBeVisible();
    expect(JSON.parse(sessionStorage.getItem('saneeg.citas.otp-challenge'))).toMatchObject({ desafioId: 'd1' });
    await user.click(screen.getByRole('button', { name: 'verify' }));
    expect(cuentaApi.verificarOtp).toHaveBeenCalledWith('d1', '123456');
    expect(await screen.findByText('professional')).toBeVisible();
  });

  it('registra, reenvía OTP y navega a verificación', async () => {
    const user = userEvent.setup();
    cuentaApi.registrarCuenta.mockResolvedValue({ desafioId: 'd2', destino: 'r***' });
    cuentaApi.reenviarOtp.mockResolvedValue({ desafioId: 'd3', destino: 'r***' });
    renderRouter('/citas/registro');
    await user.click(screen.getByRole('button', { name: 'register' }));
    await user.click(await screen.findByRole('button', { name: 'resend' }));
    expect(cuentaApi.reenviarOtp).toHaveBeenCalledWith('d2');
  });

  it('vincula credenciales entregadas y consume el handoff', async () => {
    const user = userEvent.setup();
    const consumed = vi.fn();
    cuentaApi.vincularEvaluacion.mockResolvedValue({ aplicacionId: 'a1' });
    renderRouter('/citas/vincular', {
      handoff: { credenciales: { folio: 'F1', codigoVinculacion: 'C1' }, aplicacionId: 'a1' },
      onHandoffConsumed: consumed,
    });
    await user.click(await screen.findByRole('button', { name: 'link' }));
    expect(cuentaApi.vincularEvaluacion).toHaveBeenCalledWith('F1', 'C1');
    expect(consumed).toHaveBeenCalled();
  });

  it('redirige al acceso cuando la sesión expira y permite cerrar sesión', async () => {
    cuentaApi.obtenerCuenta.mockRejectedValue(Object.assign(new Error('expirada'), { status: 401 }));
    renderRouter('/citas');
    expect(await screen.findByRole('button', { name: 'login' })).toBeVisible();

    cuentaApi.obtenerCuenta.mockResolvedValue({ idUsuario: 1 });
    const user = userEvent.setup();
    renderRouter('/citas');
    await user.click(await screen.findByRole('button', { name: 'logout-professional' }));
    await waitFor(() => expect(cuentaApi.cerrarSesion).toHaveBeenCalled());
  });
});
