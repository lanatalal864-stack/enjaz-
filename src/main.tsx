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
const LAUNCH_LOCK_ENABLED = true;

type Route = 'qr' | 'coming-soon' | 'app' | 'redirect';

const QR_PATHS = ['/qr', '/qr/'];
const COMING_SOON_PATHS = ['/coming-soon', '/coming-soon/'];

function getRoute(pathname: string): Route {
  if (QR_PATHS.includes(pathname)) return 'qr';
  if (COMING_SOON_PATHS.includes(pathname)) return 'coming-soon';

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
