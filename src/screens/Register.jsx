import { useState, useRef, useEffect } from 'react';
import logo from '../assets/SANEEG-LOGO.png';
import { C } from '../constants/colors';
import { ActionButton } from '../components/ActionButton';
import { IconChevronLeft } from '../components/Icons';

const INPUT_STYLE = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  fontSize: 15,
  color: '#374151',
  outline: 'none',
  background: '#FFFFFF',
  transition: 'border-color 0.2s',
  marginBottom: 4,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Register({ onNext, onLogin }) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [touched,  setTouched]  = useState({});
  const phoneRef = useRef(null);

  useEffect(() => { phoneRef.current?.focus(); }, []);

  const phoneOk = /^\d{10}$/.test(phone.replace(/\s|-/g, ''));
  const emailOk = EMAIL_RE.test(email.trim());
  const valid   = phoneOk && emailOk;

  const err = (field) => {
    if (!touched[field]) return null;
    if (field === 'phone' && !phoneOk)  return 'Ingresa un número de 10 dígitos';
    if (field === 'email' && !emailOk)  return 'Ingresa un correo válido';
    return null;
  };

  const fieldStyle = (field) => ({
    ...INPUT_STYLE,
    borderColor: err(field) ? C.error : touched[field] && !err(field) ? C.teal : C.border,
  });

  function handleNext() {
    if (valid) onNext(phone.replace(/\s|-/g, ''), email.trim());
  }

  return (
    <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#FFFFFF' }}>
      <div style={{ flexShrink: 0, padding: '24px 24px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onLogin}
          aria-label="Regresar"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.navy, display: 'flex', opacity: 0.7, padding: 0 }}
        ><IconChevronLeft size={22} /></button>
        <img src={logo} alt="SanEEG" style={{ height: 28, width: 'auto' }} />
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', marginBottom: 6 }}>
            Crear tu cuenta
          </h1>
          <p style={{ fontSize: 15, color: '#374151' }}>
            Ingresa tu número y tu correo — te mandaremos un código para verificarlo.
          </p>
        </div>

        {/* Phone */}
        <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>
          Número de teléfono
        </label>
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex', alignItems: 'stretch',
            border: `1.5px solid ${fieldStyle('phone').borderColor}`, borderRadius: 10,
            overflow: 'hidden', background: '#FFFFFF', transition: 'border-color 0.2s',
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 12px', fontSize: 15, color: C.muted, fontWeight: 600,
              borderRight: `1.5px solid ${C.border}`, background: C.surface, flexShrink: 0,
            }}>+52</span>
            <input
              ref={phoneRef}
              type="tel"
              inputMode="numeric"
              placeholder="55 1234 5678"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onBlur={() => setTouched(t => ({ ...t, phone: true }))}
              style={{ ...fieldStyle('phone'), flex: 1, border: 'none', borderRadius: 0, marginBottom: 0 }}
            />
          </div>
          {err('phone') && (
            <p style={{ color: C.error, fontSize: 12, marginTop: 4 }}>{err('phone')}</p>
          )}
        </div>

        {/* Email */}
        <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6 }}>
          Correo electrónico
        </label>
        <div style={{ marginBottom: 4 }}>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            style={fieldStyle('email')}
          />
        </div>
        {err('email') && <p style={{ color: C.error, fontSize: 12, marginBottom: 4 }}>{err('email')}</p>}

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 15, color: '#374151' }}>
          ¿Ya tienes cuenta?{' '}
          <span
            onClick={onLogin}
            style={{ color: C.navy, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Iniciar sesión
          </span>
        </p>
      </div>

      <ActionButton label="Crear cuenta" onClick={handleNext} disabled={!valid} />
    </div>
  );
}
