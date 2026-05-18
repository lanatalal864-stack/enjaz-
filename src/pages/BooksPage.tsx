/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

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

export function BooksPage({
  t,
  lang,
  theme,
  onBack,
}: {
  t: any;
  lang: "ar" | "en";
  theme: any;
  onBack: () => void;
  key?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="min-h-screen bg-[#f8f9ff] flex flex-col overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <header className="h-24 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-10 w-full bg-[#f8f9ff]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
          >
            <Book size={24} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: theme.primary }}>
            {lang === "ar" ? "الكتب الدراسية" : "Study Books"}
          </h1>
        </div>
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-xl shadow-sm border border-[--theme-primary]/10 hover:bg-[--theme-primary]/5 transition-colors flex items-center gap-2"
          style={{ color: theme.primary }}
        >
          <span className="font-bold hidden sm:block px-2">
            {t.backToDashboard || (lang === "ar" ? "العودة للوحة" : "Back to Dashboard")}
          </span>
          <ArrowRight size={20} className={lang === "ar" ? "" : "rotate-180"} />
        </button>
      </header>

      <main className="flex-1 p-6 sm:p-10 max-w-6xl w-full mx-auto overflow-y-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-2" style={{ color: theme.primary }}>
            {lang === "ar" ? "📚 مكتبتك الدراسية" : "📚 Your Study Library"}
          </h2>
          <p className="text-base font-medium opacity-60 text-gray-600">
            {lang === "ar"
              ? "كتب التوجيهي للجيل 2009 — افتح أي مادة مباشرة من هنا"
              : "Generation 2009 textbooks — open any subject directly"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {BOOKS_2009.map((book, idx) => (
            <motion.div
              key={book.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white rounded-[2rem] p-6 md:p-8 shadow-[0_15px_40px_rgba(3,19,188,0.05)] border-2 border-transparent hover:border-[--theme-primary]/20 hover:shadow-[0_20px_50px_rgba(3,19,188,0.12)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
              style={{ borderColor: `${theme.primary}10` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                  style={{
                    backgroundColor: `${theme.primary}10`,
                    color: theme.primary,
                  }}
                >
                  <span>{book.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl font-black mb-1" style={{ color: theme.primary }}>
                    {lang === "ar" ? book.title : book.titleEn}
                  </h3>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">
                    {lang === "ar" ? book.description : book.descriptionEn}
                  </p>
                </div>
              </div>

              <a
                href={book.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                <Book size={18} />
                <span>{lang === "ar" ? "فتح الكتاب" : "Open Book"}</span>
              </a>
            </motion.div>
          ))}
        </div>
      </main>
    </motion.div>
  );
}

