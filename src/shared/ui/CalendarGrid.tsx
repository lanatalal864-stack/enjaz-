import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { cn } from "../utils";

export function CalendarGrid({
  currentDate,
  setCurrentDate,
  selectedDay,
  setSelectedDay,
  getDayStats,
  examDateStr,
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
          className="p-2 hover:bg-[--theme-primary]/5 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} style={{ color: theme.primary }} />
        </button>
        <span className="font-extrabold text-lg text-[--theme-primary] capitalize">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-[--theme-primary]/5 rounded-xl transition-colors"
        >
          <ChevronRight size={20} style={{ color: theme.primary }} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-[11px] font-black text-[--theme-primary]/40 mb-4 px-1">
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
          getDayStats(day); // legacy call preserved

          return (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={day.toString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "h-12 flex flex-col items-center justify-center rounded-xl relative text-[13px] transition-all cursor-pointer overflow-hidden",
                isSelected ? "ring-2 ring-[--theme-primary]/20" : "",
                isExamDay
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : isPast
                    ? "bg-[--theme-primary] text-white shadow-sm"
                    : isToday
                      ? "bg-[--theme-primary]/10 text-[--theme-primary] font-black"
                      : "bg-transparent text-[--theme-primary] hover:bg-[--theme-primary]/5",
              )}
              style={
                isExamDay
                  ? undefined
                  : isPast
                    ? { backgroundColor: theme.primary }
                    : {}
              }
            >
              <span
                className={cn(
                  "font-bold text-[17px]",
                  isExamDay ? "mb-0.5" : "mb-0",
                  isSelected && !isPast && !isExamDay ? "text-[--theme-primary]" : "",
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
