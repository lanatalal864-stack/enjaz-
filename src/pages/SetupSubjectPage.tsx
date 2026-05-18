/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, Layers } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../shared/types";
import { cn } from "../shared/utils";
import { getSubjectsForGeneration } from "../shared/subjects";
import { Button } from "../shared/ui/Button";

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
