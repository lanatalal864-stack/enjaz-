export interface UserProfile {
  name: string;
  phone: string;
  generation: string;
}

export type ScheduleEvent = {
  start: string;
  end: string;
  label: string;
  emoji: string;
  kind: "study" | "break" | "lunch" | "morning" | "wind" | "prayer" | "other";
};

export type StructuredSchedule = {
  studentName: string;
  inputs: { wake: string; sleep: string; hours: string; lunch: string; pref: "day" | "night" };
  events: ScheduleEvent[];
  tips: string[];
  scheduledMinutes: number;
  requestedMinutes: number;
};

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  sessionId: number;
  date?: string;
}

export interface TimerSettings {
  studyTime: number;
  breakTime: number;
  longBreakTime: number;
  totalSessions: number;
  longBreakInterval: number;
}

export interface StudyHistoryEntry {
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
