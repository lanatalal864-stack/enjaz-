/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import React from "react";
import { motion } from "motion/react";
import type { UserProfile } from "../shared/types";
import { Button } from "../shared/ui/Button";

export function AuthPage({
  onComplete,
  t,
  theme,
}: {
  onComplete: (u: UserProfile) => void;
  t: any;
  theme: any;
  key?: string;
}) {
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    phone: "",
    generation: "",
  });
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const validateJordanianPhone = (phone: string): string | null => {
    if (!phone) return "رقم الهاتف مطلوب";
    if (phone.length < 10) return "الرقم غير مكتمل — يجب أن يتكون من 10 أرقام";
    if (phone.length > 10) return "الرقم لا يجب أن يتجاوز 10 أرقام";
    if (!/^07[789]\d{7}$/.test(phone)) return "ابدأ الرقم بـ 077 أو 078 أو 079";
    return null;
  };

  const handlePhoneChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
    if (phoneTouched) setPhoneError(validateJordanianPhone(digitsOnly));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateJordanianPhone(formData.phone);
    setPhoneTouched(true);
    setPhoneError(err);
    if (err || !formData.name || !formData.generation) return;
    onComplete(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 bg-white">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-10 rounded-[32px] shadow-[0_20px_50px_rgba(3,19,188,0.1)] max-w-md w-full border border-[--theme-primary]/10"
      >
        <h2
          className="text-3xl font-extrabold mb-8 text-center"
          style={{ color: theme.primary }}
        >
          {t.welcome}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[--theme-primary]/50 ml-1">
              {t.name}
            </label>
            <input
              type="text"
              required
              className="w-full bg-[#f8f9ff] border-2 border-transparent p-4 rounded-xl focus:border-[--theme-primary]/20 focus:bg-white outline-none transition-all font-medium"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[--theme-primary]/50 ml-1">
              {t.phone}
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="07[789][0-9]{7}"
              maxLength={10}
              required
              placeholder="0790000000"
              dir="ltr"
              aria-invalid={!!phoneError}
              aria-describedby="phone-error"
              className={`w-full bg-[#f8f9ff] border-2 p-4 rounded-xl focus:bg-white outline-none transition-all font-medium tabular-nums placeholder:text-gray-400 ${phoneError
                  ? "border-red-400 focus:border-red-500"
                  : "border-transparent focus:border-[--theme-primary]/20"
                }`}
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => {
                setPhoneTouched(true);
                setPhoneError(validateJordanianPhone(formData.phone));
              }}
              onKeyDown={(e) => {
                const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
                if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                if (!/^[0-9]$/.test(e.key)) e.preventDefault();
              }}
            />
            {phoneError && (
              <p
                id="phone-error"
                role="alert"
                className="text-xs font-bold text-red-500 mt-1 ml-1 flex items-center gap-1"
              >
                <span aria-hidden>⚠</span>
                <span>{phoneError}</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest text-[--theme-primary]/50 ml-1">
              {t.generation}
            </label>
            <select
              required
              className="w-full bg-[#f8f9ff] border-2 border-transparent p-4 rounded-xl focus:border-[--theme-primary]/20 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer"
              value={formData.generation}
              onChange={(e) =>
                setFormData({ ...formData, generation: e.target.value })
              }
            >
              <option value="" disabled>
                {t.selectGeneration}
              </option>
              <option value="2007">2007</option>
              <option value="2008">2008</option>
              <option value="2009">2009</option>
              <option value="2010">2010</option>
            </select>
          </div>
          <Button
            type="submit"
            className="w-full py-5 text-xl rounded-2xl shadow-xl mt-4"
            style={{ backgroundColor: theme.primary }}
          >
            {t.startNow}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

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

