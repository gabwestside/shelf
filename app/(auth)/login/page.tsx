"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Gamepad2,
  Film,
  Tv,
  Mail,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  UserPlus,
  LogIn,
} from "lucide-react";

type AuthMode = "signin" | "signup" | "magiclink";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/livros";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
    details?: string;
  } | null>(
    errorParam
      ? {
          type: "error",
          text: "Falha na autenticação externa.",
          details:
            "O provedor Google precisa ser ativado em Authentication > Providers no painel do Supabase.",
        }
      : null
  );

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("provider is not enabled") || msg.includes("validation_failed")) {
        setMessage({
          type: "error",
          text: "Login com Google não está ativado no Supabase.",
          details:
            "Para usar o Google, ative o provedor em Authentication > Providers > Google no painel do Supabase. Para entrar agora, use as abas 'Entrar' ou 'Criar Conta' com e-mail e senha.",
        });
      } else {
        setMessage({ type: "error", text: msg || "Erro ao conectar com Google." });
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Informe seu e-mail para continuar." });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // MODO 1: LINK MÁGICO
      if (mode === "magiclink") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });

        if (error) {
          if (error.message.includes("rate limit") || (error as any).status === 429) {
            setMessage({
              type: "error",
              text: "Limite de envio de e-mails do Supabase atingido.",
              details:
                "O serviço gratuito de e-mails do Supabase limita envios por hora. Recomendamos usar a aba 'Criar Conta' ou 'Entrar' com senha, ou desativar 'Confirm email' no painel do Supabase.",
            });
            return;
          }
          throw error;
        }

        setMessage({
          type: "success",
          text: "Link de acesso enviado para seu e-mail! Verifique sua caixa de entrada e spam.",
        });
        return;
      }

      // MODO 2: CRIAR NOVA CONTA
      if (mode === "signup") {
        if (!password || password.length < 6) {
          setMessage({
            type: "error",
            text: "A senha deve ter pelo menos 6 caracteres.",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split("@")[0],
            },
          },
        });

        if (error) {
          if (error.message.includes("rate limit") || (error as any).status === 429) {
            setMessage({
              type: "error",
              text: "Limite de e-mails do Supabase atingido ao tentar enviar confirmação.",
              details:
                "Dica: no painel do Supabase (Authentication > Providers > Email), desative a opção 'Confirm email'. Assim a conta é criada e logada instantaneamente sem depender de e-mail!",
            });
            return;
          }
          throw error;
        }

        // Se o Supabase estiver com "Confirm email" desativado, o session já vem preenchido!
        if (data.session) {
          window.location.href = next;
          return;
        }

        setMessage({
          type: "success",
          text: "Conta criada com sucesso!",
          details:
            "Se você não receber o e-mail de confirmação por limite da API, desative 'Confirm email' em Authentication > Providers > Email no Supabase ou crie seu usuário diretamente em Authentication > Users.",
        });
        return;
      }

      // MODO 3: ENTRAR COM SENHA
      if (mode === "signin") {
        if (!password) {
          setMessage({ type: "error", text: "Informe sua senha." });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setMessage({
              type: "error",
              text: "E-mail ou senha incorretos.",
              details:
                "Se você ainda não criou uma conta com este e-mail, clique na aba 'Criar Conta' acima.",
            });
            return;
          }
          if (error.message.includes("Email not confirmed")) {
            setMessage({
              type: "error",
              text: "Este e-mail ainda não foi confirmado.",
              details:
                "No painel do Supabase (Authentication > Providers > Email), você pode desativar 'Confirm email' para liberar o acesso imediatamente.",
            });
            return;
          }
          throw error;
        }

        if (data.session) {
          window.location.href = next;
        }
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Erro ao processar autenticação.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-3xl border border-sky-500/20 bg-slate-950/85 p-6 sm:p-8 shadow-2xl shadow-sky-950/50 backdrop-blur-2xl">
      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-500 shadow-lg shadow-sky-500/30">
          <Sparkles className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Estante</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Sua estante multimídia pessoal. Registre o que lê, joga e assiste com streaks diários.
        </p>
      </div>

      {/* Ícones de Categorias */}
      <div className="flex justify-center items-center gap-4 sm:gap-6 py-1 text-slate-400 border-y border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
          <BookOpen className="h-3.5 w-3.5" /> Livros
        </div>
        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
          <Gamepad2 className="h-3.5 w-3.5" /> Jogos
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <Film className="h-3.5 w-3.5" /> Filmes
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Tv className="h-3.5 w-3.5" /> Séries
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {message && (
        <div
          className={`flex flex-col gap-1 rounded-xl p-3.5 text-xs leading-relaxed ${
            message.type === "success"
              ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200"
              : message.type === "info"
              ? "bg-sky-500/15 border border-sky-500/30 text-sky-200"
              : "bg-rose-500/15 border border-rose-500/30 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{message.text}</span>
          </div>
          {message.details && (
            <p className="pl-6 text-[11px] text-slate-300 opacity-90">
              {message.details}
            </p>
          )}
        </div>
      )}

      {/* Botão Google OAuth */}
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full h-11 text-xs sm:text-sm font-semibold border-slate-700/80 hover:border-sky-500/50 hover:bg-slate-900/90 gap-3"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Entrar com o Google
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-[#050811] px-3 text-[11px] uppercase tracking-wider text-slate-500">
            ou com e-mail
          </span>
        </div>

        {/* Abas Claras de Modo (Entrar vs Criar Conta vs Link Mágico) */}
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === "signin"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="h-3.5 w-3.5" /> Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === "signup"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" /> Criar Conta
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("magiclink");
              setMessage(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === "magiclink"
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Link Mágico
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-sky-400" /> E-mail
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="bg-slate-900/60"
            />
          </div>

          {mode !== "magiclink" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sky-400" /> Senha
              </label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="bg-slate-900/60"
              />
            </div>
          )}

          <Button
            type="submit"
            variant="glow"
            disabled={loading}
            className="w-full h-11 text-xs sm:text-sm font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processando...
              </span>
            ) : mode === "signin" ? (
              "Entrar na Estante"
            ) : mode === "signup" ? (
              "Criar Conta e Acessar"
            ) : (
              "Receber Link de Acesso"
            )}
          </Button>
        </form>

        {/* Dica de Configuração Supabase */}
        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <HelpCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300">Dica para acesso imediato:</strong> Se ainda não tem usuário, clique na aba <strong>Criar Conta</strong>. Para entrar sem precisar aguardar e-mail, desmarque a opção <em>&quot;Confirm email&quot;</em> no painel do Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
