/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import type { UserProfile } from "../types";
import { WIKI_WIKI_IMG } from "../constants";
import { cn } from "../utils";

export function WikiWikiBot({
  user,
  t,
  theme,
}: {
  user: UserProfile;
  t: any;
  theme: any;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string }[]
  >([{ role: "ai", text: t.wikiGreeting }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateLocalReply = (msg: string, studentName: string): string => {
    const text = msg.toLowerCase().trim();
    const has = (...words: string[]) => words.some((w) => text.includes(w));

    if (has("مرحبا", "السلام", "اهلا", "أهلا", "hi", "hello", "hey")) {
      return `أهلاً ${studentName}! أنا ويكي ويكي 🤖 جاهز أساعدك في مذاكرتك. اسألني عن أي شي يخص دراستك.`;
    }
    if (has("كيف حالك", "كيفك", "شو الأخبار")) {
      return "تمام الحمد لله! كيفك إنت؟ جاهز نراجع سوا؟";
    }
    if (has("امتحان", "اختبار", "توجيهي")) {
      return "خلّيك هادي 💪 رتّب وقتك، نام كويس قبل الامتحان، وراجع رؤوس الأقلام بدل ما تحفظ كل شي بالليلة الأخيرة. ثقتي فيك!";
    }
    if (has("تركيز", "ما اقدر اركز", "مشتت", "ملل")) {
      return "جرّب طريقة بومودورو: 25 دقيقة دراسة + 5 دقايق راحة، ولما تخلّص 4 جلسات خذ راحة 20 دقيقة. وأبعد التلفون عنك خلال الجلسة 📵";
    }
    if (has("مذاكرة", "دراسة", "ادرس", "كيف اذاكر")) {
      return "أهم شي: اقرأ الدرس مرة فهم، بعدين لخّصه بكلماتك، وحلّ أسئلة عليه. الفهم أهم من الحفظ، والمراجعة المتباعدة تثبّت المعلومة.";
    }
    if (has("رياضيات", "رياضة", "math")) {
      return "الرياضيات حلّ، حلّ، حلّ. ما في طريق غيره. ابدأ من الأسئلة الأساسية ثم انتقل للتطبيقات. ولو علّقت بسؤال، ارجع للقاعدة.";
    }
    if (has("فيزياء", "physics")) {
      return "الفيزياء فهم القانون قبل تطبيقه. ارسم الموقف، حدد المعطيات والمطلوب، وبعدين اختار القانون المناسب.";
    }
    if (has("كيمياء", "chemistry")) {
      return "الكيمياء حفظ + فهم. احفظ الجدول الدوري والتفاعلات الأساسية، وافهم الميكانيزم بدل تحفظ الناتج بس.";
    }
    if (has("احياء", "أحياء", "biology")) {
      return "الأحياء قصة مترابطة، ما تحفظ معلومات منعزلة. اربط بين الأنظمة (هضمي، تنفسي، عصبي…) وارسم مخططات.";
    }
    if (has("انجليزي", "إنجليزي", "english")) {
      return "Reading + writing every day. اقرأ نصوص قصيرة يومياً، احفظ 5 كلمات جديدة، وحاول تكتب جملة فيهم. الممارسة هي السر.";
    }
    if (has("عربي", "عربية", "نحو", "بلاغة")) {
      return "العربي: ركّز على القواعد الأساسية (الإعراب، الأبواب النحوية)، وحلّ نصوص. القراءة المستمرة بتقوّي حسّك اللغوي.";
    }
    if (has("نوم", "تعبان", "ما نمت")) {
      return "النوم جزء من الدراسة مش ضدها 😴 7-8 ساعات نوم بتخلّي دماغك يثبّت المعلومات. ما تضحّي فيه.";
    }
    if (has("قلق", "خايف", "متوتر", "ضغط")) {
      return "خذ نفس عميق 🌬️ التوتر طبيعي بس ما تخلّيه يسيطر عليك. قسّم المهام لخطوات صغيرة، وكل خطوة تخلّصها هي إنجاز.";
    }
    if (has("جدول", "تنظيم", "خطة")) {
      return "ابدأ بجدول أسبوعي بسيط: حدّد ساعات الدراسة الثابتة، وزّع المواد عليها، واترك يوم مراجعة بالأسبوع. لا تحشر اليوم بالكامل.";
    }
    if (has("شكر", "thanks", "thank")) {
      return "العفو! 💙 أنا هون متى ما احتجت. بالتوفيق يا بطل!";
    }
    if (has("?", "؟", "كيف", "ليش", "ايش", "شو", "متى", "وين", "what", "why", "how")) {
      return `سؤال حلو يا ${studentName}! حالياً بشتغل بوضع محلي بدون اتصال إنترنت، فأقدر أساعدك بنصائح دراسية عامة، تنظيم وقت، وطرق المذاكرة. جرّب تسألني عن مادة معينة أو طريقة دراسة.`;
    }
    return `استلمت رسالتك يا ${studentName} ✨ أنا ويكي ويكي بوضع محلي حالياً. أقدر أساعدك بنصائح عن المذاكرة، التركيز، تنظيم الوقت، أو أي مادة بالتوجيهي. شو موضوعك؟`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsLoading(true);

    const reply = generateLocalReply(userMsg, user.name);
    const delay = 400 + Math.min(userMsg.length * 12, 800);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      setIsLoading(false);
    }, delay);
  };

  return (
    <div className="fixed bottom-10 left-10 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="mb-6 bg-white rounded-[24px] shadow-[0_20px_50px_rgba(3,19,188,0.2)] w-[340px] sm:w-[380px] h-[500px] flex flex-col border border-[--theme-primary]/10 overflow-hidden"
          >
            <div
              className="p-5 border-b border-[--theme-primary]/10 flex justify-between items-center text-white"
              style={{ backgroundColor: theme.primary }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={WIKI_WIKI_IMG}
                  className="w-10 h-10 rounded-full border-2 border-white bg-white"
                  alt="Wiki Wiki"
                  referrerPolicy="no-referrer"
                />
                <span className="font-extrabold text-sm tracking-tight">
                  ويكي ويكي (Wiki Wiki)
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] p-4 rounded-[20px] text-sm font-medium shadow-sm",
                      m.role === "user"
                        ? "bg-[--theme-primary] text-white rounded-br-none"
                        : "bg-[#f8f9ff] text-[--theme-primary] rounded-bl-none border border-[--theme-primary]/5",
                    )}
                  >
                    <div className="markdown-body">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-[10px] text-[--theme-primary]/40 font-bold uppercase tracking-widest pl-2">
                  جاري التفكير...
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-5 bg-white border-t border-[--theme-primary]/10 flex gap-3">
              <input
                type="text"
                placeholder={t.placeholder}
                className="flex-1 border-none bg-[#f8f9ff] p-3 rounded-xl text-sm focus:ring-0 outline-none placeholder:text-[--theme-primary]/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-3 rounded-xl text-white disabled:opacity-50 shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: theme.primary }}
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="flex items-end gap-5">
        <motion.button
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-20 h-20 rounded-full shadow-[0_15px_30px_rgba(3,19,188,0.3)] flex items-center justify-center border-4 border-white bg-white overflow-hidden relative"
        >
          <img
            src={WIKI_WIKI_IMG}
            className="w-full h-full object-cover"
            alt="Wiki Wiki"
            referrerPolicy="no-referrer"
          />
          {!isOpen && (
            <div className="absolute -top-1 -right-1 bg-red-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black animate-bounce shadow-lg">
              1
            </div>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

