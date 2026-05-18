import { useState } from "react";
import { Plus, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "../utils";
import { Modal } from "./Modal";
import type { Task } from "../types";

export function TaskManagerModal({
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
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {Array.from({ length: totalSessions }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setActiveSession(i + 1)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                activeSession === i + 1
                  ? "bg-[--theme-primary] text-white shadow-md"
                  : "bg-[#f8f9ff] text-[--theme-primary]/40 hover:bg-[--theme-primary]/5 hover:text-[--theme-primary]",
              )}
            >
              {lang === "ar" ? `جلسة ${i + 1}` : `Session ${i + 1}`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 bg-[#f8f9ff] p-2 rounded-2xl border border-[--theme-primary]/5">
          <input
            type="text"
            placeholder={t.addTask}
            className="flex-1 bg-white p-3 rounded-xl text-sm border-none shadow-sm outline-none placeholder:text-[--theme-primary]/20"
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
            className="w-11 h-11 rounded-xl bg-[--theme-primary] text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
          >
            <Plus size={20} />
          </button>
        </div>

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
                  className="flex items-center gap-4 p-4 bg-[#f8f9ff] rounded-2xl group border border-transparent hover:border-[--theme-primary]/5 transition-all"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      task.completed
                        ? "bg-[--theme-primary] border-[--theme-primary]"
                        : "bg-white border-[--theme-primary]/10",
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
                        ? "line-through text-[--theme-primary]/30"
                        : "text-[--theme-primary]",
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
