/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { QrCode, ScanLine, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

const COMING_SOON_PATH = '/coming-soon';

// Public, standalone QR landing page.
// Rendered outside the main <App /> tree, so it never inherits the
// dashboard sidebar / navbar / internal navigation.
export default function QRPage() {
  const [comingSoonUrl, setComingSoonUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setComingSoonUrl(window.location.origin + COMING_SOON_PATH);
    }
  }, []);

  const goToComingSoon = () => {
    window.history.pushState({}, '', COMING_SOON_PATH);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const qrSrc = comingSoonUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&color=0313bc&bgcolor=ffffff&data=${encodeURIComponent(comingSoonUrl)}`
    : '';

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center relative overflow-hidden selection:bg-blue-100 selection:text-blue-900 px-4 py-8"
      style={{ fontFamily: "'Cairo', 'Tajawal', ui-sans-serif, system-ui, sans-serif" }}
      dir="rtl"
    >
      {/* Background corner graphics */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-100/60 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 md:p-14 flex flex-col items-center w-full max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 bg-blue-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-blue-700/20 mb-6"
        >
          <QrCode className="w-9 h-9 text-white" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-blue-900 mb-4 leading-relaxed text-center"
        >
          امسح الرمز للمتابعة
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-base md:text-lg text-slate-500 text-center mb-10 leading-relaxed max-w-md"
        >
          استخدم كاميرا هاتفك لمسح رمز الاستجابة السريعة أدناه، أو اضغط عليه
          مباشرة للمتابعة.
        </motion.p>

        <motion.button
          type="button"
          onClick={goToComingSoon}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          aria-label="افتح صفحة قريباً"
          className="group relative bg-white rounded-[1.5rem] p-4 md:p-5 border border-slate-200/80 shadow-lg shadow-slate-200/60 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-black/5"
        >
          {qrSrc ? (
            <img
              src={qrSrc}
              alt="رمز QR للانتقال إلى صفحة قريباً"
              width={280}
              height={280}
              className="w-[260px] h-[260px] md:w-[280px] md:h-[280px] block"
            />
          ) : (
            <div className="w-[260px] h-[260px] md:w-[280px] md:h-[280px] bg-slate-100 animate-pulse rounded-xl" />
          )}
          <div className="absolute inset-0 rounded-[1.5rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600/0 group-hover:bg-blue-600/[0.02]" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-center justify-center"
        >
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-sm border border-slate-200/60">
            <Smartphone className="w-4 h-4 text-blue-700" />
            <span>افتح الكاميرا ووجهها نحو الرمز</span>
          </div>
          <button
            type="button"
            onClick={goToComingSoon}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-2xl text-sm font-semibold transition-all duration-300 border border-blue-100 ring-1 ring-blue-500/10"
          >
            <ScanLine className="w-4 h-4" />
            <span>أو اضغط هنا للمتابعة</span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
