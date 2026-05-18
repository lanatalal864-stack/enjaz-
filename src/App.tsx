/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AppProvider, useApp } from "./shared/AppContext";
import { checkIfNeedsSetup } from "./shared/subjects";
import { WikiWikiBot } from "./shared/ui/WikiWikiBot";

import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { SetupSubjectPage } from "./pages/SetupSubjectPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudyDashboard } from "./pages/StudyDashboard";
import { RevisionDashboard } from "./pages/RevisionDashboard";
import { ScheduleDashboard } from "./pages/ScheduleDashboard";
import { BooksPage } from "./pages/BooksPage";

function LandingRoute() {
  const navigate = useNavigate();
  const { user, t, theme } = useApp();
  return (
    <LandingPage
      onStart={() => {
        if (user) navigate(checkIfNeedsSetup(user) ? "/setup" : "/dashboard");
        else navigate("/auth");
      }}
      onLogin={() => navigate("/auth")}
      t={t}
      theme={theme}
    />
  );
}

function AuthRoute() {
  const navigate = useNavigate();
  const { setUser, t, theme } = useApp();
  return (
    <AuthPage
      onComplete={(data) => {
        setUser(data);
        navigate(checkIfNeedsSetup(data) ? "/setup" : "/dashboard");
      }}
      t={t}
      theme={theme}
    />
  );
}

function SetupRoute() {
  const navigate = useNavigate();
  const { user, t, theme, lang } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <SetupSubjectPage
      user={user}
      onComplete={() => navigate("/dashboard")}
      t={t}
      theme={theme}
      lang={lang}
    />
  );
}

function DashboardRoute() {
  const navigate = useNavigate();
  const { user, t, lang, setLang, theme, setTheme, logout } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <StudentDashboard
      user={user}
      t={t}
      lang={lang}
      setLang={setLang}
      theme={theme}
      setTheme={setTheme}
      onGoTimer={() => navigate("/study")}
      onGoRevision={() => navigate("/revision")}
      onGoSchedule={() => navigate("/schedule")}
      onGoBooks={() => navigate("/books")}
      onLogout={() => {
        logout();
        navigate("/");
      }}
    />
  );
}

function StudyRoute() {
  const navigate = useNavigate();
  const { user, t, lang, setLang, theme, setTheme } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <StudyDashboard
      user={user}
      t={t}
      lang={lang}
      setLang={setLang}
      theme={theme}
      setTheme={setTheme}
      onBack={() => navigate("/dashboard")}
    />
  );
}

function RevisionRoute() {
  const navigate = useNavigate();
  const { user, t, lang, theme } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <RevisionDashboard
      user={user}
      t={t}
      lang={lang}
      theme={theme}
      onBack={() => navigate("/dashboard")}
    />
  );
}

function ScheduleRoute() {
  const navigate = useNavigate();
  const { user, t, lang, theme } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <ScheduleDashboard
      user={user}
      t={t}
      lang={lang}
      theme={theme}
      onBack={() => navigate("/dashboard")}
    />
  );
}

function BooksRoute() {
  const navigate = useNavigate();
  const { user, t, lang, theme } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  return (
    <BooksPage
      t={t}
      lang={lang}
      theme={theme}
      onBack={() => navigate("/dashboard")}
    />
  );
}

function GlobalChrome() {
  const { user, t, theme } = useApp();
  const { pathname } = useLocation();
  if (!user || pathname === "/") return null;
  return <WikiWikiBot user={user} t={t} theme={theme} />;
}

function RoutedPages() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/auth" element={<AuthRoute />} />
        <Route path="/setup" element={<SetupRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/study" element={<StudyRoute />} />
        <Route path="/revision" element={<RevisionRoute />} />
        <Route path="/schedule" element={<ScheduleRoute />} />
        <Route path="/books" element={<BooksRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <RoutedPages />
        <GlobalChrome />
      </AppProvider>
    </BrowserRouter>
  );
}
