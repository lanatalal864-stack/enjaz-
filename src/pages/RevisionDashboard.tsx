/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import React from "react";
import { Check, ChevronDown, Layers, Activity, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { UserProfile, SubjectConfig } from "../shared/types";
import { cn } from "../shared/utils";
import { getSubjectsForGeneration } from "../shared/subjects";
import { Button } from "../shared/ui/Button";
import { CircularProgress } from "../shared/ui/CircularProgress";

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
          className="p-3 bg-white rounded-xl shadow-sm border border-[--theme-primary]/10 hover:bg-[--theme-primary]/5 transition-colors group flex items-center gap-2"
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

