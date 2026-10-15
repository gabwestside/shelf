import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "streak" | "status";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    secondary: "bg-slate-800 text-slate-300 border border-slate-700",
    destructive: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    outline: "text-slate-300 border border-slate-700",
    streak: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 font-semibold",
    status: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
