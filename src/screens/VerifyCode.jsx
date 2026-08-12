import { useState, useRef, useEffect } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { IconMessage, IconShield, IconAlertTriangle } from '../components/Icons';

const OTP_LENGTH = 6;

export function VerifyCode({ destino, onVerify, onResend, onBack }) {
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(60);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef([]);
  const verifyingRef = useRef(false);
  const sendingRef = useRef(false);

  const valid = digits.every(d => d !== '');
  const canResend = seconds <= 0;

  // Timer countdown
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  async function submit(codigo) {
    if (verifyingRef.current || !/^\d{6}$/.test(codigo)) return;
    verifyingRef.current = true;
    setVerifying(true);
    setError('');
    try {
      await onVerify(codigo);
    } catch (err) {
      setError(err.message || 'Código inválido o expirado');
      setDigits(Array(OTP_LENGTH).fill(''));
      refs.current[0]?.focus();
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  }

  function change(i, val) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < OTP_LENGTH - 1) refs.current[i + 1]?.focus();
  }

  function keyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function paste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (text.length === OTP_LENGTH) {
      e.preventDefault();
      setDigits(text.split(''));
      refs.current[OTP_LENGTH - 1]?.focus();
    }
  }

  async function resend() {
    if (!canResend || sendingRef.current || verifyingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError('');
    try {
      await onResend();
      setSeconds(60);
      setDigits(Array(OTP_LENGTH).fill(''));
      refs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el código');
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header onBack={onBack} />

      <div style={{ flex: 1, minHeight: 0, padding: '28px 24px', overflowY: 'auto' }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: C.tealLight, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: C.teal, marginBottom: 20,
        }}>
          <IconMessage size={28} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Verifica tu correo
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.65, marginBottom: 36 }}>
          Enviamos un código de {OTP_LENGTH} dígitos a {destino || 'tu correo'}. Ingrésalo para continuar.
        </p>

        {error && (
          <div style={{
            padding: '12px 14px', borderRadius: 10, background: '#FEF2F2',
            border: `1px solid ${C.error}33`, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ color: C.error, display: 'flex', flexShrink: 0, marginTop: 1 }}><IconAlertTriangle size={16} /></span>
            <p style={{ fontSize: 14, color: C.error }}>{error}</p>
          </div>
        )}

        {/* OTP boxes */}
        <div
          style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 32 }}
          onPaste={paste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => (refs.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={d}
              disabled={verifying}
              onChange={e => change(i, e.target.value)}
              onKeyDown={e => keyDown(i, e)}
              style={{
                width: 48,
                height: 58,
                borderRadius: 12,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: 700,
                color: C.navy,
                border: `2px solid ${d ? C.navy : C.border}`,
                outline: 'none',
                background: d ? C.navyLight : C.white,
                transition: 'all 0.15s',
                boxShadow: d ? `0 0 0 3px ${C.teal}22` : 'none',
              }}
            />
          ))}
        </div>

        {/* Resend */}
        <div style={{ textAlign: 'center' }}>
          {canResend ? (
            <span
              onClick={resend}
              style={{
                fontSize: 15, color: C.teal, fontWeight: 700, cursor: 'pointer',
                textDecoration: 'underline', textUnderlineOffset: 3,
                opacity: sending ? 0.5 : 1,
              }}
            >
              {sending ? 'Enviando…' : 'Reenviar código'}
            </span>
          ) : (
            <p style={{ fontSize: 14, color: C.muted }}>
              Reenviar en{' '}
              <span style={{ color: C.navy, fontWeight: 700 }}>{seconds}s</span>
            </p>
          )}
        </div>

        {/* Privacy note */}
        <div style={{
          marginTop: 32, padding: '12px 14px', borderRadius: 10,
          background: C.navyLight, display: 'flex', gap: 10,
        }}>
          <span style={{ display: 'flex', color: C.navy, flexShrink: 0, marginTop: 1 }}><IconShield size={16} /></span>
          <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>
            El código es de un solo uso y expira en 10 minutos. Nunca lo compartas con nadie.
          </p>
        </div>
      </div>

      <ActionButton
        label={verifying ? 'Verificando…' : 'Verificar'}
        onClick={() => submit(digits.join(''))}
        disabled={!valid || verifying}
      />
    </div>
  );
}
