import {
  arabic2009,
  english2009,
  history2009,
  islamic2009,
} from "../data/subjects2009";
import { subjects2008 } from "../data/subjects2008";
import type { SubjectConfig } from "./types";

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

export const getSubjectsForGeneration = (generation: string): SubjectConfig[] => {
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

  return [
    createSubject("math", "الرياضيات"),
    createSubject("physics", "الفيزياء"),
    createSubject("chemistry", "الكيمياء"),
    createSubject("biology", "الأحياء"),
    createSubject("arabic", "اللغة العربية"),
    createSubject("english", "اللغة الإنجليزية"),
  ];
};

export const checkIfNeedsSetup = (userData: { generation: string }) => {
  const saved = localStorage.getItem("enjez_selected_subjects");
  if (saved && JSON.parse(saved).length > 0) return false;

  if (userData.generation === "2009") {
    const available = getSubjectsForGeneration(userData.generation);
    localStorage.setItem("enjez_selected_subjects", JSON.stringify(available.map((s) => s.id)));
    return false;
  }
  return true;
};
