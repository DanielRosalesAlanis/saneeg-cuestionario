import { useState } from 'react';
import logo from '../assets/SANEEG-LOGO.png';
import { C } from '../constants/colors';
import { ActionButton } from '../components/ActionButton';
import { IconChevronLeft, IconAlertTriangle } from '../components/Icons';

const NOTICE_VERSION = '2026-08-09-citas-v1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const today = new Date();
today.setDate(today.getDate() - 1);
const MAX_BIRTH_DATE = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');
const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: `1.5px solid ${C.border}`, color: '#374151', background: '#fff',
};

function Field({ label, children }) {
  return <label style={{ display: 'block', marginBottom: 14 }}>
    <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 6 }}>{label}</span>
    {children}
  </label>;
}

export function Register({ onNext, onLogin, onBack }) {
  const [form, setForm] = useState({
    nombreCompleto: '', genero: '', fechaNacimiento: '', telefono: '', email: '',
    contactoEmergencia: '', codigoPostal: '', colonia: '', aceptaAviso: false,
  });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const set = (name, value) => {
    setForm(previous => ({ ...previous, [name]: value }));
    setError('');
  };
  const valid = form.nombreCompleto.trim().length >= 3
    && form.nombreCompleto.trim().length <= 150
    && form.genero && form.fechaNacimiento && form.fechaNacimiento <= MAX_BIRTH_DATE
    && /^\d{10}$/.test(form.telefono)
    && EMAIL_RE.test(form.email.trim()) && form.email.trim().length <= 255
    && form.contactoEmergencia.trim().length >= 5 && form.contactoEmergencia.trim().length <= 200
    && /^\d{5}$/.test(form.codigoPostal)
    && form.colonia.trim().length >= 2 && form.colonia.trim().length <= 150
    && form.aceptaAviso;

  function validationMessage() {
    if (form.nombreCompleto.trim().length < 3) return 'Ingresa tu nombre completo.';
    if (form.nombreCompleto.trim().length > 150) return 'El nombre no puede exceder 150 caracteres.';
    if (!form.genero) return 'Selecciona una opción de género.';
    if (!form.fechaNacimiento || form.fechaNacimiento > MAX_BIRTH_DATE) return 'Ingresa una fecha de nacimiento válida y anterior a hoy.';
    if (!/^\d{10}$/.test(form.telefono)) return 'Ingresa un teléfono de 10 dígitos.';
    if (!EMAIL_RE.test(form.email.trim()) || form.email.trim().length > 255) return 'Ingresa un correo electrónico válido.';
    if (form.contactoEmergencia.trim().length < 5 || form.contactoEmergencia.trim().length > 200) return 'Ingresa un contacto de emergencia válido.';
    if (!/^\d{5}$/.test(form.codigoPostal)) return 'Ingresa un código postal de 5 dígitos.';
    if (form.colonia.trim().length < 2 || form.colonia.trim().length > 150) return 'Ingresa una colonia válida.';
    if (!form.aceptaAviso) return 'Debes aceptar el aviso de privacidad para crear tu cuenta.';
    return '';
  }

  async function submit() {
    if (sending) return;
    if (!valid) {
      setError(validationMessage());
      return;
    }
    setSending(true); setError('');
    try {
      await onNext({
        telefono: form.telefono,
        email: form.email.trim(),
        avisoVersion: NOTICE_VERSION,
        aceptaAviso: true,
        perfil: {
          nombreCompleto: form.nombreCompleto.trim(),
          genero: form.genero,
          fechaNacimiento: form.fechaNacimiento,
          contactoEmergencia: form.contactoEmergencia.trim(),
          codigoPostal: form.codigoPostal,
          colonia: form.colonia.trim(),
        },
      });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally { setSending(false); }
  }

  return <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={onBack || onLogin} aria-label="Regresar" style={{ border: 0, background: 'none', color: C.navy }}>
        <IconChevronLeft size={22} />
      </button>
      <img src={logo} alt="SanEEG" style={{ height: 28 }} />
    </div>
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 24 }}>
      <h1 style={{ fontSize: 26, color: C.navy, marginBottom: 6 }}>Crear cuenta</h1>
      <p style={{ color: C.muted, lineHeight: 1.5, marginBottom: 22 }}>
        Estos datos se solicitan una sola vez. El código para verificar la cuenta llegará a tu correo.
      </p>
      <Field label="Nombre completo"><input autoComplete="name" maxLength={150} value={form.nombreCompleto} onChange={e => set('nombreCompleto', e.target.value)} style={inputStyle} /></Field>
      <Field label="Género">
        <select value={form.genero} onChange={e => set('genero', e.target.value)} style={inputStyle}>
          <option value="">Selecciona una opción</option><option>Mujer</option><option>Hombre</option><option>No binario</option><option>Prefiero no decirlo</option><option>Otro</option>
        </select>
      </Field>
      <Field label="Fecha de nacimiento"><input type="date" value={form.fechaNacimiento} max={MAX_BIRTH_DATE} onChange={e => set('fechaNacimiento', e.target.value)} style={inputStyle} /></Field>
      <Field label="Teléfono (10 dígitos)"><input type="tel" inputMode="numeric" autoComplete="tel" value={form.telefono} onChange={e => set('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))} style={inputStyle} /></Field>
      <Field label="Correo electrónico"><input type="email" autoComplete="email" maxLength={255} value={form.email} onChange={e => set('email', e.target.value)} style={inputStyle} /></Field>
      <Field label="Contacto de emergencia (nombre y teléfono)"><input maxLength={200} value={form.contactoEmergencia} onChange={e => set('contactoEmergencia', e.target.value)} placeholder="Nombre — 55 1234 5678" style={inputStyle} /></Field>
      <Field label="Código postal"><input inputMode="numeric" value={form.codigoPostal} onChange={e => set('codigoPostal', e.target.value.replace(/\D/g, '').slice(0, 5))} style={inputStyle} /></Field>
      <Field label="Colonia"><input autoComplete="address-level3" maxLength={150} value={form.colonia} onChange={e => set('colonia', e.target.value)} style={inputStyle} /></Field>
      <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 14, borderRadius: 10, background: C.navyLight }}>
        <input type="checkbox" checked={form.aceptaAviso} onChange={e => set('aceptaAviso', e.target.checked)} style={{ marginTop: 4 }} />
        <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          Acepto que estos datos se usen para administrar mi cuenta, gestionar citas y enviarme códigos y avisos por correo conforme al aviso de privacidad.
        </span>
      </label>
      <p style={{ textAlign: 'center', marginTop: 22, color: '#374151' }}>¿Ya tienes cuenta?{' '}
        <button onClick={onLogin} style={{ border: 0, background: 'none', color: C.navy, fontWeight: 800, textDecoration: 'underline' }}>Iniciar sesión</button>
      </p>
    </div>
    {error && <div role="alert" aria-live="polite" style={{ flexShrink: 0, padding: '12px 14px', margin: '0 24px 10px', background: '#FEF2F2', color: C.error, border: `1px solid ${C.error}33`, borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <IconAlertTriangle size={17} /> <span>{error}</span>
    </div>}
    <ActionButton label={sending ? 'Creando cuenta…' : 'Crear cuenta'} onClick={submit} disabled={sending} />
  </div>;
}
