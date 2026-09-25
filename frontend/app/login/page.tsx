"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getLoginRedirect } from "@/utils/loginRedirect";
import { LoginShell } from "@/components/ui/LoginShell";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <LoginShell>
      <div role="status" className="animate-pulse space-y-5">
        <span className="sr-only">Carregando acesso</span>
        <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 rounded-lg bg-slate-200 dark:bg-slate-800" />
      </div>
    </LoginShell>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getLoginRedirect(searchParams.get("redirect"));

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      setErrorMsg("Por favor, preencha todos os campos.");
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login({ email: email.trim(), senha });
      router.replace(redirectPath);
    } catch (err: unknown) {
      let msg =
        "Não foi possível realizar o login. Verifique suas credenciais.";
      if (err && typeof err === "object" && "response" in err) {
        const res = (
          err as { response?: { data?: { message?: string | string[] } } }
        ).response;
        if (res?.data?.message) {
          msg = Array.isArray(res.data.message)
            ? res.data.message.join(", ")
            : res.data.message;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LoginShell>
      {errorMsg && (
        <div
          id="login-error"
          role="alert"
          className="mb-6 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
        >
          <AlertCircle aria-hidden className="h-5 w-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        aria-busy={submitting}
      >
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            E-mail
          </label>
          <div className="relative">
            <Mail
              aria-hidden
              className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail de acesso"
              className="ui-input pl-11"
              aria-describedby={errorMsg ? "login-error" : undefined}
            />
          </div>
        </div>
        <div>
          <label htmlFor="senha" className="mb-2 block text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <Lock
              aria-hidden
              className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-slate-400"
            />
            <input
              id="senha"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="ui-input pl-11 pr-12"
              aria-describedby={errorMsg ? "login-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              className="absolute right-2 top-2 rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || authLoading}
          className="ui-button ui-button-primary w-full py-3"
        >
          {submitting ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            <>
              Entrar no sistema
              <ArrowRight aria-hidden className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </LoginShell>
  );
}
