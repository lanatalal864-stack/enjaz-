/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import React from "react";
import { Plus, ChevronLeft, ChevronRight, Coffee, Moon, Sparkles, Monitor, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { GoogleGenAI } from "@google/genai";
import type { UserProfile, ScheduleEvent, StructuredSchedule } from "../shared/types";
import { ScheduleView } from "../shared/ui/ScheduleView";

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
                className="markdown-body prose max-w-none prose-p:text-gray-700 prose-headings:text-[--theme-primary]"
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

