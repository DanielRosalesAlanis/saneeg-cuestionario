import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Login } from './Login';
import { Register } from './Register';
import { VerifyCode } from './VerifyCode';
import { LinkEvaluation } from './LinkEvaluation';
import { SaveError } from './SaveError';

describe('pantallas de cuenta', () => {
  it('normaliza el teléfono e inicia sesión', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Login onNext={onNext} onRegister={vi.fn()} onBack={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await user.type(input, '55a1234-5678');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(onNext).toHaveBeenCalledWith('5512345678');
  });

  it('muestra el error devuelto al iniciar sesión', async () => {
    const user = userEvent.setup();
    render(<Login onNext={vi.fn().mockRejectedValue(new Error('Cuenta no encontrada'))} onRegister={vi.fn()} onBack={vi.fn()} />);
    await user.type(screen.getByRole('textbox'), '5512345678');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Cuenta no encontrada')).toBeVisible();
  });

  it('valida y envía un registro completo', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();
    render(<Register onNext={onNext} onLogin={vi.fn()} onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Paciente Prueba' } });
    await user.selectOptions(screen.getByLabelText('Género'), 'Mujer');
    fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/), { target: { value: '5512345678' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'prueba@example.invalid' } });
    fireEvent.change(screen.getByLabelText(/Contacto de emergencia/), { target: { value: 'Contacto 5500000000' } });
    fireEvent.change(screen.getByLabelText('Código postal'), { target: { value: '62490' } });
    fireEvent.change(screen.getByLabelText('Colonia'), { target: { value: 'Palmira' } });
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({
      telefono: '5512345678', email: 'prueba@example.invalid', aceptaAviso: true,
      perfil: expect.objectContaining({ nombreCompleto: 'Paciente Prueba', codigoPostal: '62490' }),
    }));
  });

  it('explica el primer campo inválido del registro', async () => {
    const user = userEvent.setup();
    render(<Register onNext={vi.fn()} onLogin={vi.fn()} onBack={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresa tu nombre completo');
  });

  it('acepta pegado de OTP y verifica seis dígitos', async () => {
    const user = userEvent.setup();
    const onVerify = vi.fn();
    render(<VerifyCode destino="p***@example.invalid" onVerify={onVerify} onResend={vi.fn()} onBack={vi.fn()} />);
    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('123456');
    await user.click(screen.getByRole('button', { name: 'Verificar' }));
    expect(onVerify).toHaveBeenCalledWith('123456');
  });

  it('vincula credenciales prellenadas y muestra errores', async () => {
    const user = userEvent.setup();
    const onLink = vi.fn().mockRejectedValue(new Error('Código incorrecto'));
    render(<LinkEvaluation credenciales={{ folio: 'F1', codigoVinculacion: 'C1' }} onLink={onLink} onBack={vi.fn()} onLogout={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: /Vincular/i }));
    expect(onLink).toHaveBeenCalledWith('F1', 'C1');
    expect(await screen.findByText('Código incorrecto')).toBeVisible();
  });

  it('permite reintentar o volver desde error de guardado', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const back = vi.fn();
    render(<SaveError message="sin red" onRetry={retry} onBack={back} />);
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await user.click(screen.getByText('Volver'));
    expect(retry).toHaveBeenCalledOnce();
    expect(back).toHaveBeenCalledOnce();
  });
});
