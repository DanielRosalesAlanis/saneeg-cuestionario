import { useState, useRef, useEffect } from 'react';
import { C } from '../constants/colors';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { IconChevronDown, IconCheck } from '../components/Icons';

const PRIVACY_SECTIONS = [
  {
    title: 'I. Identidad y domicilio del responsable',
    body: `El Centro Nacional de Investigación y Desarrollo Tecnológico (CENIDET), con domicilio en Interior Internado Palmira s/n, Col. Palmira, C.P. 62490, Cuernavaca, Morelos, México, a través del proyecto de investigación SanEEG, es el responsable del tratamiento de sus datos personales.`,
  },
  {
    title: 'II. Datos personales que se recaban',
    body: `El cuestionario no solicita nombre, teléfono, correo electrónico, matrícula ni otro identificador directo. Recaba datos sociodemográficos, académicos y datos sensibles de salud y bienestar emocional. Al finalizar genera un folio y un código privado.\n\nSi la persona decide solicitar una cita, creará por separado una cuenta con nombre, género, fecha de nacimiento, teléfono, correo, contacto de emergencia, código postal y colonia. La evaluación sólo quedará asociada a esa cuenta cuando la persona capture voluntariamente el folio y el código privado.`,
  },
  {
    title: 'III. Finalidades del tratamiento',
    body: `Finalidades primarias: aplicar y evaluar los instrumentos del proyecto, presentar resultados de tamizaje y recursos de ayuda, generar un folio, administrar una cuenta, vincular voluntariamente una evaluación y gestionar una cita de 60 minutos. Esto incluye aprobación manual, cancelación, reagenda y notificaciones operativas por correo cuando cambie la disponibilidad. Cada evaluación completa permite solicitar una sola cita.\n\nFinalidades secundarias opcionales: estudios estadísticos y epidemiológicos, publicaciones académicas sin identificación individual y mejora de instrumentos y protocolos con datos disociados o agregados.`,
  },
  {
    title: 'IV. Transferencia de datos personales',
    body: `Para enviar códigos de acceso y notificaciones operativas se utilizará Resend como proveedor encargado del envío de correo; por ello se procesarán la dirección de correo, el asunto y el contenido estrictamente necesario del mensaje. Los datos clínicos y respuestas del cuestionario no deben incluirse en esos correos. La información también será tratada por el personal autorizado de las sedes para gestionar la cita. No se compartirá para finalidades distintas sin consentimiento, salvo obligación legal.`,
  },
  {
    title: 'V. Medidas de seguridad',
    body: `CENIDET y el proyecto SanEEG implementan medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales contra acceso no autorizado, uso indebido, alteración, pérdida o destrucción. Entre estas medidas se incluyen minimización de datos, cifrado de las evaluaciones nuevas en tránsito y en reposo, controles de acceso y revisión de los sistemas.`,
  },
  {
    title: 'VI. Derechos ARCO',
    body: `Usted tiene derecho en todo momento a:\n• Acceder a sus datos personales en posesión de CENIDET-SanEEG.\n• Rectificar sus datos cuando sean inexactos o incompletos.\n• Cancelar sus datos cuando considere que no son necesarios para las finalidades indicadas.\n• Oponerse al tratamiento de sus datos para finalidades específicas.\n\nMientras la evaluación no se vincule a una cuenta, deberá conservar el folio y el código privado para acreditar el control sobre ese registro. Para conocer el procedimiento aplicable, presente una solicitud dirigida al Departamento de Investigación de CENIDET o escriba a privacidad@cenidet.edu.mx.`,
  },
  {
    title: 'VII. Revocación del consentimiento',
    body: `Usted puede revocar el consentimiento otorgado para el tratamiento de sus datos personales en cualquier momento, siguiendo el procedimiento descrito en la sección anterior. Sin embargo, la revocación del consentimiento no afectará el tratamiento que se haya realizado con anterioridad a dicha solicitud.`,
  },
  {
    title: 'VIII. Contacto y modificaciones',
    body: `Para cualquier consulta relacionada con el presente aviso de privacidad, comuníquese a: privacidad@cenidet.edu.mx\n\nNos reservamos el derecho de modificar este aviso de privacidad en cualquier momento. Cualquier modificación estará disponible en las instalaciones de CENIDET y a través de nuestros canales oficiales.`,
  },
];

