import { Layers, Palette, Check } from "lucide-react";
import { cn } from "../utils";
import { Modal } from "./Modal";

export function ThemeSelector({
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
            <div className="w-8 h-8 rounded-lg bg-[--theme-primary]/5 flex items-center justify-center text-[--theme-primary]">
              <Layers size={16} />
            </div>
            <h3 className="text-sm font-black text-[--theme-primary] uppercase tracking-wider">
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
                      ? "border-[--theme-primary] scale-105 shadow-md"
                      : "border-gray-50 group-hover:border-[--theme-primary]/20",
                  )}
                  style={{ backgroundColor: c.val }}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    theme.bg === c.val ? "text-[--theme-primary]" : "text-gray-400",
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
            <div className="w-8 h-8 rounded-lg bg-[--theme-primary]/5 flex items-center justify-center text-[--theme-primary]">
              <Palette size={16} />
            </div>
            <h3 className="text-sm font-black text-[--theme-primary] uppercase tracking-wider">
              {t.primaryCol}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { val: "#0313bc", label: lang === "ar" ? "أزرق" : "Blue" },
              { val: "#000000", label: lang === "ar" ? "أسود" : "Black" },
              { val: "#ec4899", label: lang === "ar" ? "زهري" : "Pink" },
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
                      ? "border-white scale-105 shadow-lg ring-2 ring-[--theme-primary]/20"
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
                      ? "text-[--theme-primary]"
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
