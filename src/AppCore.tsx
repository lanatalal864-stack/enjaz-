/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Languages,
  Play,
  Pause,
  RotateCcw,
  Plus,
  CheckCircle2,
  Circle,
  MessageCircle,
  X,
  Send,
  Calendar as CalendarIcon,
  Palette,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Instagram,
  Facebook,
  MessageCircle as WhatsAppIcon,
  Clock,
  Coffee,
  Moon,
  Layers,
  Repeat,
  Trash2,
  Pencil,
  Sparkles,
  Book,
  Activity,
  ArrowRight,
  Monitor,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Markdown from "react-markdown";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const playDingSound = () => {
  try {
    const audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      300,
      audioCtx.currentTime + 1,
    );

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 1);
  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

// --- Constants & Types ---
export const PRIMARY_BLUE = "#0313bc";
const MAIN_LOGO =
  "https://www.image2url.com/r2/default/images/1776775901655-816d8ea0-471d-453e-8de2-4c05ed8a8340.png";
const SECONDARY_LOGO =
  "https://www.image2url.com/r2/default/images/1776809871107-05f6b7fc-c041-43a4-a447-06b2dfb069c4.png";
const WIKI_WIKI_IMG =
  "https://www.image2url.com/r2/default/images/1776810346986-b21be818-24a3-4f54-8a0b-80f369330c10.png";
const SIDEBAR_LOGO =
  "https://www.image2url.com/r2/default/images/1776959838510-5cfa246c-e893-47f0-98b6-be0405ec32f3.png";

export interface UserProfile {
  name: string;
  phone: string;
  generation: string;
}

type ScheduleEvent = {
  start: string;
  end: string;
  label: string;
  emoji: string;
  kind: "study" | "break" | "lunch" | "morning" | "wind" | "prayer" | "other";
};

type StructuredSchedule = {
  studentName: string;
  inputs: { wake: string; sleep: string; hours: string; lunch: string; pref: "day" | "night" };
  events: ScheduleEvent[];
  tips: string[];
  scheduledMinutes: number;
  requestedMinutes: number;
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
  sessionId: number;
  date?: string; // Format: yyyy-MM-dd
}

interface TimerSettings {
  studyTime: number;
  breakTime: number;
  longBreakTime: number;
  totalSessions: number;
  longBreakInterval: number;
}

