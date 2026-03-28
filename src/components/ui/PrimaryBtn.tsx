import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface PrimaryBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const PrimaryBtn = forwardRef<HTMLButtonElement, PrimaryBtnProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      primary: "bg-accent-orange text-white hover:bg-[#ff8559] hover:-translate-y-[2px] shadow-[0_4px_14px_0_rgba(255,107,53,0.39)] hover:shadow-[0_6px_20px_rgba(255,107,53,0.5)]",
      secondary: "bg-surface2 text-foreground border border-surface-border hover:bg-surface-border hover:-translate-y-[2px]",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:-translate-y-[2px]",
      ghost: "hover:bg-surface2 text-muted hover:text-foreground"
    };

    const sizes = {
      default: "h-12 px-6 py-3 text-base",
      sm: "h-9 px-4 py-2 text-sm",
      lg: "h-14 px-8 py-4 text-lg"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
PrimaryBtn.displayName = "PrimaryBtn";
