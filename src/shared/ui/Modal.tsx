import { motion } from "motion/react";
import { X } from "lucide-react";
import React from "react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-white rounded-[40px] w-full max-w-md p-8 shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative border border-[--theme-primary]/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-[--theme-primary] tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-[#f0f2ff] text-[--theme-primary] rounded-full hover:bg-[--theme-primary] hover:text-white transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
