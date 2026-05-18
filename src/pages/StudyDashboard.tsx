/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Settings, User, Play, Pause, RotateCcw, Plus, CheckCircle2, MessageCircle as WhatsAppIcon, Palette, ChevronLeft, ChevronRight, Instagram, Facebook, Clock, Coffee, Moon, Layers, Repeat, Trash2, Pencil, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import type { UserProfile, Task, TimerSettings } from "../shared/types";
import { MAIN_LOGO } from "../shared/constants";
import { cn, playDingSound } from "../shared/utils";
import { ThemeSelector } from "../shared/ui/ThemeSelector";
import { Modal } from "../shared/ui/Modal";
import { SettingRow } from "../shared/ui/SettingRow";
import { TaskManagerModal } from "../shared/ui/TaskManagerModal";

export function StudyDashboard({
  user,
  t,
  lang,
  setLang,
  theme,
  setTheme,
  onBack,
}: {
  user: UserProfile;
  t: any;
  lang: "ar" | "en";
  setLang: any;
  theme: any;
  setTheme: any;
  onBack: () => void;
  key?: string;
}) {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem("enjez_settings");
    return saved
      ? JSON.parse(saved)
      : {
          studyTime: 25,
          breakTime: 5,
          longBreakTime: 15,
          totalSessions: 4,
          longBreakInterval: 4,
        };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [showTaskManager, setShowTaskManager] = useState(false);

  // Timer State
  const [mode, setMode] = useState<"study" | "break" | "longBreak">("study");
  const [timeLeft, setTimeLeft] = useState(settings.studyTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Task State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("enjez_tasks");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  // Persist Data
  useEffect(
    () => localStorage.setItem("enjez_settings", JSON.stringify(settings)),
    [settings],
  );
  useEffect(
    () => localStorage.setItem("enjez_tasks", JSON.stringify(tasks)),
    [tasks],
  );

  // PiP Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize PiP Video Stream
  useEffect(() => {
    if (canvasRef.current && videoRef.current && !videoRef.current.srcObject) {
      // @ts-ignore
      const stream = canvasRef.current.captureStream(1);
      videoRef.current.srcObject = stream;
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Draw on Canvas when time changes
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.fillStyle = theme.primary;
        ctx.fillRect(0, 0, 500, 500);

        ctx.fillStyle = "white";
        ctx.font = "bold 120px Tajawal, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(formatTime(timeLeft), 250, 230);

        ctx.font = "bold 40px Tajawal, sans-serif";
        const modeText =
          mode === "study"
            ? lang === "ar"
              ? "وقت الدراسة"
              : "Study Time"
            : mode === "break"
              ? lang === "ar"
                ? "استراحة"
                : "Break"
              : lang === "ar"
                ? "استراحة طويلة"
                : "Long Break";
        ctx.fillText(modeText, 250, 360);
      }
    }
  }, [timeLeft, mode, theme, lang]);

  const togglePiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (videoRef.current) {
      try {
        await videoRef.current.play();
        await videoRef.current.requestPictureInPicture();
      } catch (err) {
        console.error("Failed to enter PiP:", err);
      }
    }
  };

  // Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(
        () => setTimeLeft((prev) => prev - 1),
        1000,
      );
    } else if (isActive && timeLeft === 0) {
      playDingSound();
      if (mode === "study") {
        const nextSession = sessionCount + 1;
        setSessionCount(nextSession);
        if (nextSession % settings.longBreakInterval === 1 && nextSession > 1) {
          setMode("longBreak");
          setTimeLeft(settings.longBreakTime * 60);
        } else {
          setMode("break");
          setTimeLeft(settings.breakTime * 60);
        }
      } else {
        setMode("study");
        setTimeLeft(settings.studyTime * 60);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, mode, sessionCount, settings]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(
      (mode === "study"
        ? settings.studyTime
        : mode === "break"
          ? settings.breakTime
          : settings.longBreakTime) * 60,
    );
  };

  const addTask = (text: string, sId?: number) => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      sessionId: sId || sessionCount,
      date: todayStr,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-0 flex flex-col min-h-screen">
      {/* Top Header */}
      <header className="h-24 px-10 flex justify-between items-center border-b border-[--theme-primary]/10 bg-white">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[--theme-primary] transition-colors"
          >
            {lang === "ar" ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
            <span className="font-bold hidden sm:inline">
              {t.backToDashboard}
            </span>
          </motion.button>
          <img
            src={MAIN_LOGO}
            alt="Enjez"
            className="h-20 w-auto"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowSettings(!showSettings)}
            className="px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            <Settings size={18} />
            <span className="hidden sm:inline">{t.settings}</span>
          </motion.button>

          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 rounded-xl flex items-center justify-center font-extrabold hover:bg-[--theme-primary]/5 transition-colors"
            style={{ color: theme.primary }}
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>

          <button
            onClick={() => setShowTheme(!showTheme)}
            className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 rounded-xl flex items-center justify-center hover:bg-[--theme-primary]/5 transition-colors"
            style={{ color: theme.primary }}
          >
            <Palette size={20} />
          </button>

          <div className="group relative">
            <button
              className="w-11 h-11 border-[1.5px] border-[--theme-primary]/20 rounded-xl flex items-center justify-center hover:bg-[--theme-primary]/5 transition-colors"
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

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-10">
        {/* Left/Middle: Timer Section */}
        <div className="lg:col-span-8 flex flex-col items-center justify-start pt-6 px-4">
          <div className="flex flex-col items-center w-full max-w-md">
            {/* Circular Timer UI */}
            <div className="relative w-80 h-80 md:w-[420px] md:h-[420px] flex items-center justify-center bg-white rounded-full shadow-[0_20px_80px_rgba(3,19,188,0.06)] border border-gray-50 mb-8">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background Track */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  className="fill-none stroke-gray-100"
                  strokeWidth="1.5"
                />
                {/* Progress Circle (Completes with time) */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  className="fill-none transition-all duration-1000 ease-linear"
                  stroke={theme.primary}
                  strokeWidth="2.5"
                  strokeDasharray="1285"
                  strokeDashoffset={
                    1285 *
                    (timeLeft /
                      ((mode === "study"
                        ? settings.studyTime
                        : mode === "break"
                          ? settings.breakTime
                          : settings.longBreakTime) *
                        60))
                  }
                  strokeLinecap="round"
                />
              </svg>

              {/* Progress Knob */}
              <div
                className="absolute w-full h-full -rotate-90 pointer-events-none"
                style={{
                  transform: `rotate(${(1 - timeLeft / ((mode === "study" ? settings.studyTime : mode === "break" ? settings.breakTime : settings.longBreakTime) * 60)) * 360 - 90}deg)`,
                }}
              >
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-3 h-3 bg-[--theme-primary] rounded-full shadow-[0_0_8px_rgba(3,19,188,0.4)] z-20" />
              </div>

              <div className="flex flex-col items-center justify-center z-10 w-full">
                <div className="text-[9px] md:text-[11px] font-black text-[--theme-primary]/40 uppercase tracking-[0.25em] mb-4">
                  {mode === "study"
                    ? lang === "ar"
                      ? "جلسة دراسية"
                      : "STUDY SESSION"
                    : lang === "ar"
                      ? "وقت الراحة"
                      : "BREAK TIME"}
                </div>
                <div
                  className="text-8xl md:text-9xl font-bold tracking-tight leading-none"
                  style={{ color: theme.primary }}
                >
                  {formatTime(timeLeft)}
                </div>

                {/* Main Controls - Shrinked as requested */}
                <div className="flex items-center justify-center gap-6 mt-8 md:mt-12">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetTimer}
                    className="p-1.5 text-[--theme-primary]/30 hover:text-[--theme-primary] transition-colors"
                  >
                    <RotateCcw size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-[--theme-primary] text-white shadow-[0_8px_20px_rgba(3,19,188,0.25)] hover:shadow-[0_10px_25px_rgba(3,19,188,0.35)] transition-all"
                  >
                    {isActive ? (
                      <Pause size={24} fill="currentColor" />
                    ) : (
                      <Play size={24} className="ml-0.5" fill="currentColor" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePiP}
                    className="p-1.5 text-[--theme-primary]/30 hover:text-[--theme-primary] transition-colors"
                    title={lang === "ar" ? "تايمر جانبي" : "PiP Mode"}
                  >
                    <Monitor size={20} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="bg-[#f0f2f5] p-1 rounded-2xl flex w-full max-w-[280px] mb-8 shadow-inner">
              {[
                { id: "study", label: t.study },
                { id: "break", label: lang === "ar" ? "استراحة" : "Short" },
                { id: "longBreak", label: lang === "ar" ? "طويلة" : "Long" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id as any);
                    setIsActive(false);
                    setTimeLeft(
                      (m.id === "study"
                        ? settings.studyTime
                        : m.id === "break"
                          ? settings.breakTime
                          : settings.longBreakTime) * 60,
                    );
                  }}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-[10px] md:text-xs font-medium transition-all duration-300",
                    mode === m.id
                      ? "bg-white text-[--theme-primary] shadow-[0_4px_10px_rgba(0,0,0,0.05)] font-bold"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 text-[11px] font-black text-[--theme-primary]/20 uppercase tracking-widest">
              {lang === "ar"
                ? `الدورات المكتملة: ${sessionCount - 1}`
                : `Completed Cycles: ${sessionCount - 1}`}
            </div>
          </div>
        </div>

        {/* Right: Task Panel & Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Progress Section */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[--theme-primary]/10">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-[10px] font-black text-[--theme-primary]/30 uppercase tracking-widest mb-1">
                  {lang === "ar" ? "إنجاز اليوم" : "Daily Progress"}
                </h4>
                <p className="text-lg font-black text-[--theme-primary]">
                  {completionPercentage}%
                </p>
              </div>
              <div className="text-[10px] font-bold text-[--theme-primary]/40">
                {completedTasks}/{totalTasks} {lang === "ar" ? "مهام" : "Tasks"}
              </div>
            </div>
            <div className="h-2 bg-[--theme-primary]/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-[--theme-primary] rounded-full"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Task Card */}
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[--theme-primary]/10 flex flex-col h-[400px]">
            <div className="p-5 border-b border-[--theme-primary]/10 flex justify-between items-center">
              <h3 className="font-extrabold text-[--theme-primary] flex items-center gap-2">
                {t.tasks}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-[--theme-primary] px-3 py-1 rounded-full uppercase">
                  {t.session} {sessionCount}
                </span>
                <button
                  onClick={() => setShowTaskManager(true)}
                  className="p-1.5 hover:bg-[--theme-primary]/5 text-[--theme-primary]/40 hover:text-[--theme-primary] rounded-lg transition-all"
                  title="Manage all sessions"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {tasks
                .filter((tk) => showAllTasks || tk.sessionId === sessionCount)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 py-1 border-b border-[#f0f2ff] last:border-0 group"
                  >
                    <button
                      onClick={() =>
                        setTasks(
                          tasks.map((t) =>
                            t.id === task.id
                              ? { ...t, completed: !t.completed }
                              : t,
                          ),
                        )
                      }
                      className={cn(
                        "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                        task.completed
                          ? "bg-[--theme-primary] border-[--theme-primary]"
                          : "border-[--theme-primary]/30",
                      )}
                    >
                      {task.completed && (
                        <CheckCircle2 size={12} className="text-white" />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium",
                        task.completed
                          ? "line-through text-[--theme-primary]/40"
                          : "text-[--theme-primary]",
                      )}
                    >
                      {task.text}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded-lg hover:bg-gray-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>

            <div className="p-5 bg-[#f8f9ff] rounded-b-[24px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-white p-3 rounded-xl text-sm border-2 border-transparent focus:border-[--theme-primary]/20 outline-none transition-all"
                  placeholder={t.addTask}
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTaskText.trim()) {
                      addTask(newTaskText.trim());
                      setNewTaskText("");
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newTaskText.trim()) {
                      addTask(newTaskText.trim());
                      setNewTaskText("");
                    }
                  }}
                  className="p-3 rounded-xl text-white shadow-md active:scale-95 transition-all"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Dashboard Footer */}
      <footer className="p-8 mt-auto flex justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
        <a
          href="https://www.instagram.com/enjez.jo/"
          target="_blank"
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[--theme-primary]/10 hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
        >
          <Instagram size={18} />
        </a>
        <a
          href="https://wa.me/+962796156751"
          target="_blank"
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[--theme-primary]/10 hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
        >
          <WhatsAppIcon size={18} />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=100063516910319"
          target="_blank"
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[--theme-primary]/10 hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
        >
          <Facebook size={18} />
        </a>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal title={t.settings} onClose={() => setShowSettings(false)}>
            <div className="space-y-4">
              <SettingRow
                icon={Clock}
                label={t.studySession}
                value={settings.studyTime}
                min={25}
                max={90}
                unit={lang === "ar" ? "دقيقة" : "min"}
                onChange={(v) => setSettings({ ...settings, studyTime: v })}
              />
              <SettingRow
                icon={Coffee}
                label={t.rest}
                value={settings.breakTime}
                min={5}
                max={30}
                unit={lang === "ar" ? "دقيقة" : "min"}
                onChange={(v) => setSettings({ ...settings, breakTime: v })}
              />
              <SettingRow
                icon={Moon}
                label={t.longRest}
                value={settings.longBreakTime}
                min={30}
                max={120}
                unit={lang === "ar" ? "دقيقة" : "min"}
                onChange={(v) => setSettings({ ...settings, longBreakTime: v })}
              />
              <SettingRow
                icon={Layers}
                label={lang === "ar" ? "الهدف اليومي" : "Daily Goal"}
                value={settings.totalSessions}
                min={1}
                max={20}
                unit={lang === "ar" ? "جلسات" : "sessions"}
                onChange={(v) => setSettings({ ...settings, totalSessions: v })}
              />
              <SettingRow
                icon={Repeat}
                label={
                  lang === "ar"
                    ? "فترة الراحة الطويلة بعد الجلسة رقم"
                    : "Long Break After Session #"
                }
                value={settings.longBreakInterval}
                min={1}
                max={settings.totalSessions}
                unit={lang === "ar" ? "جلسة" : "sessions"}
                onChange={(v) =>
                  setSettings({ ...settings, longBreakInterval: v })
                }
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTaskManager && (
          <TaskManagerModal
            onClose={() => setShowTaskManager(false)}
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
            toggleTask={(id) =>
              setTasks(
                tasks.map((t) =>
                  t.id === id ? { ...t, completed: !t.completed } : t,
                ),
              )
            }
            totalSessions={settings.totalSessions}
            t={t}
            lang={lang}
          />
        )}
      </AnimatePresence>

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

      {/* Hidden elements for PiP */}
      <canvas ref={canvasRef} width="500" height="500" className="hidden" />
      <video ref={videoRef} muted autoPlay playsInline className="hidden" />
    </div>
  );
}

// --- Subcomponents ---