export function Privacy({ onNext, onBack }) {
  const [accepted, setAccepted] = useState(false);
  const [secondaryAccepted, setSecondaryAccepted] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef(null);

  // Check on mount in case the content is short enough to not need scrolling
  useEffect(() => {
    checkBottom();
  }, []);

  function checkBottom() {
    const el = scrollRef.current;
    if (!el) return;
    // Use a generous threshold (40px) to handle sub-pixel rounding on high-DPI screens
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 40) setReachedEnd(true);
  }

  return (
    <div className="anim-fadeup" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Header progress={5} onBack={onBack} />

      <div style={{ flex: 1, minHeight: 0, padding: '20px 24px 16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.navy, letterSpacing: '-0.4px', marginBottom: 4 }}>
          Aviso de Privacidad
        </h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>
          Lee el aviso completo y acepta el consentimiento para continuar.
        </p>

        {/* Scroll hint — solo si aún no llegó al final */}
        {!reachedEnd && (
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            padding: '7px 12px', borderRadius: 8,
            background: C.navyLight,
          }}>
            <span style={{ display: 'flex', color: C.navy }}><IconChevronDown size={15} /></span>
            <p style={{ fontSize: 12, color: C.navy, fontWeight: 600 }}>Desliza hasta el final para aceptar</p>
          </div>
        )}

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          onScroll={checkBottom}
          className="scroll-box"
          tabIndex={0}
          aria-label="Contenido del aviso de privacidad"
          style={{
            flex: 1,
            overflowY: 'auto',
            borderRadius: 12,
            border: `1.5px solid ${C.border}`,
            padding: '18px 16px',
            marginBottom: 14,
          }}
        >
          <img src="/cenidet.png" alt="CENIDET" style={{ height: 50, width: 'auto', display: 'block', marginBottom: 14 }} />

          {PRIVACY_SECTIONS.map((sec, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <h3 style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.navy,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 6,
                opacity: 0.7,
              }}>
                {sec.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#374151',
                lineHeight: 1.75,
                whiteSpace: 'pre-line',
              }}>
                {sec.body}
              </p>
            </div>
          ))}

          {/* Separador visual */}
          <div style={{ height: 1, background: C.border, margin: '8px 0 20px' }} />

          {/* Consent checkbox — siempre visible, habilitado solo al llegar al final */}
          <div
            onClick={() => reachedEnd && setAccepted(v => !v)}
            style={{
              padding: '16px',
              borderRadius: 12,
              border: `1.5px solid ${accepted ? C.navy : reachedEnd ? C.border : C.border}`,
              background: accepted ? C.navyLight : '#FFFFFF',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: reachedEnd ? 'pointer' : 'not-allowed',
              opacity: reachedEnd ? 1 : 0.4,
              transition: 'all 0.2s',
              marginBottom: 8,
            }}
          >
            {/* Checkbox */}
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: `2px solid ${accepted ? C.navy : C.border}`,
              background: accepted ? C.navy : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
              transition: 'all 0.2s',
            }}>
              {accepted && (
                <span className="anim-pop" style={{ display: 'flex', color: '#FFFFFF' }}>
                  <IconCheck size={13} strokeWidth={3} />
                </span>
              )}
            </div>

            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
                Doy mi consentimiento expreso*
              </p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
                Autorizo el tratamiento de mis datos personales, incluyendo datos sensibles de salud, conforme al presente aviso de privacidad de CENIDET.
              </p>
            </div>
          </div>

          <div
            onClick={() => reachedEnd && setSecondaryAccepted(v => !v)}
            style={{
              padding: '16px',
              borderRadius: 12,
              border: `1.5px solid ${secondaryAccepted ? C.navy : C.border}`,
              background: secondaryAccepted ? C.navyLight : '#FFFFFF',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: reachedEnd ? 'pointer' : 'not-allowed',
              opacity: reachedEnd ? 1 : 0.4,
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: `2px solid ${secondaryAccepted ? C.navy : C.border}`,
              background: secondaryAccepted ? C.navy : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              {secondaryAccepted && <span style={{ display: 'flex', color: '#FFFFFF' }}><IconCheck size={13} strokeWidth={3} /></span>}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
                Finalidades secundarias (opcional)
              </p>
              <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>
                Acepto el uso de datos disociados o agregados para investigación, publicaciones y mejora de los instrumentos.
              </p>
            </div>
          </div>

          <div style={{ height: 4 }} />
        </div>
      </div>

      <ActionButton
        label="Continuar"
        onClick={() => onNext({ aceptaFinalidadesSecundarias: secondaryAccepted })}
        disabled={!accepted}
      />
    </div>
  );
}
