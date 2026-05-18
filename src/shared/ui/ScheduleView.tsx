import { cn } from "../utils";
import type { StructuredSchedule, ScheduleEvent } from "../types";

export function ScheduleView({
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
    study:   { bg: "bg-[#eef0ff]", ring: "ring-[--theme-primary]/20", text: "text-[--theme-primary]" },
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

      <div className="bg-white rounded-[2rem] p-4 md:p-6 shadow-[0_10px_30px_rgba(3,19,188,0.04)] border border-[--theme-primary]/10">
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
                className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[--theme-primary]/5"
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
