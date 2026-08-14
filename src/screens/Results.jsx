import { useState } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { scoreDASS } from '../constants/questions';
import { HELP_LINES } from '../constants/mockData';
import {
  IconSmile, IconFrown, IconHeart, IconUsers,
  IconPhone, IconSearch, IconAlertTriangle,
} from '../components/Icons';

// Cada subescala del DASS-21 suma 7 items de 0 a 3 puntos -> 21 es el maximo
// posible. El cliente pidio mostrar el porcentaje respecto a ese maximo en
// vez del puntaje crudo (ej. en vez de "9/moderado", mostrar "43%").
const MAX_SCORE_POR_SUBESCALA = 21;
const toPorcentaje = (score) => Math.round((score / MAX_SCORE_POR_SUBESCALA) * 100);

// Escala de bajo (#00BABD, teal) a alto (#162983, navy) en vez de rojo/amarillo
// -- decisión del cliente para no alarmar al paciente con colores de "semáforo".
const SEVERITY_COLORS = {
  'Normal':                { bg: '#E6FAFA', border: '#00BABD', text: '#007A7D' },
  'Leve':                  { bg: '#E5F4F7', border: '#0796AD', text: '#045C6D' },
  'Moderado':              { bg: '#E6EFF5', border: '#0E72A0', text: '#073F5C' },
  'Severo':                { bg: '#E7EBF5', border: '#164E92', text: '#0F2E5C' },
  'Extremadamente severo': { bg: '#E8E9F5', border: '#162983', text: '#0F1A52' },
};

function getOverallMessage(sevD, sevA, sevS) {
  const critical = [sevD, sevA, sevS].some(s => s === 'Severo' || s === 'Extremadamente severo');
  const moderate = [sevD, sevA, sevS].some(s => s === 'Moderado');
  const allNormal = [sevD, sevA, sevS].every(s => s === 'Normal');

  // Misma escala teal->navy de SEVERITY_COLORS -- sin rojo/amarillo en
  // ningún tono del mensaje general, para no alarmar al paciente.
  if (allNormal) return {
    Icon: IconSmile,
    title: '¡Buen estado emocional!',
    msg: 'Tus resultados indican que actualmente te encuentras dentro de rangos normales. Sigue cuidando tu bienestar con hábitos saludables.',
    color: '#00BABD',
  };
  if (critical) return {
    Icon: IconHeart,
    title: 'Te recomendamos buscar apoyo',
    msg: 'Tus resultados muestran niveles que ameritan atención profesional. No estás solo(a); hay profesionales disponibles para ayudarte.',
    color: '#162983',
  };
  if (moderate) return {
    Icon: IconUsers,
    title: 'Considera hablar con alguien',
    msg: 'Tus resultados indican niveles moderados de estrés emocional. Un profesional de salud mental puede ayudarte a manejarlos mejor.',
    color: '#0E72A0',
  };
  return {
    Icon: IconFrown,
    title: 'Presta atención a tu bienestar',
    msg: 'Tus resultados muestran niveles leves. Con apoyo y hábitos saludables puedes mejorar tu bienestar emocional.',
    color: '#0796AD',
  };
}

function ScoreCard({ label, score, severity, Icon }) {
  const style = SEVERITY_COLORS[severity] ?? SEVERITY_COLORS['Normal'];
  return (
    <div style={{
      flex: 1,
      background: style.bg,
      border: `1.5px solid ${style.border}`,
      borderRadius: 12,
      padding: '16px 10px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
    }}>
      <Icon size={22} style={{ color: style.text }} />
      <p style={{ fontSize: 13, fontWeight: 700, color: style.text }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 900, color: style.text, lineHeight: 1 }}>{toPorcentaje(score)}%</p>
      <p style={{ fontSize: 11, fontWeight: 600, color: style.text, lineHeight: 1.3 }}>{severity}</p>
    </div>
  );
}

function toScores(resultado) {
  if (!resultado) return null;
  return {
    d: resultado.depresionScore, sevD: resultado.depresionSeveridad,
    a: resultado.ansiedadScore, sevA: resultado.ansiedadSeveridad,
    s: resultado.estresScore, sevS: resultado.estresSeveridad,
  };
}

