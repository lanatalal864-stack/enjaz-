import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import QRPage from './pages/QRPage.tsx';
import ComingSoonPage from './pages/ComingSoonPage.tsx';
import './index.css';

// =============================================================================
// LAUNCH LOCK
// While LAUNCH_LOCK_ENABLED is true the entire main application is hidden
// behind the public QR + Coming Soon flow:
//   /            -> QR landing page
//   /qr          -> QR landing page
//   /coming-soon -> Coming Soon page
//   any other path (e.g. /dashboard, /classroom, /spaces, /smartboard,
//                   /settings, /auth, ...) -> redirected to /coming-soon
//
// Set LAUNCH_LOCK_ENABLED to false to restore the normal application.
// Nothing is deleted: the full <App /> tree (dashboard, smartboard, spaces,
// settings, classroom, auth pages, etc.) is only temporarily hidden and will
// resume working exactly as before once the flag is flipped off.
// =============================================================================
// Flip this back to `true` to re-lock the platform behind /qr + /coming-soon.
// The full lockdown logic, dev-secret bypass, and route guards below are all
// preserved — they simply short-circuit while this flag is false, so toggling
// it back on later requires no code changes.
const LAUNCH_LOCK_ENABLED = false;

// =============================================================================
// DEVELOPER BYPASS
// Visit any URL with ?dev=enjezmode once and the launch lock is permanently
// disabled on this device (a `is_developer=true` flag is written to
// localStorage). The query parameter is stripped from the URL so the link
// stays clean. Clear localStorage or run
//   localStorage.removeItem('is_developer')
// in DevTools to re-enable the lock on this device.
// =============================================================================
const DEV_SECRET = 'enjezmode';
const DEV_STORAGE_KEY = 'is_developer';

function consumeDevSecret(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === DEV_SECRET) {
      localStorage.setItem(DEV_STORAGE_KEY, 'true');
      params.delete('dev');
      const qs = params.toString();
      const cleaned = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
      window.history.replaceState({}, '', cleaned);
    }
  } catch {
    // ignore (e.g. private mode storage errors)
  }
}

function isDeveloper(): boolean {
  try {
    return localStorage.getItem(DEV_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

// Run the secret check immediately on module load so the rest of routing sees
// the developer flag on the very first paint.
consumeDevSecret();

type Route = 'qr' | 'coming-soon' | 'app' | 'redirect';

const QR_PATHS = ['/qr', '/qr/'];
const COMING_SOON_PATHS = ['/coming-soon', '/coming-soon/'];

function getRoute(pathname: string): Route {
  if (QR_PATHS.includes(pathname)) return 'qr';
  if (COMING_SOON_PATHS.includes(pathname)) return 'coming-soon';

  // Developer bypass: skip the launch lock entirely.
  if (isDeveloper()) return 'app';

  if (LAUNCH_LOCK_ENABLED) {
    // Root shows the QR landing page first.
    if (pathname === '/' || pathname === '') return 'qr';
    // All other routes are blocked and bounced to /coming-soon.
    return 'redirect';
  }

  return 'app';
}

// Tiny path-based router. The QR and Coming Soon pages live entirely outside
// the main <App /> tree so they never inherit the dashboard sidebar / navbar
// or any internal app navigation, and direct URL access / refresh works.
function Root() {
  const [route, setRoute] = useState<Route>(() => getRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(getRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // While the launch lock is on, any non-public route is rewritten to
  // /coming-soon. We use replaceState so the blocked URL is not kept in
  // browser history (no back-button leak to the internal app).
  useEffect(() => {
    if (route === 'redirect') {
      window.history.replaceState({}, '', '/coming-soon');
      setRoute('coming-soon');
    }
  }, [route]);

  if (route === 'qr') return <QRPage />;
  if (route === 'coming-soon') return <ComingSoonPage />;
  if (route === 'redirect') return null;
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
