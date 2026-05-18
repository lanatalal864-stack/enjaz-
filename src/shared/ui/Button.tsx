import { motion } from "motion/react";
import { cn } from "../utils";

export const Button = ({
  children,
  className,
  variant = "primary",
  ...props
}: any) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "px-6 py-2 rounded-xl font-bold transition-all shadow-sm active:scale-95",
        variant === "primary" && "bg-[--theme-primary] text-white hover:shadow-lg",
        variant === "outline" &&
          "border-2 border-[--theme-primary] text-[--theme-primary] bg-white hover:bg-[--theme-primary]/5",
        variant === "ghost" && "text-[--theme-primary] hover:bg-[--theme-primary]/5",
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
