"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-4 shadow-xl shadow-rose-950/50">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h2 className="text-xl font-bold text-white">Ops, algo deu errado</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-1 mb-6">
        Ocorreu uma falha inesperada ao carregar os dados da sua estante. Tente recarregar.
      </p>

      <Button onClick={() => reset()} variant="glow" className="gap-2 h-11 px-6">
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </Button>
    </div>
  );
}
