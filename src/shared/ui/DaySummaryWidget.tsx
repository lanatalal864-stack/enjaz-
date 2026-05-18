import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { format } from "date-fns";

export function DaySummaryWidget({
  selectedDay,
  getDayStats,
  t,
  lang,
  theme,
}: any) {
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

  const primary = theme?.primary || "#0313bc";

  return (
    <AnimatePresence mode="wait">
      {selectedDay && selectedStats && !isFutureSelected ? (
        <motion.div
          key={selectedDay.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-6 rounded-3xl border space-y-4"
          style={{
            backgroundColor: `${primary}1a`,
            borderColor: `${primary}33`,
          }}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black flex items-center gap-2" style={{ color: primary }}>
              <CalendarIcon size={18} />
              {t.daySummary} ({format(selectedDay, "d MMMM")})
            </h3>
            <div
              className="text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: primary }}
            >
              {Math.round(selectedStats.completion * 100)}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-4 rounded-2xl shadow-sm"
              style={{ backgroundColor: `${primary}08` }}
            >
              <p
                className="text-[10px] font-black uppercase mb-1 opacity-60"
                style={{ color: primary }}
              >
                {t.completion}
              </p>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: `${primary}1f` }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedStats.completion * 100}%` }}
                  className="h-full"
                  style={{ backgroundColor: primary }}
                />
              </div>
            </div>
            <div
              className="p-4 rounded-2xl shadow-sm"
              style={{ backgroundColor: `${primary}08` }}
            >
              <p
                className="text-[10px] font-black uppercase mb-1 opacity-60"
                style={{ color: primary }}
              >
                {t.completedTasks}
              </p>
              <p className="font-black text-lg" style={{ color: primary }}>
                {selectedStats.completedCount} / {selectedStats.totalCount}
              </p>
            </div>
          </div>

          <div
            className="text-white p-4 rounded-2xl space-y-2 relative overflow-hidden"
            style={{ backgroundColor: primary }}
          >
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
        <div
          className="text-center p-6 rounded-3xl border space-y-2"
          style={{
            backgroundColor: `${primary}0a`,
            borderColor: `${primary}1f`,
            color: primary,
          }}
        >
          <CalendarIcon size={32} className="mx-auto opacity-60" />
          <p className="text-sm font-bold opacity-70">
            {lang === "ar"
              ? "اختر يوماً لعرض التفاصيل"
              : "Select a day to view details"}
          </p>
        </div>
      )}
    </AnimatePresence>
  );
}
