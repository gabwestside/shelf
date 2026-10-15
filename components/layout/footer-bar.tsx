import React from "react";
import { MousePointerClick, Info } from "lucide-react";

export function FooterBar() {
  return (
    <footer className="mt-auto w-full border-t border-sky-500/10 bg-slate-950/60 backdrop-blur-md py-4 px-4 text-xs text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        {/* Dica de interação do launcher */}
        <div className="flex items-center gap-2 text-slate-300">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <MousePointerClick className="h-3.5 w-3.5" />
          </div>
          <span>
            <strong className="text-white font-medium">Dica:</strong> Segure ou clique na capa para abrir opções rápidas, mudar status ou escrever sua resenha.
          </span>
        </div>

        {/* Atribuições legais (TMDB, Google Books, RAWG) */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span>Dados providos por Google Books, Open Library, RAWG & TMDB.</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-[10px]">
            Este produto usa a API do TMDB, mas não é certificado pelo TMDB.
          </span>
        </div>
      </div>
    </footer>
  );
}
