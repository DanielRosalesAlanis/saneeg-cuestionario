import { useEffect, useState } from 'react';
import { Welcome }            from './screens/Welcome';
import { Privacy }            from './screens/Privacy';
import { QuestionBlock }      from './screens/QuestionBlock';
import { Results }            from './screens/Results';
import { SaveError }          from './screens/SaveError';
import { ProfessionalSearch } from './screens/ProfessionalSearch';
import { B1, DASS, B3 }       from './constants/questions';
import {
  iniciarAplicacion,
  guardarBloque,
  obtenerEstado,
  reemitirCodigoVinculacion,
  saveProgress,
  loadProgress,
  clearProgress,
} from './api/aplicaciones';

const AVISO_PRIVACIDAD_VERSION = '2026-08-08';
const BLOQUE_STEP = { 1: 'b1', 2: 'dass', 3: 'b3' };
const BLOQUE_PREFIX = { 1: 'b1_', 2: 'dass_', 3: 'b3_' };

export default function App() {
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
          setResultado(estado.resultado);
          setFolio(estado.folio);
          setStep('results');
          return;
        }

        const siguienteBloque = [1, 2, 3]
          .find(bloque => !estado.bloquesGuardados.includes(bloque));
        setStep(BLOQUE_STEP[siguienteBloque] ?? 'b1');
      })
      .catch(() => {
        clearProgress();
        setAplicacionId(null);
        setStep('welcome');
      })
      .finally(() => setChecking(false));
  }, []);

  function mergeAnswers(patch) {
    setAnswers(previous => ({ ...previous, ...patch }));
  }

  async function withSaveGuard(action) {
    try {
      setSaveError(null);
      await action();
    } catch (error) {
      setSaveError({ message: error.message, retry: action });
    }
  }

  function aceptarPrivacidadYContinuar(consentimiento = {}) {
    withSaveGuard(async () => {
      // Al regresar desde B1, la aplicación ya contiene el consentimiento y
      // no debe crearse otra sesión anónima.
      if (!aplicacionId) {
        const estado = await iniciarAplicacion(
          AVISO_PRIVACIDAD_VERSION,
          Boolean(consentimiento.aceptaFinalidadesSecundarias),
        );
        setAplicacionId(estado.aplicacionId);
        saveProgress(estado.aplicacionId);
      }
      setStep('b1');
    });
  }

  function guardarBloqueYContinuar(bloque, nextStep) {
    withSaveGuard(async () => {
      const prefix = BLOQUE_PREFIX[bloque];
      const subset = Object.fromEntries(
        Object.entries(answers).filter(([key]) => key.startsWith(prefix)),
      );
      let estado;
      try {
        estado = await guardarBloque(aplicacionId, bloque, subset);
      } catch (error) {
        // Si la respuesta del último guardado se perdió, el backend puede
        // haber finalizado correctamente. Recuperar el estado evita pedir al
        // participante que repita todo y permite emitir otro código privado.
        if (bloque !== 3 || error.status !== 409) throw error;
        estado = await obtenerEstado(aplicacionId);
        if (estado.estado !== 'COMPLETA') throw error;
      }
      if (estado.resultado) setResultado(estado.resultado);
      if (estado.folio) setFolio(estado.folio);
      setStep(nextStep);
    });
  }

  async function renovarCodigoVinculacion() {
    const nuevoFolio = await reemitirCodigoVinculacion(aplicacionId);
    setFolio(nuevoFolio);
  }

  function reset() {
    clearProgress();
    setAnswers({});
    setAplicacionId(null);
    setResultado(null);
    setFolio(null);
    setStep('welcome');
  }

  if (checking) return null;

  if (saveError) return (
    <SaveError
      message={saveError.message}
      onRetry={() => withSaveGuard(saveError.retry)}
      onBack={() => setSaveError(null)}
    />
  );

  if (step === 'welcome') return (
    <Welcome onNext={() => setStep('privacy')} />
  );

  if (step === 'privacy') return (
    <Privacy
      onNext={aceptarPrivacidadYContinuar}
      onBack={() => setStep('welcome')}
    />
  );

  if (step === 'b1') return (
    <QuestionBlock
      key="b1"
      questions={B1}
      data={answers}
      setData={mergeAnswers}
      blockIndex={1}
      totalBlocks={3}
      pctStart={10}
      pctEnd={35}
      onFinish={() => guardarBloqueYContinuar(1, 'dass')}
      onBack={() => setStep('privacy')}
    />
  );

  if (step === 'dass') return (
    <QuestionBlock
      key="dass"
      questions={DASS}
      data={answers}
      setData={mergeAnswers}
      blockIndex={2}
      totalBlocks={3}
      pctStart={35}
      pctEnd={70}
      onFinish={() => guardarBloqueYContinuar(2, 'b3')}
      onBack={() => setStep('b1')}
    />
  );

  if (step === 'b3') return (
    <QuestionBlock
      key="b3"
      questions={B3}
      data={answers}
      setData={mergeAnswers}
      blockIndex={3}
      totalBlocks={3}
      pctStart={70}
      pctEnd={100}
      onFinish={() => guardarBloqueYContinuar(3, 'results')}
      onBack={() => setStep('dass')}
    />
  );

  if (step === 'results') return (
    <Results
      data={answers}
      resultado={resultado}
      folio={folio}
      onRegenerateCode={renovarCodigoVinculacion}
      onProfessionals={() => setStep('professionals')}
      onExit={reset}
    />
  );

  if (step === 'professionals') return (
    <ProfessionalSearch
      onBack={() => setStep('results')}
      onExit={reset}
    />
  );

  return null;
}
