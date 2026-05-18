/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { User, Play, X, Calendar as CalendarIcon, Palette, Layers, Book, Activity, CalendarDays, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, isSameDay } from "date-fns";
import type { UserProfile, Task } from "../shared/types";
import { SIDEBAR_LOGO } from "../shared/constants";
import { getSubjectsForGeneration } from "../shared/subjects";
import { Button } from "../shared/ui/Button";
import { ThemeSelector } from "../shared/ui/ThemeSelector";
import { CircularProgress } from "../shared/ui/CircularProgress";
import { CalendarGrid } from "../shared/ui/CalendarGrid";
import { DaySummaryWidget } from "../shared/ui/DaySummaryWidget";

export function StudentDashboard({
  user,
  t,
  lang,
  setLang,
  theme,
  setTheme,
  onGoTimer,
  onGoRevision,
  onGoSchedule,
  onGoBooks,
  onLogout,
}: {
  user: UserProfile;
  t: any;
  lang: "ar" | "en";
  setLang: any;
  theme: any;
  setTheme: any;
  onGoTimer: () => void;
  onGoRevision: () => void;
  onGoSchedule: () => void;
  onGoBooks: () => void;
  onLogout: () => void;
  key?: string;
}) {
  const [showTheme, setShowTheme] = useState(false);

  const userId = user ? (user.phone || user.name) : null;
  const countdownKey = userId ? `enjez_countdown_${userId}` : null;

  const [examDateStr, setExamDateStr] = useState<string | null>(() =>
    countdownKey ? localStorage.getItem(countdownKey) : null,
  );
  const [tempDate, setTempDate] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!countdownKey) {
      setExamDateStr(null);
      return;
    }
    setExamDateStr(localStorage.getItem(countdownKey));
  }, [countdownKey]);

  useEffect(() => {
    if (!examDateStr) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [examDateStr]);

  const resetExamDate = () => {
    if (!countdownKey) return;
    localStorage.removeItem(countdownKey);
    setExamDateStr(null);
    setTempDate("");
  };

  // Calculate subjects progress
  const [selectedSubjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("enjez_selected_subjects");
    if (saved) return JSON.parse(saved);
    if (user.generation === "2009")
      return getSubjectsForGeneration(user.generation).map((s) => s.id);
    return [];
  });

  const [completedLessonIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("enjez_completed_lessons");
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("enjez_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const selectedSubjects = getSubjectsForGeneration(user.generation).filter(
    (s) => selectedSubjectIds.includes(s.id),
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const getDayStats = (day: Date) => {
    const isToday = isSameDay(day, new Date());
    const dateStr = format(day, "yyyy-MM-dd");
    const dayTasks = tasks.filter(
      (t) => t.date === dateStr || (isToday && !t.date),
    );

    const totalCount = dayTasks.length;
    const completedCount = dayTasks.filter((t) => t.completed).length;
    let completion = 0;
    if (totalCount > 0) {
      completion = completedCount / totalCount;
    }

    return { completion, completedCount, totalCount };
  };

  const saveExamDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!countdownKey || !tempDate) return;
    localStorage.setItem(countdownKey, tempDate);
    setExamDateStr(tempDate);
  };

  // Calculate days remaining (kept for legacy consumers)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = examDateStr ? new Date(examDateStr) : null;
  const diffTime = examDate ? examDate.getTime() - today.getTime() : 0;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = diffDays > 0 ? diffDays : 0;

  // Live countdown (D / H / M / S)
  const examEndMs = examDate ? new Date(examDateStr + "T23:59:59").getTime() : 0;
  const liveDiff = Math.max(0, examEndMs - now);
  const cdDays = Math.floor(liveDiff / (1000 * 60 * 60 * 24));
  const cdHours = Math.floor((liveDiff / (1000 * 60 * 60)) % 24);
  const cdMinutes = Math.floor((liveDiff / (1000 * 60)) % 60);
  const cdSeconds = Math.floor((liveDiff / 1000) % 60);
  const pad2 = (n: number) => n.toString().padStart(2, "0");

  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 3 && currentHour < 12;

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-row overflow-hidden">
      {/* Right Sidebar (in RTL mode, it's visually on the right) */}
      <aside
        className="w-[280px] text-white flex flex-col rounded-l-[40px] shadow-2xl flex-shrink-0 z-20 py-10 px-6 transition-all"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="flex justify-center mb-16">
          <img
            src={SIDEBAR_LOGO}
            alt="Enjez"
            className="h-28 w-auto object-contain drop-shadow-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <nav className="space-y-4">
          <button
            onClick={onGoBooks}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <Book size={24} className="text-white/80 group-hover:text-white" />
            <span className="font-bold text-lg">{t.books}</span>
          </button>
          <button
            onClick={onGoRevision}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <Activity
              size={24}
              className="text-white/80 group-hover:text-white"
            />
            <span className="font-bold text-lg">{t.revisionTracking}</span>
          </button>
          <button
            onClick={onGoSchedule}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition-colors group"
          >
            <CalendarDays
              size={24}
              className="text-white/80 group-hover:text-white"
            />
            <span className="font-bold text-lg">{t.schedule}</span>
          </button>
        </nav>
        <div className="mt-auto pt-8">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/10 transition-colors group opacity-80 hover:opacity-100"
          >
            <LogOut
              size={24}
              className="text-white/80 group-hover:text-white"
            />
            <span className="font-bold text-lg">{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header - transparent background, no logo */}
        <header className="h-24 px-10 flex justify-end items-center absolute top-0 left-0 right-0 z-10 w-full pointer-events-none">
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-[--theme-primary]/5 pointer-events-auto">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 bg-white rounded-xl flex items-center justify-center font-extrabold hover:bg-[--theme-primary]/5 transition-colors"
              style={{ color: theme.primary }}
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>

            <button
              onClick={() => setShowTheme(!showTheme)}
              className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 bg-white rounded-xl flex items-center justify-center hover:bg-[--theme-primary]/5 transition-colors"
              style={{ color: theme.primary }}
            >
              <Palette size={20} />
            </button>

            <div className="group relative">
              <button
                className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 bg-white rounded-xl flex items-center justify-center hover:bg-[--theme-primary]/5 transition-colors"
                style={{ color: theme.primary }}
              >
                <User size={20} />
              </button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-[0_10px_40px_rgba(3,19,188,0.15)] rounded-2xl p-5 hidden group-hover:block z-50 border border-[--theme-primary]/5">
                <p className="font-extrabold border-b border-[--theme-primary]/10 pb-3 mb-3 text-[--theme-primary] uppercase text-xs tracking-wider">
                  {t.profile}
                </p>
                <div className="space-y-2 text-sm text-[--theme-primary]/80">
                  <p>
                    <strong>{t.name}:</strong> {user.name}
                  </p>
                  <p>
                    <strong>{t.phone}:</strong> {user.phone}
                  </p>
                  <p>
                    <strong>{t.generation}:</strong> {user.generation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col p-10 space-y-8 overflow-y-auto mt-20">
          <div className="text-right w-full space-y-2">
            <h1
              className="text-2xl md:text-3xl font-black"
              style={{ color: theme.primary }}
            >
              {isMorning
                ? (lang === 'ar' ? `صباح الخير، يا ${user.name}!` : `Good morning, ${user.name}!`)
                : (lang === 'ar' ? `مساء الخير، يا ${user.name}!` : `Good evening, ${user.name}!`)}
            </h1>
            <p
              className="text-lg opacity-60 font-medium"
              style={{ color: theme.primary }}
            >
              {t.plan}
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
            {/* Left Column */}
            <div className="xl:col-span-2 flex flex-col gap-6">
              {/* Subject Progress Section */}
              <motion.div
                onClick={onGoRevision}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent flex flex-col cursor-pointer transition-all hover:shadow-[0_20px_60px_rgba(3,19,188,0.1)] group self-start w-full"
                style={{ borderColor: `${theme.primary}10` }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                    }}
                  >
                    <Layers size={22} />
                  </div>
                  <h2
                    className="text-xl font-black group-hover:opacity-80 transition-opacity"
                    style={{ color: theme.primary }}
                  >
                    {t.subjectProgress}
                  </h2>
                </div>

                {selectedSubjects.length === 0 ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#f8f9ff] border-2 border-dashed rounded-[2rem]"
                    style={{ borderColor: `${theme.primary}20` }}
                  >
                    <Layers
                      size={40}
                      className="mb-4 opacity-40"
                      style={{ color: theme.primary }}
                    />
                    <h3
                      className="font-bold mb-2 opacity-80 text-lg"
                      style={{ color: theme.primary }}
                    >
                      {t.noSubjectsSelected}
                    </h3>
                    <Button
                      onClick={onGoRevision}
                      variant="outline"
                      className="mt-4"
                    >
                      {t.goToRevision}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap justify-center sm:justify-between gap-6 px-4">
                    {selectedSubjects.map((subject, idx) => {
                      // compute %
                      let totalLessons = 0;
                      let compLessons = 0;
                      subject.units.forEach((u) => {
                        u.lessons.forEach((l) => {
                          totalLessons++;
                          if (completedLessonIds.includes(l.id)) compLessons++;
                        });
                      });
                      const perc =
                        totalLessons > 0
                          ? Math.round((compLessons / totalLessons) * 100)
                          : 0;
                      return (
                        <CircularProgress
                          key={subject.id}
                          percentage={perc}
                          label={subject.title}
                          color={theme.primary}
                          delay={0.1 + idx * 0.1}
                        />
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Calendar Grid Section */}
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[--theme-primary]/10 p-6 w-full">
                <CalendarGrid
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  selectedDay={selectedDay}
                  setSelectedDay={setSelectedDay}
                  getDayStats={getDayStats}
                  examDateStr={examDateStr}
                  t={t}
                  theme={theme}
                  lang={lang}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Exam Countdown Card — per-user, only when logged in */}
              {user && countdownKey && (
              <div
                className="bg-white rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(3,19,188,0.04)] border border-transparent relative overflow-hidden"
                style={{ borderColor: `${theme.primary}10` }}
              >
                <div
                  className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none rounded-bl-full"
                  style={{ backgroundColor: theme.primary }}
                />

                {!examDateStr ? (
                  <div className="flex flex-col items-center text-center relative z-10 space-y-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1 z-10"
                      style={{
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary,
                      }}
                    >
                      <CalendarIcon size={24} />
                    </div>
                    <form
                      onSubmit={saveExamDate}
                      className="w-full flex flex-col gap-3 z-10"
                    >
                      <label
                        className="text-sm font-bold opacity-70"
                        style={{ color: theme.primary }}
                      >
                        {lang === "ar" ? "حدد تاريخ نهاية المراجعة:" : t.enterExamDate}
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border bg-[#f8f9ff] text-center font-mono outline-none focus:ring-2"
                        style={{
                          borderColor: `${theme.primary}20`,
                          color: theme.primary,
                        }}
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {lang === "ar" ? "بدء العد التنازلي" : "Start Countdown"}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col gap-4" dir={lang === "ar" ? "rtl" : "ltr"}>
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${theme.primary}15`,
                          color: theme.primary,
                        }}
                      >
                        <CalendarIcon size={24} />
                      </div>
                      <div className="flex-1 text-right">
                        <h3
                          className="text-xs font-bold uppercase tracking-wider mb-0.5 opacity-70"
                          style={{ color: theme.primary }}
                        >
                          {t.daysRemaining}
                        </h3>
                        <p className="text-[11px] font-mono opacity-60" style={{ color: theme.primary }} dir="ltr">
                          {examDateStr}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetExamDate}
                        title={lang === "ar" ? "إعادة تعيين التاريخ" : "Reset date"}
                        className="p-2 rounded-xl transition-all hover:opacity-80 shrink-0"
                        style={{
                          backgroundColor: `${theme.primary}10`,
                          color: theme.primary,
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2" dir="ltr">
                      {[
                        { label: lang === "ar" ? "يوم" : "Days", value: cdDays },
                        { label: lang === "ar" ? "ساعة" : "Hrs", value: cdHours },
                        { label: lang === "ar" ? "دقيقة" : "Min", value: cdMinutes },
                        { label: lang === "ar" ? "ثانية" : "Sec", value: cdSeconds },
                      ].map((u) => (
                        <div
                          key={u.label}
                          className="rounded-xl py-2.5 flex flex-col items-center justify-center"
                          style={{
                            backgroundColor: `${theme.primary}10`,
                            color: theme.primary,
                          }}
                        >
                          <span className="text-2xl font-black leading-none tabular-nums">
                            {pad2(u.value)}
                          </span>
                          <span className="text-[10px] font-bold opacity-70 mt-1">
                            {u.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {liveDiff === 0 && (
                      <p className="text-center text-xs font-bold" style={{ color: theme.primary }}>
                        {lang === "ar" ? "انتهى الوقت! بالتوفيق 💙" : "Time's up! Good luck 💙"}
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Go to Timer Card */}
              <motion.div
                onClick={onGoTimer}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="cursor-pointer flex-none rounded-[2rem] p-6 flex flex-col justify-center items-center text-center shadow-[0_20px_50px_rgba(3,19,188,0.08)] border transition-all group relative overflow-hidden"
                style={{
                  backgroundColor: theme.primary,
                  borderColor: "transparent",
                  minHeight: "160px",
                }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none rounded-bl-full bg-white" />

                <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 bg-white/20 backdrop-blur-sm shadow-xl">
                  <Play size={40} className="text-white ml-2 drop-shadow-md" />
                </div>

                <h2 className="text-2xl font-black mb-2 text-white drop-shadow-sm">
                  {t.goTimer}
                </h2>
                <p className="text-sm font-medium text-white/80 max-w-[80%] mx-auto leading-relaxed">
                  {t.timerCardDesc}
                </p>
              </motion.div>

              {/* Day Summary Section */}
              <div
                className="rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border p-5 mt-auto"
                style={{
                  backgroundColor: `${theme.primary}0d`,
                  borderColor: `${theme.primary}26`,
                }}
              >
                <DaySummaryWidget
                  selectedDay={selectedDay}
                  getDayStats={getDayStats}
                  t={t}
                  lang={lang}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {showTheme && (
          <ThemeSelector
            onClose={() => setShowTheme(false)}
            theme={theme}
            setTheme={setTheme}
            t={t}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Revision Tracking Component ---
