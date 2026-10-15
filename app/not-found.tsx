import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center bg-[#050811] text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 mb-6 shadow-xl shadow-sky-500/30">
        <Sparkles className="h-8 w-8 text-white" />
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">404</h1>
      <h2 className="text-lg sm:text-xl font-bold text-slate-300 mt-2">
        Página não encontrada
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-8">
        O item ou prateleira que você tentou acessar não existe ou não está disponível.
      </p>

      <Button asChild variant="glow" className="gap-2 h-11 px-6 rounded-xl">
        <Link href="/livros">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a Estante
        </Link>
      </Button>
    </div>
  );
}
