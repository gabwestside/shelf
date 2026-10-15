"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut, ExternalLink, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserNavProps {
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

export function UserNav({ user }: UserNavProps) {
  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="rounded-xl border-sky-500/30 text-sky-300">
        <Link href="/login">Entrar</Link>
      </Button>
    );
  }

  const name =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Usuário";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-slate-900/80 shadow-md shadow-sky-950/40 transition-all hover:scale-105 hover:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400 overflow-hidden cursor-pointer"
          aria-label="Menu do usuário"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-sky-400">{initials}</span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-white">{name}</p>
            <p className="text-xs leading-none text-slate-400 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/u/${user.email?.split("@")[0] || user.id}`} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-sky-400" />
            <span>Minha Estante Pública</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action="/auth/signout" method="post" className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair da conta</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
