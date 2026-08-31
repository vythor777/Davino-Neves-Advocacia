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
  KeyRound,
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <Scale className="h-8 w-8 text-amber-500 animate-pulse" />
        <p className="text-xs text-slate-400">Carregando painel de acesso...</p>
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

  const fillAdminCredentials = () => {
    setEmail('admin@davinoeneves.adv.br');
    setSenha('admin');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-900 text-slate-100 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Elementos sutis de fundo temático jurídico */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logotipo e Identidade */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-900/40 ring-1 ring-amber-400/30">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Davino & Neves
          </h1>
          <p className="text-xs uppercase tracking-widest text-amber-400/90 font-medium mt-0.5">
            Advocacia & Consultoria Jurídica
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300 border border-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Sistema Web de Gestão • Acesso Restrito</span>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-800/90 p-8 shadow-2xl backdrop-blur-md">
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Falha de Autenticação</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email">
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
                  placeholder="usuario@davinoeneves.adv.br"
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300" htmlFor="senha">
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
                  className="block w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 transition"
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
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/30 hover:from-amber-500 hover:to-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 transition active:scale-[0.99]"
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

          {/* Dica de Acesso Rápido para Avaliação/TCC */}
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-950/30 p-3.5 text-xs text-amber-200/90">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                <KeyRound className="h-3.5 w-3.5" />
                Acesso Inicial (Seed do Banco):
              </span>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="underline hover:text-white text-[11px] font-medium transition cursor-pointer"
              >
                Preencher dados
              </button>
            </div>
            <p className="text-[11px] text-amber-200/70 font-mono">
              admin@davinoeneves.adv.br • senha: admin
            </p>
          </div>
        </div>

        {/* Rodapé institucional */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Davino & Neves Advocacia © 2026 • Controladoria e Gestão Processual
        </p>
      </div>
    </div>
  );
}
