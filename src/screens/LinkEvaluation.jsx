import { useState } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { IconAlertTriangle, IconShield } from '../components/Icons';

const inputStyle = { width: '100%', padding: '13px 14px', borderRadius: 10, border: `1.5px solid ${C.border}`, color: C.navy };

export function LinkEvaluation({ credenciales, onLink, onBack, onLogout }) {
  const [folio, setFolio] = useState(credenciales?.folio || '');
  const [codigo, setCodigo] = useState(credenciales?.codigoVinculacion || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const valid = folio.trim() && codigo.trim();
  async function submit() {
    if (!valid || loading) return;
    setLoading(true); setError('');
    try { await onLink(folio.trim(), codigo.trim()); }
    catch (err) { setError(err.message || 'No fue posible vincular la evaluación.'); }
    finally { setLoading(false); }
  }
  return <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Header onBack={onBack} />
    <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
      <h1 style={{ color: C.navy, fontSize: 25, marginBottom: 8 }}>Vincula tu evaluación</h1>
      <p style={{ color: C.muted, lineHeight: 1.55, marginBottom: 24 }}>
        Cada folio completo permite solicitar una sola cita. Para una cita futura tendrás que contestar el cuestionario nuevamente y vincular el nuevo folio.
      </p>
      {error && <div style={{ display: 'flex', gap: 8, padding: 12, borderRadius: 10, color: C.error, background: '#FEF2F2', marginBottom: 18 }}><IconAlertTriangle size={17} />{error}</div>}
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 18 }}>Folio
        <input value={folio} onChange={e => setFolio(e.target.value.toUpperCase())} style={{ ...inputStyle, display: 'block', marginTop: 6 }} />
      </label>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.muted, marginBottom: 22 }}>Código privado
        <input value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} style={{ ...inputStyle, display: 'block', marginTop: 6 }} />
      </label>
      <div style={{ padding: 14, borderRadius: 10, background: C.navyLight, display: 'flex', gap: 10 }}>
        <IconShield size={18} style={{ color: C.navy, flexShrink: 0 }} />
        <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>La vinculación es permanente. El código se invalida después de usarse y no se comparte con el sistema clínico.</p>
      </div>
      {onLogout && <button onClick={onLogout} style={{ width: '100%', marginTop: 22, padding: 11, border: 0, background: 'none', color: C.muted, textDecoration: 'underline', cursor: 'pointer' }}>Cerrar sesión</button>}
    </div>
    <ActionButton label={loading ? 'Vinculando…' : 'Vincular y elegir horario'} onClick={submit} disabled={!valid || loading} />
  </div>;
}
