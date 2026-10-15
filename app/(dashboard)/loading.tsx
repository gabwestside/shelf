import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-2 border-sky-500/20 border-t-sky-400 animate-spin" />
        <Loader2 className="absolute h-6 w-6 text-sky-400 animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-slate-400 animate-pulse tracking-wide uppercase">
        Carregando sua estante...
      </p>
    </div>
  );
}
