import { motion } from "motion/react";

export function CircularProgress({
  percentage,
  label,
  color,
  delay,
}: {
  percentage: number;
  label: string;
  color: string;
  delay: number;
}) {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-100"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay, ease: "easeOut" }}
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-black text-xl"
          style={{ color }}
        >
          {percentage}%
        </div>
      </div>
      <span className="font-bold text-sm text-gray-500 whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
