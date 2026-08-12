import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { C } from '../constants/colors';
import { Login } from '../screens/Login';
import { Register } from '../screens/Register';
import { VerifyCode } from '../screens/VerifyCode';
import { LinkEvaluation } from '../screens/LinkEvaluation';
import { ProfessionalSearch } from '../screens/ProfessionalSearch';
import {
  cerrarSesion,
  iniciarSesion,
  listarEvaluaciones,
  obtenerCuenta,
  reenviarOtp,
  registrarCuenta,
  verificarOtp,
  vincularEvaluacion,
} from '../api/cuenta';
import { useSessionGuard } from './useSessionGuard';

const OTP_CHALLENGE_KEY = 'saneeg.citas.otp-challenge';

function readChallenge() {
  try {
    const value = sessionStorage.getItem(OTP_CHALLENGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function LoadingPortal({ message = 'Cargando tus citas…' }) {
  return <div style={{ padding: 32, color: C.navy }}>{message}</div>;
}

function PortalHome({ credenciales, preferredApplicationId, onCredentialsConsumed, onLogout }) {
  const navigate = useNavigate();
  const handleSessionError = useSessionGuard();
  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([obtenerCuenta(), listarEvaluaciones()])
      .then(([, evaluations]) => {
        if (cancelled) return;

        if (credenciales?.folio) {
          const linked = evaluations.find(item => item.folio === credenciales.folio);
          if (!linked) {
            navigate('/citas/vincular', { replace: true });
            return;
          }
          setApplicationId(linked.aplicacionId);
          onCredentialsConsumed();
          return;
        }

        const preferred = preferredApplicationId
          ? evaluations.find(item => item.aplicacionId === preferredApplicationId)
          : null;
        const selected = preferred
          ?? evaluations.find(item => !item.usadaParaCita)
          ?? evaluations[0];

        if (!selected) {
          navigate('/citas/vincular', { replace: true });
          return;
        }
        setApplicationId(selected.aplicacionId);
      })
      .catch(err => {
        if (cancelled) return;
        if (handleSessionError(err)) return;
        setError(err.message || 'No se pudo cargar tu cuenta.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [credenciales, navigate, onCredentialsConsumed, preferredApplicationId, handleSessionError]);

  if (loading) return <LoadingPortal />;
  if (error) {
    return <div style={{ padding: 32, color: C.error }}>{error}</div>;
  }
  if (!applicationId) return <LoadingPortal />;

  return (
    <ProfessionalSearch
      aplicacionId={applicationId}
      onBack={() => navigate('/')}
      onExit={onLogout}
      onLinkEvaluation={() => navigate('/citas/vincular')}
      onNewEvaluation={() => navigate('/')}
    />
  );
}

function LinkRoute({ credenciales, onLinked, onLogout }) {
  const navigate = useNavigate();
  const handleSessionError = useSessionGuard();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    obtenerCuenta()
      .catch(err => {
        if (!cancelled) handleSessionError(err);
      })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [navigate, handleSessionError]);

  if (checking) return <LoadingPortal message="Comprobando tu sesión…" />;

  return (
    <LinkEvaluation
      credenciales={credenciales}
      onLink={onLinked}
      onBack={() => navigate('/')}
      onLogout={onLogout}
    />
  );
}

export function AppointmentsRouter({ handoff, onHandoffConsumed }) {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(readChallenge);
  const [credenciales, setCredenciales] = useState(() => handoff?.credenciales ?? null);
  const [preferredApplicationId, setPreferredApplicationId] = useState(
    () => handoff?.aplicacionId ?? null,
  );

  useEffect(() => {
    if (challenge) sessionStorage.setItem(OTP_CHALLENGE_KEY, JSON.stringify(challenge));
    else sessionStorage.removeItem(OTP_CHALLENGE_KEY);
  }, [challenge]);

  async function beginLogin(phone) {
    const next = await iniciarSesion(phone);
    setChallenge(next);
    navigate('/citas/verificar');
  }

  async function register(payload) {
    const next = await registrarCuenta(payload);
    setChallenge(next);
    navigate('/citas/verificar');
  }

  async function verify(code) {
    await verificarOtp(challenge.desafioId, code);
    // No limpiamos "challenge" aquí: navigate() no actualiza location.pathname
    // de forma síncrona, así que hay un render intermedio donde seguimos en
    // "/citas/verificar" pero challenge ya sería null -- eso hace que esa ruta
    // caiga a su propio <Navigate to="/citas/acceso" />, ganándole la carrera
    // a esta navegación (confirmado con logs reales). Como de todas formas
    // dejamos la pantalla de verificación, un challenge "usado" ahí no
    // importa -- beginLogin/register ya lo sobrescriben la próxima vez, y
    // logout() lo limpia explícitamente.
    navigate(credenciales ? '/citas/vincular' : '/citas', { replace: true });
  }

  async function resend() {
    const next = await reenviarOtp(challenge.desafioId);
    setChallenge(next);
  }

  async function linkEvaluation(folio, code) {
    const linked = await vincularEvaluacion(folio, code);
    setPreferredApplicationId(linked.aplicacionId);
    setCredenciales(null);
    onHandoffConsumed();
    navigate('/citas', { replace: true });
  }

  function consumeCredentials() {
    setCredenciales(null);
    onHandoffConsumed();
  }

  async function logout() {
    try { await cerrarSesion(); } catch { /* La salida local no debe quedar bloqueada. */ }
    setChallenge(null);
    setCredenciales(null);
    setPreferredApplicationId(null);
    onHandoffConsumed();
    navigate('/citas/acceso', { replace: true });
  }

  return (
    <Routes>
      <Route
        index
        element={(
          <PortalHome
            credenciales={credenciales}
            preferredApplicationId={preferredApplicationId}
            onCredentialsConsumed={consumeCredentials}
            onLogout={logout}
          />
        )}
      />
      <Route
        path="acceso"
        element={(
          <Login
            onNext={beginLogin}
            onRegister={() => navigate('/citas/registro')}
            onBack={() => navigate('/')}
          />
        )}
      />
      <Route
        path="registro"
        element={(
          <Register
            onNext={register}
            onLogin={() => navigate('/citas/acceso')}
            onBack={() => navigate('/citas/acceso')}
          />
        )}
      />
      <Route
        path="verificar"
        element={challenge ? (
          <VerifyCode
            destino={challenge.destino}
            onVerify={verify}
            onResend={resend}
            onBack={() => navigate('/citas/acceso')}
          />
        ) : <Navigate to="/citas/acceso" replace />}
      />
      <Route
        path="vincular"
        element={<LinkRoute credenciales={credenciales} onLinked={linkEvaluation} onLogout={logout} />}
      />
      <Route path="*" element={<Navigate to="/citas" replace />} />
    </Routes>
  );
}
