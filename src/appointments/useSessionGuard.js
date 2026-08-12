import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shared guard for routes that require an authenticated citas session.
 *
 * Returns a stable `handleSessionError(err)` function: when `err` looks like
 * an unauthenticated/forbidden response from the citas API (401/403), it
 * redirects to the login screen and returns `true` (meaning "handled").
 * Otherwise it does nothing and returns `false`, so the caller can continue
 * with its own error handling (e.g. showing a message).
 */
export function useSessionGuard(redirectTo = '/citas/acceso') {
  const navigate = useNavigate();

  return useCallback(err => {
    if (err?.status === 401 || err?.status === 403) {
      navigate(redirectTo, { replace: true });
      return true;
    }
    return false;
  }, [navigate, redirectTo]);
}
