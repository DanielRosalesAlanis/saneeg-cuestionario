import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Welcome } from './screens/Welcome';
import { Privacy } from './screens/Privacy';
import { QuestionBlock } from './screens/QuestionBlock';
import { Results } from './screens/Results';
import { SaveError } from './screens/SaveError';
import { AppointmentsRouter } from './appointments/AppointmentsRouter';
import { B1, DASS, B3 } from './constants/questions';
import {
  iniciarAplicacion, guardarBloque, obtenerEstado, reemitirCodigoVinculacion,
  saveProgress, loadProgress, clearProgress,
} from './api/aplicaciones';

const AVISO_PRIVACIDAD_VERSION = '2026-08-09-citas-v1';
const BLOQUE_STEP = { 1: 'b1', 2: 'dass', 3: 'b3' };
const BLOQUE_PREFIX = { 1: 'b1_', 2: 'dass_', 3: 'b3_' };

function AssessmentFlow({ onAppointmentHandoff }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('welcome');
  const [answers, setAnswers] = useState({});
  const [aplicacionId, setAplicacionId] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [folio, setFolio] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(loadProgress()));

  useEffect(() => {
    const saved = loadProgress();
    if (!saved?.aplicacionId) return;
    obtenerEstado(saved.aplicacionId)
      .then(estado => {
        setAplicacionId(saved.aplicacionId);
        if (estado.estado === 'COMPLETA') {
          setResultado(estado.resultado); setFolio(estado.folio); setStep('results'); return;
        }
        const next = [1, 2, 3].find(block => !estado.bloquesGuardados.includes(block));
        setStep(BLOQUE_STEP[next] ?? 'b1');
      })
      .catch(() => { clearProgress(); setAplicacionId(null); setStep('welcome'); })
      .finally(() => setChecking(false));
  }, []);

  const mergeAnswers = patch => setAnswers(previous => ({ ...previous, ...patch }));
  async function withSaveGuard(action) {
    try { setSaveError(null); await action(); }
    catch (error) { setSaveError({ message: error.message, retry: action }); }
  }

  function aceptarPrivacidadYContinuar(consentimiento = {}) {
    withSaveGuard(async () => {
      if (!aplicacionId) {
        const estado = await iniciarAplicacion(AVISO_PRIVACIDAD_VERSION, Boolean(consentimiento.aceptaFinalidadesSecundarias));
        setAplicacionId(estado.aplicacionId); saveProgress(estado.aplicacionId);
      }
      setStep('b1');
    });
  }

  function guardarBloqueYContinuar(bloque, nextStep) {
    withSaveGuard(async () => {
      const prefix = BLOQUE_PREFIX[bloque];
      const subset = Object.fromEntries(Object.entries(answers).filter(([key]) => key.startsWith(prefix)));
      let estado;
      try { estado = await guardarBloque(aplicacionId, bloque, subset); }
      catch (error) {
        if (bloque !== 3 || error.status !== 409) throw error;
        estado = await obtenerEstado(aplicacionId);
        if (estado.estado !== 'COMPLETA') throw error;
      }
      if (estado.resultado) setResultado(estado.resultado);
      if (estado.folio) setFolio(estado.folio);
      setStep(nextStep);
    });
  }

  async function renovarCodigoVinculacion() { setFolio(await reemitirCodigoVinculacion(aplicacionId)); }

  function beginAppointments() {
    onAppointmentHandoff({ credenciales: folio, aplicacionId });
    navigate('/citas');
  }

  function reset() {
    clearProgress(); setAnswers({}); setAplicacionId(null); setResultado(null); setFolio(null);
    setStep('welcome');
  }

  if (checking) return null;
  if (saveError) return <SaveError message={saveError.message} onRetry={() => withSaveGuard(saveError.retry)} onBack={() => setSaveError(null)} />;
  if (step === 'welcome') return <Welcome onNext={() => setStep('privacy')} />;
  if (step === 'privacy') return <Privacy onNext={aceptarPrivacidadYContinuar} onBack={() => setStep('welcome')} />;
  if (step === 'b1') return <QuestionBlock key="b1" questions={B1} data={answers} setData={mergeAnswers} blockIndex={1} totalBlocks={3} pctStart={10} pctEnd={35} onFinish={() => guardarBloqueYContinuar(1, 'dass')} onBack={() => setStep('privacy')} />;
  if (step === 'dass') return <QuestionBlock key="dass" questions={DASS} data={answers} setData={mergeAnswers} blockIndex={2} totalBlocks={3} pctStart={35} pctEnd={70} onFinish={() => guardarBloqueYContinuar(2, 'b3')} onBack={() => setStep('b1')} />;
  if (step === 'b3') return <QuestionBlock key="b3" questions={B3} data={answers} setData={mergeAnswers} blockIndex={3} totalBlocks={3} pctStart={70} pctEnd={100} onFinish={() => guardarBloqueYContinuar(3, 'results')} onBack={() => setStep('dass')} />;
  if (step === 'results') return <Results data={answers} resultado={resultado} folio={folio} onRegenerateCode={renovarCodigoVinculacion} onProfessionals={() => withSaveGuard(beginAppointments)} onExit={reset} />;
  return null;
}

function AppRoutes() {
  const [appointmentHandoff, setAppointmentHandoff] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<AssessmentFlow onAppointmentHandoff={setAppointmentHandoff} />} />
      <Route
        path="/citas/*"
        element={(
          <AppointmentsRouter
            handoff={appointmentHandoff}
            onHandoffConsumed={() => setAppointmentHandoff(null)}
          />
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
