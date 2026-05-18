import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { PRIMARY_BLUE, UserProfile, createTranslations } from "../AppCore";

type Lang = "ar" | "en";
type Theme = { bg: string; primary: string };
type Translations = ReturnType<typeof createTranslations>;

interface AppContextValue {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  lang: Lang;
  setLang: React.Dispatch<React.SetStateAction<Lang>>;
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  t: Translations;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("enjez_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Lang>("ar");
  const [theme, setTheme] = useState<Theme>({ bg: "#ffffff", primary: PRIMARY_BLUE });

  useEffect(() => {
    if (user) localStorage.setItem("enjez_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-primary", theme.primary);
    document.documentElement.style.setProperty("--theme-bg", theme.bg);
  }, [theme.primary, theme.bg]);

  const setUser = (u: UserProfile | null) => {
    if (u === null) localStorage.removeItem("enjez_user");
    setUserState(u);
  };

  const logout = () => {
    localStorage.removeItem("enjez_user");
    setUserState(null);
  };

  const t = useMemo(() => createTranslations(lang, user), [lang, user]);

  const value: AppContextValue = { user, setUser, lang, setLang, theme, setTheme, t, logout };

  return (
    <AppContext.Provider value={value}>
      <div
        className="min-h-screen transition-colors duration-300"
        style={{ backgroundColor: theme.bg, color: "#1a1a1a", direction: "rtl" }}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
