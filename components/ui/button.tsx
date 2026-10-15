import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "streak";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 border border-sky-400/30",
      glow:
        "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-sky-400/50 hover:brightness-110 border border-sky-400/40",
      destructive:
        "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 shadow-md",
      outline:
        "border border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 backdrop-blur-md",
      secondary:
        "bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700/80 hover:text-white backdrop-blur-md",
      ghost:
        "text-slate-300 hover:bg-slate-800/60 hover:text-white",
      link:
        "text-sky-400 underline-offset-4 hover:underline",
      streak:
        "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-400/50 hover:brightness-110 border border-orange-400/50 font-semibold tracking-wide",
    }[variant];

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base font-semibold",
      icon: "h-10 w-10",
    }[size];

    return (
      <Comp
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