function FolioCard({ folio, onRegenerateCode }) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const codigoDisponible = Boolean(folio?.codigoVinculacion);

  async function copyCredentials() {
    try {
      await navigator.clipboard.writeText(
        `Folio: ${folio.folio}\nCódigo privado: ${folio.codigoVinculacion}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('No se pudo copiar automáticamente. Anota ambos códigos.');
    }
  }

  async function regenerate() {
    setLoading(true);
    setError('');
    try {
      await onRegenerateCode();
    } catch (err) {
      setError(err.message || 'No se pudo generar un código nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (!folio?.folio) return null;

  return (
    <div style={{
      padding: '18px 16px', borderRadius: 14, marginBottom: 28,
      background: C.navyLight, border: `1.5px solid ${C.navy}`,
    }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }}>
        Guarda tu folio
      </h2>
      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, marginBottom: 14 }}>
        Lo necesitarás para vincular esta evaluación con tu cuenta y poder agendar una cita.
        El código privado no debe compartirse.
      </p>

      <div style={{
        padding: '12px', borderRadius: 10, background: C.white,
        border: `1px solid ${C.border}`, marginBottom: 10,
      }}>
        <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 3 }}>FOLIO</p>
        <p style={{ fontSize: 18, color: C.navy, fontWeight: 900, letterSpacing: '1px', overflowWrap: 'anywhere' }}>
          {folio.folio}
        </p>
      </div>

      {codigoDisponible ? (
        <>
          <div style={{
            padding: '12px', borderRadius: 10, background: C.white,
            border: `1px solid ${C.border}`, marginBottom: 12,
          }}>
            <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, marginBottom: 3 }}>CÓDIGO PRIVADO</p>
            <p style={{ fontSize: 15, color: C.navy, fontWeight: 800, letterSpacing: '0.7px', overflowWrap: 'anywhere' }}>
              {folio.codigoVinculacion}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCredentials}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 10,
              background: C.navy, color: C.white, border: 'none',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {copied ? 'Copiado' : 'Copiar folio y código'}
          </button>
        </>
      ) : (
        <div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>
            Por seguridad, el código privado no se conserva en texto legible. Puedes generar uno nuevo;
            cualquier código anterior dejará de funcionar.
          </p>
          <button
            type="button"
            onClick={regenerate}
            disabled={loading}
            style={{
              width: '100%', padding: '11px 16px', borderRadius: 10,
              background: C.navy, color: C.white, border: 'none',
              fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? 'Generando…' : 'Generar un código nuevo'}
          </button>
        </div>
      )}

      {error && (
        <p style={{ fontSize: 12, color: C.error, lineHeight: 1.5, marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}

export function Results({ data, resultado, folio, onRegenerateCode, onProfessionals, onExit }) {
  // El resultado que calculó y guardó el backend es la fuente de verdad —
  // recalcular en el cliente solo como respaldo si por algún motivo no llegó.
  const scores = toScores(resultado) ?? scoreDASS(data);
  const { d, a, s, sevD, sevA, sevS } = scores;
  const { Icon, title, msg, color } = getOverallMessage(sevD, sevA, sevS);
  const esCritico = [sevD, sevA, sevS].some(sev => sev === 'Severo' || sev === 'Extremadamente severo');

  return (
    <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header progress={100} />

      <div style={{ flex: 1, minHeight: 0, padding: '24px', overflowY: 'auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', marginBottom: 4 }}>
          Fin del cuestionario
        </h1>
        <p style={{ fontSize: 15, color: C.muted, marginBottom: 12 }}>
          Aquí están tus resultados del DASS-21.
        </p>

        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
          El DASS-21 es un instrumento de tamizaje, no un diagnóstico clínico. Solo un profesional de la salud mental puede evaluar e interpretar tu situación de forma completa.
        </p>

        {/* Score cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <ScoreCard label="Depresión" score={d} severity={sevD} Icon={IconFrown} />
          <ScoreCard label="Ansiedad"  score={a} severity={sevA} Icon={IconAlertTriangle} />
          <ScoreCard label="Estrés"    score={s} severity={sevS} Icon={IconHeart} />
        </div>

        {/* Overall message */}
        <div style={{
          padding: '18px 16px',
          borderRadius: 14,
          border: `1.5px solid ${color}44`,
          background: `${color}11`,
          marginBottom: 28,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <span style={{ color, flexShrink: 0, display: 'flex', marginTop: 2 }}>
            <Icon size={26} />
          </span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 4 }}>{title}</p>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>{msg}</p>
          </div>
        </div>

        <FolioCard folio={folio} onRegenerateCode={onRegenerateCode} />

        <h2 style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 14 }}>
          Líneas de apoyo en México
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {HELP_LINES.map((line, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 16px',
              borderRadius: 12,
              background: esCritico ? '#E8E9F5' : C.surface,
              border: `1.5px solid ${esCritico ? '#162983' : C.border}`,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#16298318', color: '#162983',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <IconPhone size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{line.name}</p>
                <p style={{ fontSize: 13, color: C.muted }}>{line.desc}</p>
              </div>
              <a
                href={`tel:${line.phone.replace(/\s|-/g, '')}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 12px', borderRadius: 10,
                  background: '#162983', border: 'none',
                  fontSize: 13, fontWeight: 700, color: C.white,
                  textDecoration: 'none', flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                {line.phone}
              </a>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {onProfessionals && (
            <button
              onClick={onProfessionals}
              style={{
                width: '100%', maxWidth: 320, padding: '16px 40px', borderRadius: 9999,
                background: C.teal, color: C.navy,
                fontSize: 16, fontWeight: 700, border: 'none',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <IconSearch size={18} />
              Buscar citas disponibles
            </button>
          )}
          <button
            onClick={onExit}
            style={{
              width: '100%', maxWidth: 320, padding: '16px 40px', borderRadius: 9999,
              background: 'transparent', color: C.muted,
              fontSize: 16, fontWeight: 600, border: `1.5px solid ${C.border}`,
              cursor: 'pointer',
            }}
          >
            Salir del test
          </button>
        </div>
      </div>
    </div>
  );
}
