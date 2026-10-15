"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Gamepad2, Film, Tv, Sparkles, Search } from "lucide-react";
import { UserNav } from "./user-nav";
import { GlobalSearchModal } from "@/components/search/global-search-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Livros", href: "/livros", icon: BookOpen },
  { label: "Jogos", href: "/jogos", icon: Gamepad2 },
  { label: "Filmes", href: "/filmes", icon: Film },
  { label: "Séries", href: "/series", icon: Tv },
];

interface TopBarProps {
  user: {
    id: string;
    email?: string | null;
    user_metadata?: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  } | null;
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-sky-500/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand / Logo */}
          <Link href="/livros" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
              Estante
            </span>
          </Link>

          {/* Central Navigation Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all select-none",
                    isActive
                      ? "bg-slate-800/90 text-sky-400 shadow-inner border border-sky-500/25"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive && "text-sky-400")} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Navigation, Search & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="gap-2 h-9 px-3 rounded-xl border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hidden sm:flex"
              title="Busca rápida (Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-sky-400" />
              <span className="text-xs">Buscar</span>
              <kbd className="ml-1 text-[10px] font-mono text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                ⌘K
              </kbd>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-xl text-slate-300 sm:hidden"
            >
              <Search className="h-4 w-4" />
            </Button>

            <UserNav user={user} />
          </div>
        </div>
      </header>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
