import { useState } from 'react';
import logo from '../assets/SANEEG-LOGO.png';
import { C } from '../constants/colors';
import { ActionButton } from '../components/ActionButton';
import { IconChevronLeft, IconAlertTriangle } from '../components/Icons';

export function Login({ onNext, onRegister, onBack }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const valid = /^\d{10}$/.test(phone);
  async function submit() {
    if (!valid || sending) return;
    setSending(true); setError('');
    try { await onNext(phone); }
    catch (err) { setError(err.message || 'No se pudo iniciar sesión.'); }
    finally { setSending(false); }
  }
  return <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '22px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
      <button onClick={onBack} aria-label="Regresar" style={{ border: 0, background: 'none', color: C.navy }}><IconChevronLeft size={22} /></button>
      <img src={logo} alt="SanEEG" style={{ height: 28 }} />
    </div>
    <div style={{ flex: 1, padding: 24 }}>
      <h1 style={{ fontSize: 26, color: C.navy, margin: '12px 0 6px' }}>Bienvenido de nuevo</h1>
      <p style={{ color: C.muted, marginBottom: 28 }}>Ingresa tu teléfono. Enviaremos el código de acceso al correo registrado.</p>
      {error && <div style={{ padding: 12, background: '#FEF2F2', color: C.error, borderRadius: 10, marginBottom: 18, display: 'flex', gap: 8 }}><IconAlertTriangle size={17} />{error}</div>}
      <label style={{ fontSize: 13, fontWeight: 700, color: C.muted }}>Teléfono</label>
      <div style={{ display: 'flex', border: `1.5px solid ${C.border}`, borderRadius: 10, marginTop: 6, overflow: 'hidden' }}>
        <span style={{ padding: 14, background: C.surface, color: C.muted }}>+52</span>
        <input autoFocus type="tel" inputMode="numeric" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={e => e.key === 'Enter' && submit()} style={{ flex: 1, border: 0, padding: 14, outline: 'none' }} />
      </div>
      <p style={{ textAlign: 'center', marginTop: 28, color: '#374151' }}>¿No tienes cuenta?{' '}
        <button onClick={onRegister} style={{ border: 0, background: 'none', color: C.navy, fontWeight: 800, textDecoration: 'underline' }}>Regístrate</button>
      </p>
    </div>
    <ActionButton label={sending ? 'Enviando código…' : 'Ingresar'} onClick={submit} disabled={!valid || sending} />
  </div>;
}
