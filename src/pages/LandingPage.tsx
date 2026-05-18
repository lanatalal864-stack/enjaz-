/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageCircle as WhatsAppIcon, Instagram, Facebook } from "lucide-react";
import { motion } from "motion/react";
import { MAIN_LOGO, SECONDARY_LOGO } from "../shared/constants";
import { Button } from "../shared/ui/Button";

export function LandingPage({
  onStart,
  onLogin,
  t,
  theme,
}: {
  onStart: () => void;
  onLogin: () => void;
  t: any;
  theme: any;
  key?: string;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="h-24 px-10 flex justify-between items-center bg-white border-b border-[--theme-primary]/10">
        <img
          src={MAIN_LOGO}
          alt="Enjez Logo"
          className="h-20 w-auto"
          referrerPolicy="no-referrer"
        />
        <div className="flex items-center gap-8">
          <button
            onClick={() =>
              document
                .getElementById("hero")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[--theme-primary] font-light hover:underline transition-all"
          >
            {t.home}
          </button>
          <button
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[--theme-primary] font-light hover:underline transition-all"
          >
            {t.services}
          </button>
          <button
            onClick={() =>
              document
                .getElementById("about")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-[--theme-primary] font-light hover:underline transition-all"
          >
            {t.aboutTitle}
          </button>
          <Button
            onClick={onLogin}
            className="rounded-xl px-10"
            style={{ backgroundColor: theme.primary }}
          >
            {t.login}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main
        id="hero"
        className="min-h-[calc(100vh-96px)] flex flex-col items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: theme.primary }}
          >
            {t.plan}
          </h1>
          <p className="text-[--theme-primary]/60 text-xl md:text-2xl font-medium">
            {t.timeRunning}
          </p>
          <Button
            onClick={onStart}
            className="text-xl px-16 py-5 rounded-3xl shadow-xl hover:shadow-2xl transition-all"
            style={{ backgroundColor: theme.primary }}
          >
            {t.startNow}
          </Button>

          {/* Social Icons */}
          <div className="pt-8 flex justify-center gap-8">
            <a
              href="https://www.instagram.com/enjez.jo/"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
            >
              <Instagram size={28} />
            </a>
            <a
              href="https://wa.me/+962796156751"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
            >
              <WhatsAppIcon size={28} />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100063516910319"
              target="_blank"
              rel="noreferrer"
              className="w-14 h-14 rounded-full bg-[#f0f2ff] flex items-center justify-center hover:bg-[--theme-primary] hover:text-white transition-all text-[--theme-primary]"
            >
              <Facebook size={28} />
            </a>
          </div>
        </motion.div>
      </main>

      {/* About Us Section with Scroll Animation */}
      <motion.section
        id="about"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[--theme-primary] text-white py-20 px-10 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 flex justify-center">
            <img
              src={SECONDARY_LOGO}
              alt="Enjez Secondary"
              className="w-full max-w-[300px] h-auto drop-shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black">{t.aboutTitle}</h2>
            <p className="text-lg md:text-xl font-medium leading-relaxed opacity-90">
              {t.aboutDesc}
            </p>
            <a
              href="https://chat.whatsapp.com/HyhhLk7JRAa3mpHFivrZVC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[--theme-primary] font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all text-lg"
            >
              {t.joinNow}
            </a>
          </div>
        </div>
        {/* Decorative background shape */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl" />
      </motion.section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 px-4 md:px-10 bg-[#f8f9ff] overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto flex flex-col items-center text-center">
          <h2
            className="text-4xl md:text-5xl font-black mb-16"
            style={{ color: theme.primary }}
          >
            إنجز شو بقدملك؟
          </h2>

          {/* Service 1: Cards */}
          <div className="flex flex-col items-center w-full mb-24">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[--theme-primary] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                1
              </div>
              <p className="text-2xl md:text-3xl font-extrabold text-[--theme-primary]/80 text-right">
                بطاقات لنخبة من منصات المملكة:
              </p>
            </div>

            <div className="flex flex-nowrap overflow-x-auto custom-scrollbar w-full justify-start lg:justify-center gap-6 md:gap-10 pb-8 px-4 snap-x">
              {[
                {
                  name: "منصة جو أكاديمي",
                  icon: "https://www.image2url.com/r2/default/images/1777552396982-5ddccf10-0af4-4041-8de6-962d2f5a0e7e.png",
                },
                {
                  name: "منصة أساس التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552519241-8fb9d6e3-b3c1-4ee0-a35a-ce644eaef136.png",
                },
                {
                  name: "منصة ألفا التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552577782-dd641f39-fecc-4365-8075-e44241d79bb6.png",
                },
                {
                  name: "منصة وتد التعليمية",
                  icon: "https://www.image2url.com/r2/default/images/1777552608953-e57c7a38-e3c8-4c46-9a99-61f4a56e7797.png",
                },
                {
                  name: "منصة جولد أكاديمي",
                  icon: "https://www.image2url.com/r2/default/images/1777552646480-aafd9477-8a50-45f7-b531-7db0d6bc40f8.png",
                },
              ].map((platform, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center gap-5 shrink-0 snap-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                  <div
                    className="w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-28 h-28 md:w-32 md:h-32 object-contain"
                      style={{ filter: "brightness(0) invert(1)" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span
                    className="text-base md:text-lg font-medium"
                    style={{ color: theme.primary }}
                  >
                    {platform.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Service 2: Packages */}
          <div className="flex flex-col items-center w-full mb-24">
            <div className="flex items-center justify-center gap-4 mb-16">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[--theme-primary] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                2
              </div>
              <p className="text-3xl md:text-4xl font-extrabold text-[--theme-primary]/80 text-right">
                بكجات إنجز المميزة:
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-12 md:gap-16 w-full max-w-5xl">
              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[--theme-primary]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554573704-808e5fbe-5b24-4411-bab5-f6189cfdba75.png"
                      alt="تنظيم دراستك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[--theme-primary] mb-2">
                  تنظيم دراستك ووقتك
                </h3>
                <p className="text-[--theme-primary]/70 font-normal text-sm md:text-base">
                  منتجات صُممت خصيصًا الك
                </p>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[--theme-primary]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554606316-e38e3345-2ec9-473d-ad84-485fe7842c46.png"
                      alt="منتجات لازم تكون على مكتبك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[--theme-primary]">
                  منتجات لازم تكون على مكتبك
                </h3>
              </motion.div>

              <motion.div
                className="flex flex-col items-center text-center max-w-[280px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-56 h-56 rounded-full border-4 border-[--theme-primary]/20 p-2 mb-6 shadow-xl relative bg-white hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img
                      src="https://www.image2url.com/r2/default/images/1777554631038-da15330b-a505-4371-98e3-136ee40beceb.png"
                      alt="شغلات ترفه عنك خلال رحلتك"
                      className="w-3/5 h-3/5 object-contain drop-shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-[--theme-primary]">
                  شغلات ترفه عنك خلال رحلتك
                </h3>
              </motion.div>
            </div>
          </div>

          {/* Service 3 & 4 Container */}
          <div className="flex flex-col lg:flex-row justify-center gap-12 lg:gap-24 w-full">
            {/* Service 3: Dawsiyat */}
            <motion.div
              className="flex items-center bg-white px-8 py-6 rounded-3xl shadow-lg border border-[--theme-primary]/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[--theme-primary] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                  3
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[--theme-primary]/80 text-right">
                  دوسيات موادك
                </p>
              </div>
            </motion.div>

            {/* Service 4: Follow up */}
            <motion.div
              className="flex items-center bg-white px-8 py-6 rounded-3xl shadow-lg border border-[--theme-primary]/10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[--theme-primary] text-white flex items-center justify-center text-2xl md:text-3xl font-black shadow-lg">
                  4
                </div>
                <p className="text-2xl md:text-3xl font-extrabold text-[--theme-primary]/80 text-right leading-relaxed">
                  متابعة دراسية معك من البداية للنهاية
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Footer */}
      <footer className="py-16 flex flex-col items-center justify-center bg-white gap-4 border-t border-[--theme-primary]/5">
        <p className="text-[--theme-primary] font-black text-2xl tracking-tight opacity-40">
          {t.storeSoon}
        </p>
        <div className="flex flex-col items-center opacity-30 text-sm font-medium text-[--theme-primary] gap-1">
          <p>{t.secureSite}</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>SSL Secured Connection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

