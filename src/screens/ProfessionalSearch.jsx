import { useEffect, useMemo, useState } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { listarSedes, listarTecnicos, obtenerDisponibilidad, listarCitas, solicitarCita, cancelarCita, reagendarCita } from '../api/citas';

const TIPOS = { consulta: 'Primera consulta', seguimiento: 'Seguimiento' };

const ACTIVE = new Set(['SOLICITANDO', 'PENDIENTE', 'APROBADA', 'REAGENDA_REQUERIDA']);
const STATUS = {
  SOLICITANDO: 'Sincronizando solicitud', PENDIENTE: 'Pendiente de aprobación', APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada', CANCELADA: 'Cancelada', REAGENDA_REQUERIDA: 'Debes reagendar',
  ERROR_TEMPORAL: 'No pudo sincronizarse', COMPLETADA: 'Completada', NO_ASISTIO: 'No asistió',
};
const pad = value => String(value).padStart(2, '0');
const isoDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const addDays = days => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + days); return isoDate(d); };
const displayDate = value => new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${value}T12:00:00`));
const displayTime = value => String(value || '').slice(0, 5);

export function ProfessionalSearch({ aplicacionId, onBack, onExit, onLinkEvaluation, onNewEvaluation }) {
  const [sedes, setSedes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [idSede, setIdSede] = useState('');
  const [slots, setSlots] = useState([]);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [tipo, setTipo] = useState('consulta');
  const [especialidades, setEspecialidades] = useState([]);
  const [especialidad, setEspecialidad] = useState('');
  const [reagenda, setReagenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const current = citas.find(c => ACTIVE.has(c.estado));
  const failedCurrentEvaluation = citas.some(c => c.aplicacionId === aplicacionId && c.estado === 'ERROR_TEMPORAL');
  const usedCurrentEvaluation = citas.some(c => c.aplicacionId === aplicacionId && c.estado !== 'ERROR_TEMPORAL');
  const canCreate = Boolean(aplicacionId) && !current && !usedCurrentEvaluation;
  const dates = useMemo(() => [...new Set(slots.map(slot => slot.fecha))], [slots]);
  const times = slots.filter(slot => slot.fecha === fecha);

  useEffect(() => {
    Promise.all([listarSedes(), listarCitas()])
      .then(([siteData, appointmentData]) => { setSedes(siteData); setCitas(appointmentData); })
      .catch(err => setError(err.message || 'No se pudo cargar la agenda.'))
      .finally(() => setLoading(false));
  }, []);

  async function selectSite(value) {
    setIdSede(value); setFecha(''); setHora(''); setSlots([]); setEspecialidad(''); setEspecialidades([]); setError('');
    if (!value) return;
    try {
      const [tecnicos, disponibilidad] = await Promise.all([
        listarTecnicos(value),
        obtenerDisponibilidad(value, addDays(0), addDays(30)),
      ]);
      setEspecialidades([...new Set(tecnicos.map(t => t.especialidad).filter(Boolean))]);
      setSlots(disponibilidad);
    } catch (err) { setError(err.message || 'No se pudo consultar la disponibilidad.'); }
  }

  async function selectEspecialidad(value) {
    setEspecialidad(value); setFecha(''); setHora(''); setError('');
    if (!idSede) return;
    try { setSlots(await obtenerDisponibilidad(idSede, addDays(0), addDays(30), value)); }
    catch (err) { setError(err.message || 'No se pudo consultar la disponibilidad.'); }
  }

  async function save() {
    if (!idSede || !fecha || !hora || saving) return;
    setSaving(true); setError('');
    try {
      const payload = { idSede: Number(idSede), fecha, hora };
      const updated = reagenda
        ? await reagendarCita(reagenda.idCita, payload)
        : await solicitarCita({ ...payload, aplicacionId, tipo, especialidad: especialidad || null });
      setCitas(previous => [updated, ...previous.filter(item => item.idCita !== updated.idCita)]);
      setReagenda(null); setIdSede(''); setFecha(''); setHora(''); setSlots([]);
      setTipo('consulta'); setEspecialidad(''); setEspecialidades([]);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la cita.');
      // Si el error fue un conflicto (409), es posible que la cita en
      // realidad sí se haya creado del lado del servidor (p. ej. dos
      // solicitudes casi simultáneas) y lo que falló fue esta respuesta en
      // particular. Refrescamos para que la pantalla refleje lo que
      // realmente quedó guardado, en vez de dejar al usuario reintentando
      // a ciegas contra algo que ya existe.
      if (err.status === 409) {
        try { setCitas(await listarCitas()); } catch { /* la lista se queda como estaba */ }
      }
    }
    finally { setSaving(false); }
  }

  async function cancel(cita) {
    if (!window.confirm('¿Deseas cancelar esta cita? El folio ya no podrá utilizarse para solicitar otra.')) return;
    setSaving(true); setError('');
    try {
      const updated = await cancelarCita(cita.idCita);
      setCitas(previous => previous.map(item => item.idCita === updated.idCita ? updated : item));
      setReagenda(null);
    } catch (err) { setError(err.message || 'No se pudo cancelar la cita.'); }
    finally { setSaving(false); }
  }

  function beginReschedule(cita) {
    setReagenda(cita); setIdSede(String(cita.idSede)); setFecha(''); setHora('');
    selectSite(String(cita.idSede));
  }

  if (loading) return <div style={{ padding: 32, color: C.navy }}>Cargando agenda…</div>;

  return <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
    <Header onBack={onBack} />
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
      <h1 style={{ color: C.navy, fontSize: 25, marginBottom: 6 }}>Agenda tu estudio</h1>
      <p style={{ color: C.muted, lineHeight: 1.55, marginBottom: 20 }}>
        Elige sede y horario. La cita dura 60 minutos y quedará pendiente hasta que un técnico la apruebe.
      </p>

      {error && <div style={{ padding: 13, borderRadius: 10, color: C.error, background: '#FEF2F2', marginBottom: 18 }}>{error}</div>}

      {current && !reagenda && <div style={{ border: `1.5px solid ${current.estado === 'REAGENDA_REQUERIDA' ? '#F59E0B' : C.teal}`, borderRadius: 14, padding: 18, marginBottom: 22 }}>
        <p style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>CITA ACTUAL</p>
        <h2 style={{ color: C.navy, fontSize: 19, margin: '5px 0' }}>{current.sedeNombre}</h2>
        <p style={{ color: '#374151' }}>{displayDate(current.fecha)}, {displayTime(current.hora)}–{displayTime(current.horaFin)}</p>
        <p style={{ color: current.estado === 'REAGENDA_REQUERIDA' ? '#B45309' : C.teal, fontWeight: 800, marginTop: 8 }}>{STATUS[current.estado] || current.estado}</p>
        {current.motivoReagenda && <p style={{ color: C.muted, marginTop: 6 }}>{current.motivoReagenda}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button disabled={saving} onClick={() => beginReschedule(current)} style={{ flex: 1, padding: 11, borderRadius: 9, border: 0, background: C.navy, color: '#fff', fontWeight: 700 }}>Reagendar</button>
          <button disabled={saving} onClick={() => cancel(current)} style={{ flex: 1, padding: 11, borderRadius: 9, border: `1px solid ${C.error}`, background: '#fff', color: C.error, fontWeight: 700 }}>Cancelar</button>
        </div>
      </div>}

      {(canCreate || reagenda) && <section>
        {failedCurrentEvaluation && !reagenda && <div style={{ padding: 12, borderRadius: 10, background: '#FFF7ED', color: '#9A3412', marginBottom: 16 }}>
          La solicitud anterior no pudo sincronizarse. Puedes elegir el horario nuevamente; el folio no se duplicará.
        </div>}
        {reagenda && <div style={{ padding: 12, borderRadius: 10, background: C.navyLight, marginBottom: 16, color: C.navy }}>
          Elige el nuevo horario. La modificación volverá a quedar pendiente de aprobación.
        </div>}
        <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 14 }}>Sede
          <select value={idSede} onChange={e => selectSite(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 13, borderRadius: 10, border: `1.5px solid ${C.border}` }}>
            <option value="">Selecciona una sede</option>
            {sedes.map(sede => <option key={sede.idSede} value={sede.idSede}>{sede.nombre}</option>)}
          </select>
        </label>
        {!reagenda && <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 14 }}>Tipo de cita
          <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 13, borderRadius: 10, border: `1.5px solid ${C.border}` }}>
            {Object.entries(TIPOS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>}
        {idSede && especialidades.length > 0 && <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 14 }}>Especialidad
          <select value={especialidad} onChange={e => selectEspecialidad(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 13, borderRadius: 10, border: `1.5px solid ${C.border}` }}>
            <option value="">Cualquier especialidad</option>
            {especialidades.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>}
        {idSede && slots.length === 0 && !error && <p style={{ color: C.muted, margin: '18px 0' }}>No hay horarios disponibles dentro de los próximos 30 días.</p>}
        {dates.length > 0 && <label style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 14 }}>Fecha
          <select value={fecha} onChange={e => { setFecha(e.target.value); setHora(''); }} style={{ display: 'block', width: '100%', marginTop: 6, padding: 13, borderRadius: 10, border: `1.5px solid ${C.border}` }}>
            <option value="">Selecciona una fecha</option>
            {dates.map(date => <option key={date} value={date}>{displayDate(date)}</option>)}
          </select>
        </label>}
        {fecha && <div style={{ marginTop: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.muted, marginBottom: 9 }}>Horario</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
            {times.map(slot => <button key={`${slot.fecha}-${slot.horaInicio}`} onClick={() => setHora(slot.horaInicio)} style={{ padding: 11, borderRadius: 9, border: `1.5px solid ${hora === slot.horaInicio ? C.navy : C.border}`, background: hora === slot.horaInicio ? C.navyLight : '#fff', color: C.navy, fontWeight: 700 }}>{displayTime(slot.horaInicio)}</button>)}
          </div>
        </div>}
        <button disabled={!idSede || !fecha || !hora || saving} onClick={save} style={{ width: '100%', marginTop: 24, padding: 14, borderRadius: 999, border: 0, background: C.teal, color: '#fff', fontWeight: 800, opacity: !idSede || !fecha || !hora || saving ? .45 : 1 }}>
          {saving ? 'Guardando…' : reagenda ? 'Solicitar reagenda' : 'Solicitar cita'}
        </button>
        {reagenda && <button onClick={() => setReagenda(null)} style={{ width: '100%', padding: 12, border: 0, background: 'none', color: C.muted }}>Conservar cita actual</button>}
      </section>}

      {!current && usedCurrentEvaluation && <div style={{ marginTop: 22, padding: 14, borderRadius: 10, background: C.surface, color: C.muted, lineHeight: 1.5 }}>
        Tu folio anterior ya fue utilizado. Para solicitar otra cita, completa nuevamente el cuestionario y vincula el nuevo folio.
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {onNewEvaluation && <button onClick={onNewEvaluation} style={{ flex: 1, padding: 10, borderRadius: 9, border: 0, background: C.navy, color: '#fff', fontWeight: 700 }}>Nuevo cuestionario</button>}
          {onLinkEvaluation && <button onClick={onLinkEvaluation} style={{ flex: 1, padding: 10, borderRadius: 9, border: `1px solid ${C.navy}`, background: '#fff', color: C.navy, fontWeight: 700 }}>Vincular folio</button>}
        </div>
      </div>}
      <button onClick={onExit} style={{ width: '100%', marginTop: 24, padding: 12, border: 0, background: 'none', color: C.muted, textDecoration: 'underline', cursor: 'pointer' }}>Cerrar sesión</button>
    </div>
  </div>;
}
