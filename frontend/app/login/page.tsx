'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Scale,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <Scale className="h-8 w-8 text-sky-500 animate-pulse" />
        <p className="text-xs text-slate-400">Carregando painel de acesso Astrea...</p>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
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
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      await login({ email: email.trim(), senha });
      router.replace(redirectPath);
    } catch (err: unknown) {
      let msg = 'Não foi possível realizar o login. Verifique suas credenciais.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string | string[] } } }).response;
        if (res?.data?.message) {
          msg = Array.isArray(res.data.message) ? res.data.message.join(', ') : res.data.message;
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
    <div className="min-h-screen flex flex-col justify-center bg-slate-950 text-slate-100 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow com a paleta do Astrea */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logotipo e Identidade Astrea */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white shadow-xl shadow-sky-500/20 ring-4 ring-sky-500/10">
            <Scale className="h-8 w-8 text-white" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400" />
            </div>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Danino Neves <span className="text-sky-400">Advocacia</span>
          </h1>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mt-1">
            Sociedade de Advogados • Gestão Integrada
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs text-sky-300 border border-sky-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
            <span>Controladoria Jurídica & Prazos</span>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Falha de Autenticação</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advogado@daninoneves.com.br"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300" htmlFor="senha">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-600/30 hover:from-sky-500 hover:to-sky-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 disabled:opacity-50 transition active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Destaque de Recursos Astrea */}
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>Sincronização ao vivo com 91 Tribunais (DataJud)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>Inteligência Artificial Copilot para análise processual</span>
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Astrea Legal • Davino Neves Advocacia © 2026
        </p>
      </div>
    </div>
  );
}