interface StudyHistoryEntry {
  date: string;
  hours: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface LessonConfig {
  id: string;
  title: string;
}

export interface UnitConfig {
  id: string;
  title: string;
  lessons: LessonConfig[];
}

export interface SubjectConfig {
  id: string;
  title: string;
  units: UnitConfig[];
}

import {
  arabic2009,
  english2009,
  history2009,
  islamic2009,
} from "./data/subjects2009";
import { subjects2008 } from "./data/subjects2008";

const createSubject = (id: string, title: string): SubjectConfig => ({
  id,
  title,
  units: [
    {
      id: `${id}_u1`,
      title: "الوحدة الأولى",
      lessons: [
        { id: `${id}_u1_l1`, title: "الدرس الأول" },
        { id: `${id}_u1_l2`, title: "الدرس الثاني" },
      ],
    },
    {
      id: `${id}_u2`,
      title: "الوحدة الثانية",
      lessons: [
        { id: `${id}_u2_l1`, title: "الدرس الأول" },
        { id: `${id}_u2_l2`, title: "الدرس الثاني" },
      ],
    },
  ],
});

export const getSubjectsForGeneration = (
  generation: string,
): SubjectConfig[] => {
  if (generation === "2009") {
    return [
      { id: "2009_ar", title: "اللغة العربية", units: arabic2009 },
      { id: "2009_en", title: "اللغة الإنجليزية", units: english2009 },
      { id: "2009_hist", title: "تاريخ الأردن", units: history2009 },
      { id: "2009_islamic", title: "التربية الإسلامية", units: islamic2009 },
    ];
  }

  if (generation === "2008") {
    return subjects2008;
  }

  // Default fallback covering the old generic ones
  return [
    createSubject("math", "الرياضيات"),
    createSubject("physics", "الفيزياء"),
    createSubject("chemistry", "الكيمياء"),
    createSubject("biology", "الأحياء"),
    createSubject("arabic", "اللغة العربية"),
    createSubject("english", "اللغة الإنجليزية"),
  ];
};

// --- Icons & UI Components ---
const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95",
        variant === "primary" && "bg-[#0313bc] text-white hover:shadow-lg",
        variant === "outline" &&
          "border-2 border-[#0313bc] text-[#0313bc] bg-white hover:bg-[#0313bc]/5",
        variant === "ghost" && "text-[#0313bc] hover:bg-[#0313bc]/5",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// --- App Component ---
export const checkIfNeedsSetup = (userData: UserProfile) => {
  const saved = localStorage.getItem("enjez_selected_subjects");
  if (saved && JSON.parse(saved).length > 0) return false;

  if (userData.generation === "2009") {
    const available = getSubjectsForGeneration(userData.generation);
    localStorage.setItem("enjez_selected_subjects", JSON.stringify(available.map((s) => s.id)));
    return false;
  }
  return true;
};

export function createTranslations(lang: "ar" | "en", user: UserProfile | null) {
  return {
    ar: {
      plan: "خطط، ركز، إنجز!",
      timeRunning: "الوقت بمشي وصار وقت ننجز جد...",
      startNow: "ابدأ الآن",
      login: "تسجيل الدخول",
      logout: "تسجيل الخروج",
      welcome: "يا مليون أهلًا وسهلًا!",
      name: "الاسم",
      phone: "رقم الهاتف",
      generation: "الجيل",
      settings: "الاعدادات",
      studySession: "وقت الجلسة الدراسية",
      break: "وقت الراحة",
      longBreak: "وقت الراحة الطويل",
      sessionCount: "عدد الجلسات",
      longBreakAfter: "الراحة الطويلة بعد كم جلسة؟",
      session: "جلسة",
      tasks: "مهام الجلسة",
      allTasks: "مهام اليوم",
      addTask: "إضافة مهمة",
      wikiGreeting: `مرحبا ${user?.name} كيف الحال؟ اي اشي بتحتاجه انا موجود اساعدك`,
      placeholder: "اكتب رسالة...",
      study: "دراسة",
      rest: "راحة",
      longRest: "راحة طويلة",
      reset: "إعادة",
      start: "بدء",
      pause: "إيقاف",
      profile: "الصفحة الشخصية",
      langSwitch: "English",
      themeSettings: "تعديل الألوان",
      bgCol: "لون الخلفية",
      primaryCol: "اللون الثانوي",
      home: "الصفحة الرئيسية",
      services: "خدماتنا",
      aboutTitle: "من نحن؟",
      aboutDesc:
        "إحنا فريق إنجز.. قررنا نكون جزء من رحلة كل طالب توجيهي، ونمشي معك خطوة بخطوة من أول يوم دراسة لحد يوم النتائج (وممكن أبعد من هيك كمان!). هدفنا الأساسي نوفرلك كل اللي بتحتاجه؛ من أفضل البكجات لبطاقات نخبة المعلمين، وبنتابع معك أدق تفاصيل دراستك. والأهم من هيك، حضرنالك تحديات دراسية مستمرة تضمن إنك تضلك ملتزم وما يبرد حماسك. شو بتستنى؟ انضم الآن لأكبر مجتمع تحديات دراسية في المملكة!",
      joinNow: "إنضم الآن",
      storeSoon: "المتجر الإلكتروني قريبًا...",
      secureSite: "الموقع آمن, جميع الحقوق محفوظة © 2026 إنجز",
      daySummary: "ملخص اليوم",
      completion: "مدى الإنجاز",
      completedTasks: "المهام المنجزة",
      adviceTitle: "نصيحة إنجز",
      lowPerformanceAdvice:
        "البدايات دائماً صعبة، لا تستسلم! غداً فرصة جديدة للتعويض.",
      mediumPerformanceAdvice:
        "أداء جيد! استمر في المحاولة وستصل لأهدافك بالتأكيد.",
      highPerformanceAdvice:
        "أداء رائع ومبهر! أنت بطل حقيقي، حافظ على هذا المستوى.",
      goTimer: "الذهاب للمؤقت",
      timerCardDesc: "ابدأ جلسة دراسية جديدة وركز على أهدافك!",
      dashboardTitle: "لوحة متابعة الطالب",
      backToDashboard: "العودة للوحة المتابعة",
      selectGeneration: "اختر الجيل...",
      books: "الكتب",
      schedule: "الجدول",
      createSchedule: "عمل جدول",
      scheduleTitle: "الجدول الدراسي الذكي",
      scheduleDesc: "الذكاء الاصطناعي رح يبنيلك أفضل جدول مخصص الك بالضبط!",
      scheduleFormWakeTitle: "متى بتصحى من النوم؟",
      scheduleFormSleepTitle: "أي ساعة بتفضل تنام؟",
      scheduleFormStudyHours: "كم ساعة بدك تدرس؟",
      scheduleFormLunchTime: "أي ساعة وقت الغداء؟",
      scheduleFormFocusTime: "متى بكون تركيزك فل؟",
      scheduleFormStudyTimeDay: "النهار",
      scheduleFormStudyTimeNight: "الليل",
      generateScheduleBtn: "أنشئ لي الجدول!",
      scheduleGenerating: "جاري تحليل المعطيات وإنشاء الجدول...",
      revisionTracking: "تتبع المراجعات",
      subjectProgress: "تقدم مراجعة المواد",
      math: "الرياضيات",
      physics: "الفيزياء",
      chemistry: "الكيمياء",
      biology: "الأحياء",
      daysRemaining: "الأيام المتبقية للنهاية",
      enterExamDate: "أدخل تاريخ آخر يوم امتحانات",
      saveDate: "حفظ التاريخ",
      day: "يوم",
      selectSubjectsTitle: "قم باختيار موادك الوزارية:",
      selectSubjectsDesc:
        "الرجاء اختيار 4 مواد بالضبط لتتبع تقدم مراجعتك فيها. (يمكنك الاختيار مرة واحدة)",
      saveSubjects: "حفظ المواد",
      noSubjectsSelected: "لم تقم باختيار المواد بعد.",
      goToRevision: "اذهب لتتبع المراجعات",
      lessonsCompleted: "تم إنهاء",
    },
    en: {
      plan: "Plan, Focus, Achieve!",
      timeRunning: "Time is running and it's time to get serious...",
      startNow: "Start Now",
      login: "Login",
      logout: "Log Out",
      welcome: "A Million Welcomes!",
      name: "Name",
      phone: "Phone Number",
      generation: "Generation",
      settings: "Settings",
      studySession: "Study Session Time",
      break: "Break Time",
      longBreak: "Long Break Time",
      sessionCount: "Session Count",
      longBreakAfter: "Long Break After How Many Sessions?",
      session: "Session",
      tasks: "Session Tasks",
      allTasks: "All Day Tasks",
      addTask: "Add Task",
      wikiGreeting: `Hello ${user?.name}, how's it going? Anything you need, I'm here to help`,
      placeholder: "Write a message...",
      study: "Study",
      rest: "Rest",
      longRest: "Long Rest",
      reset: "Reset",
      start: "Start",
      pause: "Pause",
      profile: "Personal Page",
      langSwitch: "العربية",
      themeSettings: "Color Settings",
      bgCol: "Background Color",
      primaryCol: "Secondary Color",
      home: "Home",
      services: "Our Services",
      aboutTitle: "About Us",
      aboutDesc:
        "We are the Enjez team... We decided to be part of every Tawjihi student's journey and stay with them step by step from the beginning until results day, and maybe even after, who knows! We are here to provide them with the best packages, top-tier educator cards, and track their study details efficiently. Most importantly, we provide constant study challenges to ensure their commitment never stops. Join the largest study challenge community in the Kingdom!",
      joinNow: "Join Now",
      storeSoon: "E-store coming soon...",
      secureSite: "Secure site and all rights reserved © 2026 Enjez",
      daySummary: "Day Summary",
      completion: "Completion Rate",
      completedTasks: "Completed Tasks",
      adviceTitle: "Enjez Advice",
      lowPerformanceAdvice:
        "Beginnings are always hard, don't give up! Tomorrow is a new chance.",
      mediumPerformanceAdvice:
        "Good job! Keep trying and you'll definitely reach your goals.",
      highPerformanceAdvice:
        "Amazing performance! You're a true champion, keep it up.",
      goTimer: "Go to Timer",
      timerCardDesc: "Start a new study session and focus on your goals!",
      dashboardTitle: "Student Dashboard",
      backToDashboard: "Back to Dashboard",
      selectGeneration: "Select Generation...",
      books: "Books",
      schedule: "Schedule",
      createSchedule: "Create Schedule",
      scheduleTitle: "Smart Study Schedule",
      scheduleDesc: "AI will build you the best schedule tailored exactly for you!",
      scheduleFormWakeTitle: "When do you wake up?",
      scheduleFormSleepTitle: "What time do you prefer to sleep?",
      scheduleFormStudyHours: "How many hours do you want to study?",
      scheduleFormLunchTime: "What time is your lunch?",
      scheduleFormFocusTime: "When is your focus full?",
      scheduleFormStudyTimeDay: "Daytime",
      scheduleFormStudyTimeNight: "Nighttime",
      generateScheduleBtn: "Generate Schedule!",
      scheduleGenerating: "Analyzing data and generating schedule...",
      revisionTracking: "Revision Tracking",
      subjectProgress: "Subject Revision Progress",
      math: "Math",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      daysRemaining: "Days Until Finish",
      enterExamDate: "Enter your last exam date",
      saveDate: "Save Date",
      day: "days",
      selectSubjectsTitle: "Select Your Subjects",
      selectSubjectsDesc:
        "Please select 4 subjects to track your revision progress. (You can choose once)",
      saveSubjects: "Save Subjects",
      noSubjectsSelected: "You haven't selected your subjects yet.",
      goToRevision: "Go to Revision Tracking",
      lessonsCompleted: "Completed",
    },
  }[lang];
}

// --- Pages ---

export function LandingPage({
  onStart,
  onLogin,
  t,
  theme,
}: {
  onStart: () => void;
  onLogin: () => void;
  t: any;
  theme: any;
  key?: string;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="h-24 px-10 flex justify-between items-center bg-white border-b border-[#0313bc]/10">
        <img
          src={MAIN_LOGO}
          alt="Enjez Logo"
          className="h-20 w-auto"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center gap-8">
          <button
            onClick={() =>
              document
                .getElementById("hero")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[#0313bc] font-light hover:underline transition-all"
          >
            {t.home}
          </button>
          <button
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[#0313bc] font-light hover:underline transition-all"
          >
            {t.services}
          </button>
          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[#0313bc] font-light hover:underline transition-all"
          >
            {t.aboutTitle}
          </button>
          <Button
            onClick={onLogin}
            className="rounded-xl px-10"
            style={{ backgroundColor: theme.primary }}
          >
            {t.login}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main
        id="hero"
        className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: theme.primary }}
          >
            {t.plan}
          </h1>
          <p className="text-[#0313bc]/60 text-xl md:text-2xl font-medium">
            {t.timeRunning}
          </p>
          <Button
            onClick={onStart}
            className="text-xl px-16 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            {t.startNow}
          </Button>

          {/* Social Icons */}
          <div className="pt-8 flex justify-center gap-8">
            <a
              href="https://www.instagram.com/enjez.jo/"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
            >
              <Instagram size={28} />
            </a>
            <a
              href="https://wa.me/+962796156751"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
            >
              <WhatsAppIcon size={28} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063516910319"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
            >
              <Facebook size={28} />
            </a>
          </div>
        </motion.div>
      </main>

      {/* About Us Section with Scroll Animation */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#0313bc] text-white py-20 px-10 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 flex justify-center">
            <img
              src={SECONDARY_LOGO}
              alt="Enjez Secondary"
              className="w-full max-w-[300px] h-auto drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black">{t.aboutTitle}</h2>
            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90">
              {t.aboutDesc}
            </p>
            <a
              href="https://chat.whatsapp.com/HyhhLk7JRAa3mpHFivrZVC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#0313bc] font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
            >
              {t.joinNow}
            </a>
          </div>
        </div>
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      </motion.section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 px-4 md:px-10 bg-[#f8f9ff] overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <h2
            className="text-4xl md:text-5xl font-black mb-16"
            style={{ color: theme.primary }}
          >
            إنجز شو بقدملك؟
          </h2>

          {/* Service 1: Cards */}
          <div className="flex flex-col items-center w-full mb-24">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#0313bc] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                1
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-[#0313bc]/80 text-right">
                بطاقات لنخبة من منصات المملكة:
              </p>
            </div>

            <div className="flex flex-nowrap overflow-x-auto custom-scrollbar w-full justify-start lg:justify-center gap-6 md:gap-10 pb-8 px-4 snap-x">
              {[
                {
                  name: "منصة جو أكاديمي",
                  icon: "https://www.image2url.com/r2/default/images/1777552396982-5ddccf10-0af4-4041-8de6-962d2f5a0e7e.png",
                },
                {
                  name: "منصة أساس التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552519241-8fb9d6e3-b3c1-4ee0-a35a-ce644eaef136.png",
                },
                {
                  name: "منصة ألفا التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552577782-dd641f39-fecc-4365-8075-e44241d79bb6.png",
                },
                {
                  name: "منصة وتد التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552608953-e57c7a38-e3c8-4c46-9a99-61f4a56e7797.png",
                },
                {
                  name: "منصة جولد أكاديمي",
                  icon: "https://www.image2url.com/r2/default/images/1777552646480-aafd9477-8a50-45f7-b531-7db0d6bc40f8.png",
                },
              ].map((platform, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-5 shrink-0 snap-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div
                    className="w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-28 h-28 md:w-32 md:h-32 object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span
                    className="text-base md:text-lg font-medium"
                    style={{ color: theme.primary }}
                  >
                    {platform.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Service 2: Packages */}
          <div className="flex flex-col items-center w-full mb-24">
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#0313bc] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                2
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-[#0313bc]/80 text-right">
                بكجات إنجز المميزة:
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-16 w-full max-w-5xl">
              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[#0313bc]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554573704-808e5fbe-5b24-4411-bab5-f6189cfdba75.png"
                      alt="تنظيم دراستك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0313bc] mb-2">
                  تنظيم دراستك ووقتك
                </h3>
                <p className="text-[#0313bc]/70 font-normal text-sm md:text-base">
                  منتجات صُممت خصيصًا الك
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[#0313bc]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554606316-e38e3345-2ec9-473d-ad84-485fe7842c46.png"
                      alt="منتجات لازم تكون على مكتبك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0313bc]">
                  منتجات لازم تكون على مكتبك
                </h3>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[#0313bc]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554631038-da15330b-a505-4371-98e3-136ee40beceb.png"
                      alt="شغلات ترفه عنك خلال رحلتك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[#0313bc]">
                  شغلات ترفه عنك خلال رحلتك
                </h3>
              </motion.div>
            </div>
          </div>

          {/* Service 3 & 4 Container */}
          <div className="flex flex-col lg:flex-row justify-center gap-12 lg:gap-24 w-full">
            {/* Service 3: Dawsiyat */}
            <motion.div
              className="flex items-center bg-white px-8 py-6 rounded-3xl shadow-lg border border-[#0313bc]/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#0313bc] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                  3
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#0313bc]/80 text-right">
                  دوسيات موادك
                </p>
              </div>
            </motion.div>

            {/* Service 4: Follow up */}
            <motion.div
              className="flex items-center bg-white px-8 py-6 rounded-3xl shadow-lg border border-[#0313bc]/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#0313bc] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                  4
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[#0313bc]/80 text-right leading-relaxed">
                  متابعة دراسية معك من البداية للنهاية
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Footer */}
      <footer className="py-16 flex flex-col items-center justify-center bg-white gap-4 border-t border-[#0313bc]/5">
        <p className="text-[#0313bc] font-black text-2xl tracking-tight opacity-40">
          {t.storeSoon}
        </p>
        <div className="flex flex-col items-center opacity-30 text-sm font-medium text-[#0313bc] gap-1">
          <p>{t.secureSite}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>SSL Secured Connection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function AuthPage({
  onComplete,
  t,
  theme,
}: {
  onComplete: (u: UserProfile) => void;
  t: any;
  theme: any;
  key?: string;
}) {
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    phone: "",
    generation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      // Mocking the restricted access check as requested
      // In a real app, this would query a database
      onComplete(formData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 bg-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(3,19,188,0.1)] max-w-md w-full border border-[#0313bc]/10"
      >
        <h2
          className="text-3xl font-extrabold mb-8 text-center"
          style={{ color: theme.primary }}
        >
          {t.welcome}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[#0313bc]/50 ml-1">
              {t.name}
            </label>
            <input
              type="text"
              required
              className="w-full bg-[#f8f9ff] border-2 border-transparent p-4 rounded-xl focus:border-[#0313bc]/20 focus:bg-white outline-none transition-all font-medium"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[#0313bc]/50 ml-1">
              {t.phone}
            </label>
            <input
              type="tel"
              required
              className="w-full bg-[#f8f9ff] border-2 border-transparent p-4 rounded-xl focus:border-[#0313bc]/20 focus:bg-white outline-none transition-all font-medium"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[#0313bc]/50 ml-1">
              {t.generation}
            </label>
            <select
              required
              className="w-full bg-[#f8f9ff] border-2 border-transparent p-4 rounded-xl focus:border-[#0313bc]/20 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
              value={formData.generation}
              onChange={(e) =>
                setFormData({ ...formData, generation: e.target.value })
              }
            >
              <option value="" disabled>
                {t.selectGeneration}
              </option>
              <option value="2007">2007</option>
              <option value="2008">2008</option>
              <option value="2009">2009</option>
              <option value="2010">2010</option>
            </select>
          </div>
          <Button
            type="submit"
            className="w-full py-5 text-xl rounded-2xl shadow-xl mt-4"
            style={{ backgroundColor: theme.primary }}
          >
            {t.startNow}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

// --- Setup Subject Page (After Auth if needed) ---
const MINISTERIAL_SUBJECTS_2008: { id: string; title: string }[] = [
  { id: "2008_en_adv", title: "اللغة الإنجليزية متقدم" },
  { id: "2008_ar_spec", title: "اللغة العربية تخصص" },
  { id: "2008_bio", title: "الأحياء" },
  { id: "2008_chem", title: "الكيمياء" },
  { id: "2008_phys", title: "الفيزياء" },
  { id: "2008_math_adv", title: "الرياضيات المتقدم" },
  { id: "2008_bus_math", title: "رياضيات الأعمال" },
  { id: "2008_earth", title: "علوم الأرض" },
  { id: "2008_hist_spec", title: "تاريخ الأردن تخصص" },
  { id: "2008_islamic_spec", title: "التربية الإسلامية تخصص" },
  { id: "2008_psych", title: "علم النفس والاجتماع" },
  { id: "2008_geo", title: "الجغرافيا" },
];

export function SetupSubjectPage({
  user,
  onComplete,
  t,
  theme,
  lang,
}: {
  user: UserProfile;
  onComplete: () => void;
  t: any;
  theme: any;
  lang: "ar" | "en";
  key?: string;
}) {
  const availableSubjects =
    user.generation === "2008"
      ? MINISTERIAL_SUBJECTS_2008
      : getSubjectsForGeneration(user.generation);

  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const limitReached = tempSelection.length >= 4;

  const handleToggleSelection = (id: string) => {
    if (tempSelection.includes(id)) {
      setTempSelection(tempSelection.filter((s) => s !== id));
      return;
    }
    if (limitReached) return;
    setTempSelection([...tempSelection, id]);
  };

  const handleSaveSubjects = () => {
    if (tempSelection.length === 4) {
      localStorage.setItem("enjez_selected_subjects", JSON.stringify(tempSelection));
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent text-center max-w-4xl w-full"
        style={{ borderColor: `${theme.primary}10` }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{
            backgroundColor: `${theme.primary}15`,
            color: theme.primary,
          }}
        >
          <Layers size={40} />
        </div>
        <h2
          className="text-3xl font-black mb-3"
          style={{ color: theme.primary }}
        >
          قم باختيار موادك الوزارية:
        </h2>
        <div className="flex items-center justify-center gap-3 mb-4">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-black tabular-nums"
            style={{
              backgroundColor: tempSelection.length === 4 ? theme.primary : `${theme.primary}15`,
              color: tempSelection.length === 4 ? "#ffffff" : theme.primary,
            }}
          >
            {tempSelection.length} / 4
          </span>
          <span className="text-sm font-bold opacity-70" style={{ color: theme.primary }}>
            {tempSelection.length === 4 ? "تم تحديد العدد المطلوب ✓" : "مواد محددة"}
          </span>
        </div>
        <p className="text-lg opacity-60 font-medium mb-10 text-gray-600 max-w-lg mx-auto">
          الرجاء اختيار 4 مواد بالضبط لتتبع تقدم مراجعتك فيها.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 text-right pr-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {availableSubjects.map((subject) => {
            const isSelected = tempSelection.includes(subject.id);
            const isDisabled = !isSelected && limitReached;
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => handleToggleSelection(subject.id)}
                disabled={isDisabled}
                aria-pressed={isSelected}
                className={cn(
                  "relative p-6 rounded-2xl border-2 transition-all flex items-center justify-between group",
                  isSelected
                    ? "border-transparent text-white shadow-xl scale-[1.02] ring-4 ring-offset-2"
                    : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5",
                  isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer",
                )}
                style={{
                  backgroundColor: isSelected ? theme.primary : "white",
                  ...(isSelected ? { ["--tw-ring-color" as any]: `${theme.primary}40` } : {}),
                }}
              >
                {isSelected && (
                  <span
                    className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
                    style={{ color: theme.primary }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                    isSelected
                      ? "border-white bg-white/25"
                      : "border-gray-300 group-hover:border-gray-500",
                  )}
                >
                  {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                </div>
                <span className="font-bold text-lg mr-3 text-right flex-1 leading-snug">
                  {subject.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center">
          {tempSelection.length < 4 && (
            <p className="text-sm font-bold mb-3 opacity-70" style={{ color: theme.primary }}>
              اختر {4 - tempSelection.length} {4 - tempSelection.length === 1 ? "مادة" : "مواد"} إضافية لتفعيل الزر
            </p>
          )}
          <Button
            onClick={handleSaveSubjects}
            disabled={tempSelection.length !== 4}
            className="w-full max-w-xs py-4 text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            {t.saveSubjects}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// --- New Dashboard Component ---
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
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-[#0313bc]/5 pointer-events-auto">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 bg-white rounded-xl flex items-center justify-center font-extrabold hover:bg-[#0313bc]/5 transition-colors"
              style={{ color: theme.primary }}
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>

            <button
              onClick={() => setShowTheme(!showTheme)}
              className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 bg-white rounded-xl flex items-center justify-center hover:bg-[#0313bc]/5 transition-colors"
              style={{ color: theme.primary }}
            >
              <Palette size={20} />
            </button>

            <div className="group relative">
              <button
                className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 bg-white rounded-xl flex items-center justify-center hover:bg-[#0313bc]/5 transition-colors"
                style={{ color: theme.primary }}
              >
                <User size={20} />
              </button>
              <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-[0_10px_40px_rgba(3,19,188,0.15)] rounded-2xl p-5 hidden group-hover:block z-50 border border-[#0313bc]/5">
                <p className="font-extrabold border-b border-[#0313bc]/10 pb-3 mb-3 text-[#0313bc] uppercase text-xs tracking-wider">
                  {t.profile}
                </p>
                <div className="space-y-2 text-sm text-[#0313bc]/80">
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
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[#0313bc]/10 p-6 w-full">
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
              <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[#0313bc]/10 p-5 mt-auto">
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
export function RevisionDashboard({
  user,
  t,
  lang,
  theme,
  onBack,
}: {
  user: UserProfile;
  t: any;
  lang: "ar" | "en";
  theme: any;
  onBack: () => void;
  key?: string;
}) {
  const availableSubjects = getSubjectsForGeneration(user.generation);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("enjez_selected_subjects");
    if (saved) return JSON.parse(saved);
    if (user.generation === "2009") return availableSubjects.map((s) => s.id);
    return [];
  });
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("enjez_completed_lessons");
    return saved ? JSON.parse(saved) : [];
  });

  const [setupMode, setSetupMode] = useState<boolean>(
    selectedSubjectIds.length === 0,
  );
  const [tempSelection, setTempSelection] =
    useState<string[]>(selectedSubjectIds);

  const [expandedSubjectIds, setExpandedSubjectIds] = useState<string[]>([]);
  const toggleSubjectExpanded = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id],
    );
  };

  // Sync state to local storage when changed
  useEffect(() => {
    localStorage.setItem(
      "enjez_selected_subjects",
      JSON.stringify(selectedSubjectIds),
    );
  }, [selectedSubjectIds]);

  useEffect(() => {
    localStorage.setItem(
      "enjez_completed_lessons",
      JSON.stringify(completedLessonIds),
    );
  }, [completedLessonIds]);

  // If 2009 or exactly 4 available, auto-select them visually in setup mode
  useEffect(() => {
    if (
      setupMode &&
      availableSubjects.length === 4 &&
      tempSelection.length === 0
    ) {
      setTempSelection(availableSubjects.map((s) => s.id));
    }
  }, [setupMode, availableSubjects, tempSelection]);

  const handleToggleSelection = (id: string) => {
    if (tempSelection.includes(id)) {
      setTempSelection(tempSelection.filter((s) => s !== id));
    } else {
      if (tempSelection.length < 4) {
        setTempSelection([...tempSelection, id]);
      }
    }
  };

  const handleSaveSubjects = () => {
    if (tempSelection.length === 4) {
      setSelectedSubjectIds(tempSelection);
      setSetupMode(false);
    }
  };

  const handleToggleLesson = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(completedLessonIds.filter((id) => id !== lessonId));
    } else {
      setCompletedLessonIds([...completedLessonIds, lessonId]);
    }
  };

  const calculateSubjectProgress = (subject: SubjectConfig) => {
    let total = 0;
    let comp = 0;
    subject.units.forEach((u) => {
      u.lessons.forEach((l) => {
        total++;
        if (completedLessonIds.includes(l.id)) comp++;
      });
    });
    return {
      comp,
      total,
      percentage: total > 0 ? Math.round((comp / total) * 100) : 0,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-[#f8f9ff] flex flex-col overflow-hidden"
    >
      <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-10 w-full bg-[#f8f9ff]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${theme.primary}15`,
              color: theme.primary,
            }}
          >
            <Activity size={24} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: theme.primary }}>
            {t.revisionTracking}
          </h1>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-xl shadow-sm border border-[#0313bc]/10 hover:bg-[#0313bc]/5 transition-colors group flex items-center gap-2"
          style={{ color: theme.primary }}
        >
          <span className="font-bold hidden sm:block px-2">
            {t.backToDashboard}
          </span>
          <ArrowRight size={20} className={lang === "ar" ? "" : "rotate-180"} />
        </button>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        {setupMode ? (
          <div
            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent text-center"
            style={{ borderColor: `${theme.primary}10` }}
          >
            <div
              className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6"
              style={{
                backgroundColor: `${theme.primary}15`,
                color: theme.primary,
              }}
            >
              <Layers size={40} />
            </div>
            <h2
              className="text-3xl font-black mb-3"
              style={{ color: theme.primary }}
            >
              قم باختيار موادك الوزارية:
            </h2>
            <div className="flex items-center justify-center gap-3 mb-8">
              <span
                className="px-4 py-1.5 rounded-full text-sm font-black tabular-nums"
                style={{
                  backgroundColor: tempSelection.length === 4 ? theme.primary : `${theme.primary}15`,
                  color: tempSelection.length === 4 ? "#ffffff" : theme.primary,
                }}
              >
                تم اختيار {tempSelection.length} من 4
              </span>
              {tempSelection.length === 4 && (
                <span className="text-sm font-bold" style={{ color: theme.primary }}>
                  ✓ جاهز للتأكيد
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10 text-right">
              {availableSubjects.map((subject) => {
                const isSelected = tempSelection.includes(subject.id);
                const isDisabled = !isSelected && tempSelection.length >= 4;
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => handleToggleSelection(subject.id)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all flex items-center justify-between group",
                      isSelected
                        ? "border-transparent text-white shadow-xl scale-[1.02] ring-4 ring-offset-2"
                        : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5",
                      isDisabled ? "opacity-40 cursor-not-allowed grayscale" : "cursor-pointer",
                    )}
                    style={{
                      backgroundColor: isSelected ? theme.primary : "white",
                      ...(isSelected ? { ["--tw-ring-color" as any]: `${theme.primary}40` } : {}),
                    }}
                  >
                    {isSelected && (
                      <span
                        className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
                        style={{ color: theme.primary }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </span>
                    )}
                    <span className="font-bold text-lg">{subject.title}</span>
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "border-white bg-white/25"
                          : "border-gray-300 group-hover:border-gray-500",
                      )}
                    >
                      {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col items-center">
              {tempSelection.length < 4 && (
                <p className="text-sm font-bold mb-3 opacity-70" style={{ color: theme.primary }}>
                  اختر {4 - tempSelection.length} {4 - tempSelection.length === 1 ? "مادة" : "مواد"} إضافية لتفعيل الزر
                </p>
              )}
              <Button
                onClick={handleSaveSubjects}
                disabled={tempSelection.length !== 4}
                className="w-full max-w-xs py-4 text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                تأكيد الاختيار
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {availableSubjects
              .filter((s) => selectedSubjectIds.includes(s.id))
              .map((subject) => {
                const { comp, total, percentage } =
                  calculateSubjectProgress(subject);
                const isExpanded = expandedSubjectIds.includes(subject.id);
                return (
                  <div
                    key={subject.id}
                    className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent overflow-hidden relative transition-all duration-300"
                    style={{ borderColor: `${theme.primary}10` }}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-4 relative z-10">
                      <CircularProgress
                        percentage={percentage}
                        label={""}
                        color={theme.primary}
                        delay={0}
                      />
                      <div className="flex-1 text-center sm:text-right w-full">
                        <h3
                          className="text-2xl font-black mb-2"
                          style={{ color: theme.primary }}
                        >
                          {subject.title}
                        </h3>
                        <p
                          className="font-medium opacity-60 px-4 py-2 rounded-xl inline-block"
                          style={{
                            backgroundColor: `${theme.primary}10`,
                            color: theme.primary,
                          }}
                        >
                          {t.lessonsCompleted} {comp} / {total}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-center mb-2">
                      <button
                        onClick={(e) => toggleSubjectExpanded(subject.id, e)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center border border-gray-200"
                        style={{ color: theme.primary }}
                      >
                        <ChevronDown
                          size={24}
                          className={cn(
                            "transition-transform duration-300",
                            isExpanded ? "rotate-180" : "rotate-0",
                          )}
                        />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-6 relative z-10 overflow-hidden"
                        >
                          {subject.units.map((unit) => (
                            <div
                              key={unit.id}
                              className="bg-[#f8f9ff] rounded-2xl p-5 border border-black/5"
                            >
                              <h4
                                className="font-bold text-lg mb-4 text-right flex items-center justify-end gap-2"
                                style={{ color: theme.primary }}
                              >
                                {unit.title}
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: theme.primary }}
                                />
                              </h4>
                              <div className="space-y-3">
                                {unit.lessons.map((lesson) => {
                                  const isDone = completedLessonIds.includes(
                                    lesson.id,
                                  );
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() =>
                                        handleToggleLesson(lesson.id)
                                      }
                                      className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white hover:shadow-md group",
                                        isDone
                                          ? "border-transparent shadow-sm"
                                          : "border-gray-200 bg-white",
                                      )}
                                      style={{
                                        backgroundColor: isDone
                                          ? `${theme.primary}15`
                                          : "",
                                      }}
                                    >
                                      <span
                                        className={cn(
                                          "font-bold text-md transition-colors",
                                          isDone
                                            ? "opacity-100"
                                            : "opacity-70 group-hover:opacity-100 text-gray-700",
                                        )}
                                        style={{
                                          color: isDone ? theme.primary : "",
                                        }}
                                      >
                                        {lesson.title}
                                      </span>
                                      <div
                                        className={cn(
                                          "w-6 h-6 rounded-md flex items-center justify-center transition-all",
                                          isDone
                                            ? "text-white"
                                            : "border-2 border-gray-300 text-transparent group-hover:border-gray-400",
                                        )}
                                        style={{
                                          backgroundColor: isDone
                                            ? theme.primary
                                            : "transparent",
                                        }}
                                      >
                                        <Check size={16} />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </motion.div>
  );
}

// --- Books Page (Generation 2009) ---
const BOOKS_2009: { key: string; title: string; titleEn: string; description: string; descriptionEn: string; emoji: string; url: string }[] = [
  {
    key: "english",
    title: "اللغة الإنجليزية",
    titleEn: "English Language",
    description: "كتاب الإنجليزي للجيل الثاني عشر — قراءات، مفردات، وقواعد.",
    descriptionEn: "Grade 12 English textbook — readings, vocabulary, and grammar.",
    emoji: "🇬🇧",
    url: "https://notebooklm.google.com/notebook/fff56b20-334a-4892-aee6-77b0c39aa01a",
  },
  {
    key: "arabic",
    title: "اللغة العربية",
    titleEn: "Arabic Language",
    description: "كتاب اللغة العربية — النصوص الأدبية، النحو، والبلاغة.",
    descriptionEn: "Arabic textbook — literary texts, grammar, and rhetoric.",
    emoji: "📜",
    url: "https://notebooklm.google.com/notebook/b521a0ee-d214-4a58-98ac-436b18247202",
  },
  {
    key: "islamic",
    title: "التربية الإسلامية",
    titleEn: "Islamic Education",
    description: "كتاب التربية الإسلامية — العقيدة، الفقه، والسيرة.",
    descriptionEn: "Islamic Education — creed, jurisprudence, and biography.",
    emoji: "🕌",
    url: "https://notebooklm.google.com/notebook/9f43a7e0-5046-4e11-b4e7-bf5d3601bea6",
  },
  {
    key: "history",
    title: "تاريخ الأردن",
    titleEn: "Jordanian History",
    description: "كتاب تاريخ الأردن — المراحل التاريخية وبناء الدولة.",
    descriptionEn: "Jordanian History — historical phases and state-building.",
    emoji: "🇯🇴",
    url: "https://notebooklm.google.com/notebook/dbf6059c-2582-4e50-9485-0cc7800c52cc",
  },
];

export function BooksPage({
  t,
  lang,
  theme,
  onBack,
}: {
  t: any;
  lang: "ar" | "en";
  theme: any;
  onBack: () => void;
  key?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-[#f8f9ff] flex flex-col overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="h-24 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-10 w-full bg-[#f8f9ff]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
          >
            <Book size={24} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: theme.primary }}>
            {lang === "ar" ? "الكتب الدراسية" : "Study Books"}
          </h1>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-xl shadow-sm border border-[#0313bc]/10 hover:bg-[#0313bc]/5 transition-colors flex items-center gap-2"
          style={{ color: theme.primary }}
        >
          <span className="font-bold hidden sm:block px-2">
            {t.backToDashboard || (lang === "ar" ? "العودة للوحة" : "Back to Dashboard")}
          </span>
          <ArrowRight size={20} className={lang === "ar" ? "" : "rotate-180"} />
        </button>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: theme.primary }}>
            {lang === "ar" ? "📚 مكتبتك الدراسية" : "📚 Your Study Library"}
          </h2>
          <p className="text-base font-medium opacity-60 text-gray-600">
            {lang === "ar"
              ? "كتب التوجيهي للجيل 2009 — افتح أي مادة مباشرة من هنا"
              : "Generation 2009 textbooks — open any subject directly"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BOOKS_2009.map((book, idx) => (
            <motion.div
              key={book.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(3,19,188,0.05)] border-2 border-transparent hover:border-[#0313bc]/20 hover:shadow-[0_20px_50px_rgba(3,19,188,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ borderColor: `${theme.primary}10` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    color: theme.primary,
                  }}
                >
                  <span>{book.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-black mb-1" style={{ color: theme.primary }}>
                    {lang === "ar" ? book.title : book.titleEn}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">
                    {lang === "ar" ? book.description : book.descriptionEn}
                  </p>
                </div>
              </div>

              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                <Book size={18} />
                <span>{lang === "ar" ? "فتح الكتاب" : "Open Book"}</span>
              </a>
            </motion.div>
          ))}
        </div>
      </main>
    </motion.div>
  );
}

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
      <header className="h-24 px-10 flex justify-between items-center border-b border-[#0313bc]/10 bg-white">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0313bc] transition-colors"
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
            className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 rounded-xl flex items-center justify-center font-extrabold hover:bg-[#0313bc]/5 transition-colors"
            style={{ color: theme.primary }}
          >
            {lang === "ar" ? "EN" : "AR"}
          </button>

          <button
            onClick={() => setShowTheme(!showTheme)}
            className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 rounded-xl flex items-center justify-center hover:bg-[#0313bc]/5 transition-colors"
            style={{ color: theme.primary }}
          >
            <Palette size={20} />
          </button>

          <div className="group relative">
            <button
              className="w-11 h-11 border-[1.5px] border-[#0313bc]/20 rounded-xl flex items-center justify-center hover:bg-[#0313bc]/5 transition-colors"
              style={{ color: theme.primary }}
            >
              <User size={20} />
            </button>
            <div className="absolute top-full left-0 mt-3 w-56 bg-white shadow-[0_10px_40px_rgba(3,19,188,0.15)] rounded-2xl p-5 hidden group-hover:block z-50 border border-[#0313bc]/5">
              <p className="font-extrabold border-b border-[#0313bc]/10 pb-3 mb-3 text-[#0313bc] uppercase text-xs tracking-wider">
                {t.profile}
              </p>
              <div className="space-y-2 text-sm text-[#0313bc]/80">
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
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0313bc] rounded-full shadow-[0_0_8px_rgba(3,19,188,0.4)] z-20" />
              </div>

              <div className="flex flex-col items-center justify-center z-10 w-full">
                <div className="text-[9px] md:text-[11px] font-black text-[#0313bc]/40 uppercase tracking-[0.25em] mb-4">
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
                    className="p-1.5 text-[#0313bc]/30 hover:text-[#0313bc] transition-colors"
                  >
                    <RotateCcw size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleTimer}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-[#0313bc] text-white shadow-[0_8px_20px_rgba(3,19,188,0.25)] hover:shadow-[0_10px_25px_rgba(3,19,188,0.35)] transition-all"
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
                    className="p-1.5 text-[#0313bc]/30 hover:text-[#0313bc] transition-colors"
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
                      ? "bg-white text-[#0313bc] shadow-[0_4px_10px_rgba(0,0,0,0.05)] font-bold"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Bottom Info */}
            <div className="mt-8 text-[11px] font-black text-[#0313bc]/20 uppercase tracking-widest">
              {lang === "ar"
                ? `الدورات المكتملة: ${sessionCount - 1}`
                : `Completed Cycles: ${sessionCount - 1}`}
            </div>
          </div>
        </div>

        {/* Right: Task Panel & Calendar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Progress Section */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[#0313bc]/10">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h4 className="text-[10px] font-black text-[#0313bc]/30 uppercase tracking-widest mb-1">
                  {lang === "ar" ? "إنجاز اليوم" : "Daily Progress"}
                </h4>
                <p className="text-lg font-black text-[#0313bc]">
                  {completionPercentage}%
                </p>
              </div>
              <div className="text-[10px] font-bold text-[#0313bc]/40">
                {completedTasks}/{totalTasks} {lang === "ar" ? "مهام" : "Tasks"}
              </div>
            </div>
            <div className="h-2 bg-[#0313bc]/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-[#0313bc] rounded-full"
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Task Card */}
          <div className="bg-white rounded-[24px] shadow-[0_10px_30px_rgba(3,19,188,0.03)] border border-[#0313bc]/10 flex flex-col h-[400px]">
            <div className="p-5 border-b border-[#0313bc]/10 flex justify-between items-center">
              <h3 className="font-extrabold text-[#0313bc] flex items-center gap-2">
                {t.tasks}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-white bg-[#0313bc] px-3 py-1 rounded-full uppercase">
                  {t.session} {sessionCount}
                </span>
                <button
                  onClick={() => setShowTaskManager(true)}
                  className="p-1.5 hover:bg-[#0313bc]/5 text-[#0313bc]/40 hover:text-[#0313bc] rounded-lg transition-all"
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
                          ? "bg-[#0313bc] border-[#0313bc]"
                          : "border-[#0313bc]/30",
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
                          ? "line-through text-[#0313bc]/40"
                          : "text-[#0313bc]",
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
                  className="flex-1 bg-white p-3 rounded-xl text-sm border-2 border-transparent focus:border-[#0313bc]/20 outline-none transition-all"
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
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[#0313bc]/10 hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
        >
          <Instagram size={18} />
        </a>
        <a
          href="https://wa.me/+962796156751"
          target="_blank"
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[#0313bc]/10 hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
        >
          <WhatsAppIcon size={18} />
        </a>
        <a
          href="https://www.facebook.com/profile.php?id=100063516910319"
          target="_blank"
          className="w-10 h-10 rounded-full bg-[#f0f2ff] flex items-center justify-center border border-[#0313bc]/10 hover:bg-[#0313bc] hover:text-white transition-all text-[#0313bc]"
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

function ThemeSelector({
  onClose,
  theme,
  setTheme,
  t,
  lang,
}: {
  onClose: () => void;
  theme: any;
  setTheme: any;
  t: any;
  lang: string;
}) {
  return (
    <Modal title={t.themeSettings} onClose={onClose}>
      <div className="space-y-10 py-2">
        <section>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-[#0313bc]/5 flex items-center justify-center text-[#0313bc]">
              <Layers size={16} />
            </div>
            <h3 className="text-sm font-black text-[#0313bc] uppercase tracking-wider">
              {t.bgCol}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { val: "#ffffff", label: lang === "ar" ? "أبيض" : "Pure" },
              { val: "#f8f9ff", label: lang === "ar" ? "ثلجي" : "Snow" },
              { val: "#f0f2f5", label: lang === "ar" ? "فضي" : "Soft" },
              { val: "#fffdf0", label: lang === "ar" ? "كريمي" : "Warm" },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => setTheme({ ...theme, bg: c.val })}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-full aspect-square rounded-[18px] border-4 transition-all duration-300 shadow-sm",
                    theme.bg === c.val
                      ? "border-[#0313bc] scale-105 shadow-md"
                      : "border-gray-50 group-hover:border-[#0313bc]/20",
                  )}
                  style={{ backgroundColor: c.val }}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    theme.bg === c.val ? "text-[#0313bc]" : "text-gray-400",
                  )}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-8 h-8 rounded-lg bg-[#0313bc]/5 flex items-center justify-center text-[#0313bc]">
              <Palette size={16} />
            </div>
            <h3 className="text-sm font-black text-[#0313bc] uppercase tracking-wider">
              {t.primaryCol}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { val: "#0313bc", label: lang === "ar" ? "أزرق" : "Blue" },
              { val: "#31e084", label: lang === "ar" ? "أخضر" : "Green" },
              { val: "#f8a552", label: lang === "ar" ? "أصفر" : "Yallow" },
              { val: "#b10e11", label: lang === "ar" ? "أحمر" : "Ruby" },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => setTheme({ ...theme, primary: c.val })}
                className="group flex flex-col items-center gap-2"
              >
                <div
                  className={cn(
                    "w-full aspect-square rounded-[18px] border-[6px] transition-all duration-300 shadow-sm flex items-center justify-center",
                    theme.primary === c.val
                      ? "border-white scale-105 shadow-lg ring-2 ring-[#0313bc]/20"
                      : "border-transparent opacity-80",
                  )}
                  style={{ backgroundColor: c.val }}
                >
                  {theme.primary === c.val && (
                    <Check size={20} className="text-white" strokeWidth={4} />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    theme.primary === c.val
                      ? "text-[#0313bc]"
                      : "text-gray-400",
                  )}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

function CircularProgress({
  percentage,
  label,
  color,
  delay,
}: {
  percentage: number;
  label: string;
  color: string;
  delay: number;
}) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-100"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-xl"
          style={{ color }}
        >
          {percentage}%
        </div>
      </div>
      <span className="font-bold text-sm text-gray-500 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative border border-[#0313bc]/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-[#0313bc] tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-[#f0f2ff] text-[#0313bc] rounded-full hover:bg-[#0313bc] hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onChange,
  unit,
  min = 1,
  max = 999,
}: {
  icon: any;
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
}) {
  const handleValueChange = (v: number) => {
    const clamped = Math.min(max, Math.max(min, v));
    onChange(clamped);
  };

  return (
    <div className="bg-[#f8f9ff] p-5 rounded-[24px] border border-[#0313bc]/5 flex items-center justify-between group hover:border-[#0313bc]/20 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0313bc]">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-black text-[#0313bc]/40 uppercase tracking-widest mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold text-[#0313bc]">
            {value} {unit}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-white p-1 rounded-xl shadow-sm border border-[#0313bc]/5">
        <button
          onClick={() => handleValueChange(value - 1)}
          className="w-8 h-8 rounded-lg hover:bg-[#f0f2ff] flex items-center justify-center text-[#0313bc] transition-colors disabled:opacity-30"
          disabled={value <= min}
        >
          -
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val)) handleValueChange(val);
          }}
          className="w-12 text-center font-black text-[#0313bc] tabular-nums bg-transparent border-none outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => handleValueChange(value + 1)}
          className="w-8 h-8 rounded-lg hover:bg-[#f0f2ff] flex items-center justify-center text-[#0313bc] transition-colors disabled:opacity-30"
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({
  currentDate,
  setCurrentDate,
  selectedDay,
  setSelectedDay,
  getDayStats,
  examDateStr,
  t,
  theme,
  lang,
}: any) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-[#0313bc]/5 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} style={{ color: theme.primary }} />
        </button>
        <span className="font-extrabold text-lg text-[#0313bc] capitalize">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-[#0313bc]/5 rounded-xl transition-colors"
        >
          <ChevronRight size={20} style={{ color: theme.primary }} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-[11px] font-black text-[#0313bc]/40 mb-4 px-1">
        {lang === "ar"
          ? ["أ", "ن", "ث", "ر", "خ", "ج", "س"].map((d, i) => (
              <span key={`ar-${i}`} className="text-center">
                {d}
              </span>
            ))
          : ["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={`en-${i}`} className="text-center">
                {d}
              </span>
            ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`p-${i}`} className="h-12 border border-transparent" />
        ))}

        {days.map((day) => {
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          const thisDayDate = new Date(day.getTime());
          thisDayDate.setHours(0, 0, 0, 0);

          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isPast = thisDayDate < todayDate;
          const isExamDay =
            examDateStr && format(day, "yyyy-MM-dd") === examDateStr;
          const { completion } = getDayStats(day);

          return (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "h-12 flex flex-col items-center justify-center rounded-xl relative text-[13px] transition-all cursor-pointer border overflow-hidden",
                isSelected ? "ring-2 ring-[#0313bc]/20" : "",
                isExamDay
                  ? "bg-red-50 text-red-600 border-red-200"
                  : isPast
                    ? "bg-[#0313bc] text-white border-transparent shadow-sm"
                    : isToday
                      ? "bg-[#f0f2ff] text-[#0313bc] border-[#0313bc]/20 font-black"
                      : "bg-white text-[#0313bc] hover:bg-[#0313bc]/5 border-[#0313bc]/5",
              )}
              style={
                isExamDay
                  ? undefined
                  : isPast
                    ? {
                        backgroundColor: theme.primary,
                        borderColor: "transparent",
                      }
                    : {}
              }
            >
              <span
                className={cn(
                  "font-bold text-[17px]",
                  isExamDay ? "mb-0.5" : "mb-0",
                  isSelected && !isPast && !isExamDay ? "text-[#0313bc]" : "",
                )}
              >
                {format(day, "d")}
              </span>

              {isExamDay && (
                <span className="text-[9px] font-black leading-[1.1] text-center px-0.5">
                  {lang === "ar" ? "يوم الإفراج" : "Release Day"}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function DaySummaryWidget({ selectedDay, getDayStats, t, lang, theme }: any) {
  const selectedStats = selectedDay ? getDayStats(selectedDay) : null;
  const isFutureSelected = selectedDay
    ? new Date(selectedDay.getTime()).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
    : false;

  const getAdvice = (completion: number) => {
    if (completion >= 0.8) return t.highPerformanceAdvice;
    if (completion >= 0.4) return t.mediumPerformanceAdvice;
    return t.lowPerformanceAdvice;
  };

  return (
    <AnimatePresence mode="wait">
      {selectedDay && selectedStats && !isFutureSelected ? (
        <motion.div
          key={selectedDay.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#f0f2ff] p-6 rounded-3xl border border-[#0313bc]/10 space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-[#0313bc] flex items-center gap-2">
              <CalendarIcon size={18} />
              {t.daySummary} ({format(selectedDay, "d MMMM")})
            </h3>
            <div className="bg-[#0313bc] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {Math.round(selectedStats.completion * 100)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-[#0313bc]/40 uppercase mb-1">
                {t.completion}
              </p>
              <div className="h-2 w-full bg-[#f0f2ff] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedStats.completion * 100}%` }}
                  className="h-full bg-[#0313bc]"
                />
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-[#0313bc]/40 uppercase mb-1">
                {t.completedTasks}
              </p>
              <p className="font-black text-[#0313bc] text-lg">
                {selectedStats.completedCount} / {selectedStats.totalCount}
              </p>
            </div>
          </div>

          <div className="bg-[#0313bc] text-white p-4 rounded-2xl space-y-2 relative overflow-hidden">
            <Sparkles
              className="absolute -right-2 -top-2 opacity-20 rotate-12"
              size={40}
            />
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">
              {t.adviceTitle}
            </p>
            <p className="font-medium text-sm leading-relaxed">
              {getAdvice(selectedStats.completion)}
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="text-center p-6 opacity-50 space-y-2">
          <CalendarIcon size={32} className="mx-auto opacity-50" />
          <p className="text-sm font-bold">
            {lang === "ar"
              ? "اختر يوماً لعرض التفاصيل"
              : "Select a day to view details"}
          </p>
        </div>
      )}
    </AnimatePresence>
  );
}

function TaskManagerModal({
  onClose,
  tasks,
  addTask,
  deleteTask,
  toggleTask,
  totalSessions,
  t,
  lang,
}: {
  onClose: () => void;
  tasks: Task[];
  addTask: (text: string, sId: number) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  totalSessions: number;
  t: any;
  lang: string;
}) {
  const [activeSession, setActiveSession] = useState(1);
  const [inputText, setInputText] = useState("");

  return (
    <Modal
      title={lang === "ar" ? "إدارة مهام اليوم" : "Daily Task Manager"}
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Session Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Array.from({ length: totalSessions }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setActiveSession(i + 1)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                activeSession === i + 1
                  ? "bg-[#0313bc] text-white shadow-md"
                  : "bg-[#f8f9ff] text-[#0313bc]/40 hover:bg-[#0313bc]/5 hover:text-[#0313bc]",
              )}
            >
              {lang === "ar" ? `جلسة ${i + 1}` : `Session ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Add Task for this session */}
        <div className="flex gap-2 bg-[#f8f9ff] p-2 rounded-2xl border border-[#0313bc]/5">
          <input
            type="text"
            placeholder={t.addTask}
            className="flex-1 bg-white p-3 rounded-xl text-sm border-none shadow-sm outline-none placeholder:text-[#0313bc]/20"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && inputText.trim()) {
                addTask(inputText.trim(), activeSession);
                setInputText("");
              }
            }}
          />
          <button
            onClick={() => {
              if (inputText.trim()) {
                addTask(inputText.trim(), activeSession);
                setInputText("");
              }
            }}
            className="w-11 h-11 rounded-xl bg-[#0313bc] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Task List for active session */}
        <div className="space-y-3 min-h-[200px]">
          {tasks.filter((tk) => tk.sessionId === activeSession).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
              <Circle size={40} className="mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest">
                {lang === "ar"
                  ? "لا توجد مهام لهذه الجلسة"
                  : "No tasks for this session"}
              </p>
            </div>
          ) : (
            tasks
              .filter((tk) => tk.sessionId === activeSession)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 bg-[#f8f9ff] rounded-2xl group border border-transparent hover:border-[#0313bc]/5 transition-all"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      task.completed
                        ? "bg-[#0313bc] border-[#0313bc]"
                        : "bg-white border-[#0313bc]/10",
                    )}
                  >
                    {task.completed && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "flex-1 text-sm font-bold",
                      task.completed
                        ? "line-through text-[#0313bc]/30"
                        : "text-[#0313bc]",
                    )}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </Modal>
  );
}

// --- Schedule View (structured renderer) ---
function ScheduleView({
  data,
  theme,
  lang,
}: {
  data: StructuredSchedule;
  theme: any;
  lang: "ar" | "en";
}) {
  const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const kindStyle: Record<ScheduleEvent["kind"], { bg: string; ring: string; text: string }> = {
    study:   { bg: "bg-[#eef0ff]", ring: "ring-[#0313bc]/20", text: "text-[#0313bc]" },
    break:   { bg: "bg-amber-50",  ring: "ring-amber-200",     text: "text-amber-700" },
    lunch:   { bg: "bg-emerald-50",ring: "ring-emerald-200",   text: "text-emerald-700" },
    morning: { bg: "bg-orange-50", ring: "ring-orange-200",    text: "text-orange-700" },
    wind:    { bg: "bg-indigo-50", ring: "ring-indigo-200",    text: "text-indigo-700" },
    prayer:  { bg: "bg-teal-50",   ring: "ring-teal-200",      text: "text-teal-700" },
    other:   { bg: "bg-gray-50",   ring: "ring-gray-200",      text: "text-gray-700" },
  };

  const peakLabel = data.inputs.pref === "day"
    ? L("نهاراً ☀️", "Daytime ☀️")
    : L("ليلاً 🌙", "Nighttime 🌙");

  const summaryItems = [
    { icon: "☀️", label: L("استيقاظ", "Wake"),   value: data.inputs.wake },
    { icon: "🌙", label: L("نوم", "Sleep"),       value: data.inputs.sleep },
    { icon: "📚", label: L("ساعات الدراسة", "Study"), value: `${data.inputs.hours}h` },
    { icon: "🍽️", label: L("الغداء", "Lunch"),   value: data.inputs.lunch },
    { icon: "🎯", label: L("ذروة التركيز", "Peak focus"), value: peakLabel },
  ];

  return (
    <div className="space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header summary card */}
      <div
        className="rounded-[2rem] p-6 md:p-8 text-white shadow-[0_15px_40px_rgba(3,19,188,0.15)]"
        style={{ backgroundColor: theme.primary }}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📅</span>
          <h2 className="text-2xl md:text-3xl font-black">
            {L(`جدول ${data.studentName} الذكي`, `${data.studentName}'s Smart Schedule`)}
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {summaryItems.map((it) => (
            <div
              key={it.label}
              className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center text-center"
            >
              <span className="text-2xl mb-1">{it.icon}</span>
              <span className="text-[11px] font-bold opacity-80 tracking-wider uppercase">{it.label}</span>
              <span className="text-base font-black mt-0.5" dir="ltr">{it.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-[0_10px_30px_rgba(3,19,188,0.04)] border border-[#0313bc]/10">
        <h3
          className="text-sm font-black uppercase tracking-wider mb-4 px-2"
          style={{ color: theme.primary }}
        >
          {L("الجدول اليومي", "Daily Timeline")}
        </h3>
        <ol className="space-y-2">
          {data.events.map((ev, i) => {
            const s = kindStyle[ev.kind] || kindStyle.other;
            return (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 ring-1 transition-all hover:shadow-md",
                  s.bg, s.ring,
                )}
              >
                <span className="text-2xl md:text-3xl shrink-0 w-12 text-center">{ev.emoji}</span>
                <div className="shrink-0 font-mono text-xs md:text-sm font-bold tabular-nums px-3 py-1.5 rounded-xl bg-white shadow-sm" dir="ltr" style={{ color: theme.primary }}>
                  {ev.start} – {ev.end}
                </div>
                <span className={cn("flex-1 font-bold text-sm md:text-base", s.text)}>
                  {ev.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Tips highlight box */}
      {data.tips.length > 0 && (
        <div
          className="rounded-[2rem] p-6 md:p-8 border-2 shadow-[0_10px_30px_rgba(3,19,188,0.04)]"
          style={{
            borderColor: `${theme.primary}30`,
            backgroundColor: `${theme.primary}08`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h3 className="text-lg md:text-xl font-black" style={{ color: theme.primary }}>
              {L("نصائح مخصصة", "Personalized Tips")}
            </h3>
          </div>
          <ul className="space-y-3">
            {data.tips.map((tip, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#0313bc]/5"
              >
                <span
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {i + 1}
                </span>
                <span className="font-medium text-sm md:text-base text-gray-700 leading-relaxed">
                  {tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Schedule Component ---
export function ScheduleDashboard({
  user,
  t,
  lang,
  theme,
  onBack,
}: {
  user: UserProfile;
  t: any;
  lang: "ar" | "en";
  theme: any;
  onBack: () => void;
  key?: string;
}) {
  const [schedule, setSchedule] = useState<string | null>(() => {
    return localStorage.getItem("enjez_ai_schedule") || null;
  });
  const [scheduleData, setScheduleData] = useState<StructuredSchedule | null>(() => {
    const raw = localStorage.getItem("enjez_schedule_data");
    try { return raw ? JSON.parse(raw) as StructuredSchedule : null; } catch { return null; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(!schedule && !scheduleData);
  const [wakeTime, setWakeTime] = useState("");
  const [sleepTime, setSleepTime] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [lunchTime, setLunchTime] = useState("");
  const [studyPref, setStudyPref] = useState<"day" | "night">("day");

  const buildSchedulePrompt = (
    studentName: string,
    generation: string,
    wake: string,
    sleep: string,
    hours: string,
    lunch: string,
    pref: "day" | "night",
  ) => {
    const inputs = lang === "ar"
      ? `بيانات الطالب:
- الاسم: ${studentName}
- الجيل: ${generation}
- وقت الاستيقاظ: ${wake}
- وقت النوم المفضل: ${sleep}
- عدد ساعات الدراسة المطلوبة: ${hours} ساعة
- وقت الغداء: ${lunch}
- وقت التركيز الأفضل: ${pref === "day" ? "النهار" : "الليل"}`
      : `Student data:
- Name: ${studentName}
- Generation: ${generation}
- Wake-up time: ${wake}
- Preferred sleep time: ${sleep}
- Required study hours: ${hours}h
- Lunch time: ${lunch}
- Peak focus period: ${pref === "day" ? "Daytime" : "Nighttime"}`;

    const system = lang === "ar"
      ? `أنت مخطط دراسي شخصي ذكي. مهمتك بناء جدول يوم متكامل لا يتعارض مع روتين الطالب أبداً.
قواعد صارمة:
1) ابدأ بوقت الاستيقاظ المحدد بالضبط، وانتهِ قبل وقت النوم بـ30 دقيقة على الأقل (تهدئة).
2) خصّص ساعة كاملة للغداء بدءاً من الوقت المحدد، ولا تضع أي جلسة دراسة فيها.
3) وزّع ساعات الدراسة المطلوبة على شكل جلسات بومودورو (50 دقيقة دراسة + 10 دقائق راحة).
4) إذا التركيز الأفضل بالنهار، ضع الجلسات الأصعب صباحاً قبل الغداء.
5) إذا التركيز الأفضل بالليل، ضع الجلسات الأساسية بعد العصر/المغرب.
6) أضف فترات راحة قصيرة وأوقات صلاة (فجر/ظهر/عصر/مغرب/عشاء) في مواقيتها التقريبية.
7) لا تتجاوز إجمالي ساعات الدراسة المطلوبة.

أخرج النتيجة كـ JSON صالح فقط (بدون أي نص قبل أو بعد) بهذه البنية بالضبط:
{
  "studentName": string,
  "inputs": { "wake": "HH:MM", "sleep": "HH:MM", "hours": string, "lunch": "HH:MM", "pref": "day"|"night" },
  "events": [
    { "start": "HH:MM", "end": "HH:MM", "kind": "morning"|"study"|"break"|"lunch"|"prayer"|"wind"|"other", "label": string, "emoji": string }
  ],
  "tips": [string, string, ...],
  "scheduledMinutes": number,
  "requestedMinutes": number
}
استخدم الإيموجي المناسب لكل نوع: ☀️ للاستيقاظ، 📚 للدراسة، ☕ للاستراحة، 🍽️ للغداء، 🕌 للصلاة، 🌙 للتهدئة.`
      : `You are a smart personal study planner. Build a full-day schedule that never conflicts with the student's chosen routine.
Strict rules:
1) Start exactly at the wake-up time and finish at least 30 minutes before sleep (wind-down).
2) Reserve a full hour for lunch starting at the given time — no study sessions there.
3) Split required study hours into Pomodoro blocks (50 min study + 10 min break).
4) If peak focus is daytime, place hardest sessions before lunch.
5) If peak focus is nighttime, place core sessions after late afternoon.
6) Insert short breaks and approximate prayer times.
7) Do not exceed the required total study hours.

Return ONLY valid JSON (no prose before/after) with this exact shape:
{
  "studentName": string,
  "inputs": { "wake": "HH:MM", "sleep": "HH:MM", "hours": string, "lunch": "HH:MM", "pref": "day"|"night" },
  "events": [
    { "start": "HH:MM", "end": "HH:MM", "kind": "morning"|"study"|"break"|"lunch"|"prayer"|"wind"|"other", "label": string, "emoji": string }
  ],
  "tips": [string, ...],
  "scheduledMinutes": number,
  "requestedMinutes": number
}
Emoji guide: ☀️ wake, 📚 study, ☕ break, 🍽️ lunch, 🕌 prayer, 🌙 wind-down.`;

    return { system, user: inputs };
  };

  const generateLocalSchedule = (
    studentName: string,
    wake: string,
    sleep: string,
    hours: string,
    lunch: string,
    pref: "day" | "night",
  ): StructuredSchedule => {
    const toMin = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + (m || 0);
    };
    const fmt = (m: number) => {
      const w = ((m % 1440) + 1440) % 1440;
      return `${String(Math.floor(w / 60)).padStart(2, "0")}:${String(w % 60).padStart(2, "0")}`;
    };

    const wakeM = toMin(wake);
    let sleepM = toMin(sleep);
    if (sleepM <= wakeM) sleepM += 24 * 60;
    const lunchM = toMin(lunch) < wakeM ? toMin(lunch) + 24 * 60 : toMin(lunch);
    const studyTarget = Math.max(0, Math.round(parseFloat(hours) * 60));
    const dayEnd = sleepM - 30;

    type Slot = { start: number; end: number; kind: string; label: string };
    const fixed: Slot[] = [
      { start: wakeM, end: wakeM + 30, kind: "morning",
        label: lang === "ar" ? "☀️ استيقاظ وإفطار" : "☀️ Wake & breakfast" },
      { start: lunchM, end: lunchM + 60, kind: "lunch",
        label: lang === "ar" ? "🍽️ الغداء واستراحة" : "🍽️ Lunch break" },
      { start: dayEnd, end: sleepM, kind: "wind",
        label: lang === "ar" ? "🌙 تهدئة قبل النوم" : "🌙 Wind-down" },
    ];

    const prayers: Slot[] = lang === "ar"
      ? [
          { start: 12 * 60 + 30, end: 12 * 60 + 45, kind: "prayer", label: "🕌 صلاة الظهر" },
          { start: 15 * 60 + 45, end: 16 * 60, kind: "prayer", label: "🕌 صلاة العصر" },
          { start: 18 * 60 + 30, end: 18 * 60 + 45, kind: "prayer", label: "🕌 صلاة المغرب" },
          { start: 20 * 60, end: 20 * 60 + 15, kind: "prayer", label: "🕌 صلاة العشاء" },
        ].filter(p => p.start >= wakeM && p.end <= dayEnd)
      : [];

    const events: Slot[] = [...fixed, ...prayers];

    const overlaps = (a: Slot, b: Slot) => !(a.end <= b.start || a.start >= b.end);
    const isBusy = (s: number, e: number) =>
      events.some(ev => overlaps({ start: s, end: e } as Slot, ev));

    const blockStudy = 50;
    const blockBreak = 10;
    let remaining = studyTarget;

    const dayStart = wakeM + 30;
    const nightCore = Math.max(18 * 60, lunchM + 60);
    let cursor = pref === "night" && nightCore < dayEnd - blockStudy ? nightCore : dayStart;

    let safety = 100;
    while (remaining > 0 && cursor + Math.min(remaining, blockStudy) <= dayEnd && safety-- > 0) {
      const studyDur = Math.min(blockStudy, remaining);
      const tentative: Slot = {
        start: cursor, end: cursor + studyDur, kind: "study",
        label: lang === "ar" ? "📚 جلسة دراسة (Pomodoro)" : "📚 Study session (Pomodoro)",
      };
      if (isBusy(tentative.start, tentative.end)) {
        const blocker = events.filter(ev => overlaps(tentative, ev)).sort((a, b) => b.end - a.end)[0];
        cursor = blocker ? blocker.end : cursor + 15;
        continue;
      }
      events.push(tentative);
      remaining -= studyDur;
      cursor += studyDur;
      if (remaining > 0 && cursor + blockBreak <= dayEnd && !isBusy(cursor, cursor + blockBreak)) {
        events.push({
          start: cursor, end: cursor + blockBreak, kind: "break",
          label: lang === "ar" ? "☕ استراحة قصيرة" : "☕ Short break",
        });
        cursor += blockBreak;
      }
    }

    events.sort((a, b) => a.start - b.start);

    const L = (ar: string, en: string) => (lang === "ar" ? ar : en);
    const emojiFor = (kind: string) => {
      switch (kind) {
        case "morning": return "☀️";
        case "lunch": return "🍽️";
        case "wind": return "🌙";
        case "prayer": return "🕌";
        case "study": return "📚";
        case "break": return "☕";
        default: return "✨";
      }
    };

    const tips: string[] = [];
    tips.push(pref === "day"
      ? L("استغل صباحك لأصعب المواد، تركيزك في ذروته قبل الغداء.",
          "Tackle your hardest subject in the morning — focus peaks before lunch.")
      : L("اجعل المساء وقت المراجعة العميقة، وخفف من النشاط نهاراً لتوفير الطاقة.",
          "Reserve the evening for deep review; keep daytime activity light to conserve energy."));
    tips.push(L(
      "بعد كل 4 جلسات بومودورو خذ راحة طويلة 20–30 دقيقة.",
      "After every 4 Pomodoros, take a 20–30 minute long break.",
    ));
    tips.push(L(
      "لا تختصر النوم؛ 7–8 ساعات تثبّت ما درسته.",
      "Don't sacrifice sleep — 7–8h consolidates memory.",
    ));
    if (remaining > 0) {
      const scheduledH = Math.round((studyTarget - remaining) / 60 * 10) / 10;
      tips.push(L(
        `⚠️ وقتك المتاح ضيّق — تم إدراج ${scheduledH} ساعة من أصل ${hours} ساعات مطلوبة.`,
        `⚠️ Available time was tight: scheduled ${scheduledH}h of the requested ${hours}h.`,
      ));
    }

    return {
      studentName,
      inputs: { wake, sleep, hours, lunch, pref },
      events: events.map(ev => ({
        start: fmt(ev.start),
        end: fmt(ev.end),
        kind: ev.kind as ScheduleEvent["kind"],
        label: ev.label.replace(/^[\p{Emoji}\s]+/u, "").trim() || ev.label,
        emoji: emojiFor(ev.kind),
      })),
      tips,
      scheduledMinutes: studyTarget - remaining,
      requestedMinutes: studyTarget,
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wakeTime || !sleepTime || !studyHours || !lunchTime) return;

    setIsGenerating(true);
    setShowForm(false);

    const { system, user: userInputs } = buildSchedulePrompt(
      user.name, user.generation, wakeTime, sleepTime, studyHours, lunchTime, studyPref,
    );

    let aiData: StructuredSchedule | null = null;
    try {
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY" || apiKey === '""') {
        apiKey = undefined;
      }
      if (apiKey) {
        const genAI = new GoogleGenAI({ apiKey });
        const response = await genAI.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: userInputs }] }],
          config: { systemInstruction: system },
        });
        const raw = response.text || "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]) as Partial<StructuredSchedule>;
          if (parsed && Array.isArray(parsed.events) && parsed.events.length) {
            aiData = {
              studentName: parsed.studentName || user.name,
              inputs: parsed.inputs || { wake: wakeTime, sleep: sleepTime, hours: studyHours, lunch: lunchTime, pref: studyPref },
              events: parsed.events as ScheduleEvent[],
              tips: parsed.tips || [],
              scheduledMinutes: parsed.scheduledMinutes ?? 0,
              requestedMinutes: parsed.requestedMinutes ?? Math.round(parseFloat(studyHours) * 60),
            };
          }
        }
      }
    } catch (error) {
      console.error("AI schedule failed, falling back to local planner:", error);
    }

    const data = aiData || generateLocalSchedule(
      user.name, wakeTime, sleepTime, studyHours, lunchTime, studyPref,
    );

    setScheduleData(data);
    localStorage.setItem("enjez_schedule_data", JSON.stringify(data));
    setSchedule(null);
    localStorage.removeItem("enjez_ai_schedule");
    setIsGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 bg-[#f8f9ff] z-50 overflow-y-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b z-40" style={{ borderColor: `${theme.primary}15` }}>
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-3 rounded-2xl transition-colors bg-[#f8f9ff] hover:bg-[#f0f2ff]"
              style={{ color: theme.primary }}
            >
              {lang === "ar" ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: theme.primary }}>
              {t.scheduleTitle}
            </h1>
          </div>
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-2xl font-bold text-white shadow-lg transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: theme.primary }}
            >
               <Plus size={18} />
              {t.createSchedule}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 mt-8">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent"
              style={{ borderColor: `${theme.primary}10` }}
            >
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[#f0f2ff]" style={{ color: theme.primary }}>
                  <CalendarDays size={32} />
                </div>
                <h2 className="text-2xl font-black mb-2" style={{ color: theme.primary }}>{t.createSchedule}</h2>
                <p className="text-sm font-medium opacity-60" style={{ color: theme.primary }}>{t.scheduleDesc}</p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 ml-1" style={{ color: theme.primary }}>
                      {t.scheduleFormWakeTitle}
                    </label>
                    <input
                      type="time"
                      required
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full p-4 rounded-2xl border bg-[#f8f9ff] font-mono outline-none focus:ring-2 transition-all"
                      style={{ borderColor: `${theme.primary}20`, color: theme.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 ml-1" style={{ color: theme.primary }}>
                      {t.scheduleFormSleepTitle}
                    </label>
                    <input
                      type="time"
                      required
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                      className="w-full p-4 rounded-2xl border bg-[#f8f9ff] font-mono outline-none focus:ring-2 transition-all"
                      style={{ borderColor: `${theme.primary}20`, color: theme.primary }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold mb-2 ml-1" style={{ color: theme.primary }}>
                      {t.scheduleFormStudyHours}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="16"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      className="w-full p-4 rounded-2xl border bg-[#f8f9ff] font-mono outline-none focus:ring-2 transition-all"
                      style={{ borderColor: `${theme.primary}20`, color: theme.primary }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2 ml-1" style={{ color: theme.primary }}>
                      {t.scheduleFormLunchTime}
                    </label>
                    <input
                      type="time"
                      required
                      value={lunchTime}
                      onChange={(e) => setLunchTime(e.target.value)}
                      className="w-full p-4 rounded-2xl border bg-[#f8f9ff] font-mono outline-none focus:ring-2 transition-all"
                      style={{ borderColor: `${theme.primary}20`, color: theme.primary }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 ml-1" style={{ color: theme.primary }}>
                    {t.scheduleFormFocusTime}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setStudyPref("day")}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                        studyPref === "day" ? "shadow-md" : "opacity-60 hover:opacity-80"
                      }`}
                      style={{
                        borderColor: studyPref === "day" ? theme.primary : `${theme.primary}20`,
                        color: theme.primary,
                        backgroundColor: studyPref === "day" ? `${theme.primary}10` : "transparent",
                      }}
                    >
                      <Coffee size={24} />
                      {t.scheduleFormStudyTimeDay}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudyPref("night")}
                      className={`p-4 rounded-2xl border-2 font-bold transition-all flex flex-col items-center gap-2 ${
                        studyPref === "night" ? "shadow-md" : "opacity-60 hover:opacity-80"
                      }`}
                      style={{
                        borderColor: studyPref === "night" ? theme.primary : `${theme.primary}20`,
                        color: theme.primary,
                        backgroundColor: studyPref === "night" ? `${theme.primary}10` : "transparent",
                      }}
                    >
                      <Moon size={24} />
                      {t.scheduleFormStudyTimeNight}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 text-lg rounded-2xl shadow-xl mt-4 text-white font-bold transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Sparkles size={20} />
                  {t.generateScheduleBtn}
                </button>
              </form>
            </motion.div>
          ) : isGenerating ? (
             <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{ color: theme.primary }}
              >
                <Monitor size={48} className="opacity-80 mb-6 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-bold" style={{ color: theme.primary }}>
                {t.scheduleGenerating}
              </h2>
            </motion.div>
          ) : scheduleData ? (
            <motion.div
              key="schedule-data"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ScheduleView data={scheduleData} theme={theme} lang={lang} />
            </motion.div>
          ) : schedule ? (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(3,19,188,0.04)] border border-transparent"
              style={{ borderColor: `${theme.primary}10` }}
            >
              <div
                className="markdown-body prose max-w-none prose-p:text-gray-700 prose-headings:text-[#0313bc]"
              >
                <Markdown>{schedule}</Markdown>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

export function WikiWikiBot({
  user,
  t,
  theme,
}: {
  user: UserProfile;
  t: any;
  theme: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string }[]
  >([{ role: "ai", text: t.wikiGreeting }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateLocalReply = (msg: string, studentName: string): string => {
    const text = msg.toLowerCase().trim();
    const has = (...words: string[]) => words.some((w) => text.includes(w));

    if (has("مرحبا", "السلام", "اهلا", "أهلا", "hi", "hello", "hey")) {
      return `أهلاً ${studentName}! أنا ويكي ويكي 🤖 جاهز أساعدك في مذاكرتك. اسألني عن أي شي يخص دراستك.`;
    }
    if (has("كيف حالك", "كيفك", "شو الأخبار")) {
      return "تمام الحمد لله! كيفك إنت؟ جاهز نراجع سوا؟";
    }
    if (has("امتحان", "اختبار", "توجيهي")) {
      return "خلّيك هادي 💪 رتّب وقتك، نام كويس قبل الامتحان، وراجع رؤوس الأقلام بدل ما تحفظ كل شي بالليلة الأخيرة. ثقتي فيك!";
    }
    if (has("تركيز", "ما اقدر اركز", "مشتت", "ملل")) {
      return "جرّب طريقة بومودورو: 25 دقيقة دراسة + 5 دقايق راحة، ولما تخلّص 4 جلسات خذ راحة 20 دقيقة. وأبعد التلفون عنك خلال الجلسة 📵";
    }
    if (has("مذاكرة", "دراسة", "ادرس", "كيف اذاكر")) {
      return "أهم شي: اقرأ الدرس مرة فهم، بعدين لخّصه بكلماتك، وحلّ أسئلة عليه. الفهم أهم من الحفظ، والمراجعة المتباعدة تثبّت المعلومة.";
    }
    if (has("رياضيات", "رياضة", "math")) {
      return "الرياضيات حلّ، حلّ، حلّ. ما في طريق غيره. ابدأ من الأسئلة الأساسية ثم انتقل للتطبيقات. ولو علّقت بسؤال، ارجع للقاعدة.";
    }
    if (has("فيزياء", "physics")) {
      return "الفيزياء فهم القانون قبل تطبيقه. ارسم الموقف، حدد المعطيات والمطلوب، وبعدين اختار القانون المناسب.";
    }
    if (has("كيمياء", "chemistry")) {
      return "الكيمياء حفظ + فهم. احفظ الجدول الدوري والتفاعلات الأساسية، وافهم الميكانيزم بدل تحفظ الناتج بس.";
    }
    if (has("احياء", "أحياء", "biology")) {
      return "الأحياء قصة مترابطة، ما تحفظ معلومات منعزلة. اربط بين الأنظمة (هضمي، تنفسي، عصبي…) وارسم مخططات.";
    }
    if (has("انجليزي", "إنجليزي", "english")) {
      return "Reading + writing every day. اقرأ نصوص قصيرة يومياً، احفظ 5 كلمات جديدة، وحاول تكتب جملة فيهم. الممارسة هي السر.";
    }
    if (has("عربي", "عربية", "نحو", "بلاغة")) {
      return "العربي: ركّز على القواعد الأساسية (الإعراب، الأبواب النحوية)، وحلّ نصوص. القراءة المستمرة بتقوّي حسّك اللغوي.";
    }
    if (has("نوم", "تعبان", "ما نمت")) {
      return "النوم جزء من الدراسة مش ضدها 😴 7-8 ساعات نوم بتخلّي دماغك يثبّت المعلومات. ما تضحّي فيه.";
    }
    if (has("قلق", "خايف", "متوتر", "ضغط")) {
      return "خذ نفس عميق 🌬️ التوتر طبيعي بس ما تخلّيه يسيطر عليك. قسّم المهام لخطوات صغيرة، وكل خطوة تخلّصها هي إنجاز.";
    }
    if (has("جدول", "تنظيم", "خطة")) {
      return "ابدأ بجدول أسبوعي بسيط: حدّد ساعات الدراسة الثابتة، وزّع المواد عليها، واترك يوم مراجعة بالأسبوع. لا تحشر اليوم بالكامل.";
    }
    if (has("شكر", "thanks", "thank")) {
      return "العفو! 💙 أنا هون متى ما احتجت. بالتوفيق يا بطل!";
    }
    if (has("?", "؟", "كيف", "ليش", "ايش", "شو", "متى", "وين", "what", "why", "how")) {
      return `سؤال حلو يا ${studentName}! حالياً بشتغل بوضع محلي بدون اتصال إنترنت، فأقدر أساعدك بنصائح دراسية عامة، تنظيم وقت، وطرق المذاكرة. جرّب تسألني عن مادة معينة أو طريقة دراسة.`;
    }
    return `استلمت رسالتك يا ${studentName} ✨ أنا ويكي ويكي بوضع محلي حالياً. أقدر أساعدك بنصائح عن المذاكرة، التركيز، تنظيم الوقت، أو أي مادة بالتوجيهي. شو موضوعك؟`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    const reply = generateLocalReply(userMsg, user.name);
    const delay = 400 + Math.min(userMsg.length * 12, 800);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsLoading(false);
    }, delay);
  };

  return (
    <div className="fixed bottom-10 left-10 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-6 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(3,19,188,0.2)] w-[340px] sm:w-[380px] h-[500px] flex flex-col border border-[#0313bc]/10 overflow-hidden"
          >
            <div
              className="p-5 border-b border-[#0313bc]/10 flex justify-between items-center text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={WIKI_WIKI_IMG}
                  className="w-10 h-10 rounded-full border-2 border-white bg-white"
                  alt="Wiki Wiki"
                  referrerPolicy="no-referrer"
                />
                <span className="font-extrabold text-sm tracking-tight">
                  ويكي ويكي (Wiki Wiki)
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] p-4 rounded-[20px] text-sm font-medium shadow-sm",
                      m.role === "user"
                        ? "bg-[#0313bc] text-white rounded-br-none"
                        : "bg-[#f8f9ff] text-[#0313bc] rounded-bl-none border border-[#0313bc]/5",
                    )}
                  >
                    <div className="markdown-body">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-[10px] text-[#0313bc]/40 font-bold uppercase tracking-widest pl-2">
                  جاري التفكير...
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-5 bg-white border-t border-[#0313bc]/10 flex gap-3">
              <input
                type="text"
                placeholder={t.placeholder}
                className="flex-1 border-none bg-[#f8f9ff] p-3 rounded-xl text-sm focus:ring-0 outline-none placeholder:text-[#0313bc]/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-3 rounded-xl text-white disabled:opacity-50 shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="flex items-end gap-5">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-20 h-20 rounded-full shadow-[0_15px_30px_rgba(3,19,188,0.3)] flex items-center justify-center border-4 border-white bg-white overflow-hidden relative"
        >
          <img
            src={WIKI_WIKI_IMG}
            className="w-full h-full object-cover"
            alt="Wiki Wiki"
            referrerPolicy="no-referrer"
          />
          {!isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black animate-bounce shadow-lg">
              1
            </div>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
