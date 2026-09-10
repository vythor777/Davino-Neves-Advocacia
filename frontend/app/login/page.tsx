'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Scale,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B0E14] text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <Scale className="h-8 w-8 text-[#c5a059] animate-pulse stroke-[1.25]" />
        <p className="text-xs text-slate-400">Carregando painel Davino Neves Advocacia...</p>
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
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Botão de Alternância de Tema no Canto Superior Direito */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle variant="dropdown" />
      </div>

      {/* Background ambiente sutil com a paleta executiva */}
      <div className="absolute inset-0 opacity-20 dark:opacity-15 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Logotipo e Identidade Institucional */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 dark:bg-[#161b22] text-[#dfcaa0] border border-[0.75px] border-[#c5a059]/40 shadow-xl">
            <Scale className="h-7 w-7 text-[#dfcaa0] stroke-[1.25]" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc] sm:text-3xl">
            Davino Neves <span className="text-[#c5a059]">Advocacia</span>
          </h1>
          <p className="text-xs font-medium tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-1">
            Sociedade de Advogados • Painel Executivo
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-white/[0.04] px-3 py-1 text-xs text-slate-700 dark:text-[#dfcaa0] border border-[0.5px] border-slate-200/80 dark:border-white/[0.08]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
            <span>Controladoria Jurídica & Gestão Integrada</span>
          </div>
        </div>

        {/* Card do Formulário */}
        <div className="mt-8 legal-glass-card fio-de-luz p-7 sm:p-8 rounded-2xl">
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-700 dark:text-rose-300">Falha de Autenticação</p>
                <p className="mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="email">
                E-mail Corporativo
              </label>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4 stroke-[1.25]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="advogado@davinoneves.com.br"
                  className="block w-full rounded-xl border border-slate-200/80 bg-white/60 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden focus:ring-1 focus:ring-[#c5a059]/30 dark:border-white/[0.08] dark:bg-[#161b22] dark:text-slate-100 dark:placeholder-slate-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="senha">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative rounded-xl">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4 stroke-[1.25]" />
                </div>
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200/80 bg-white/60 pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#c5a059] focus:outline-hidden focus:ring-1 focus:ring-[#c5a059]/30 dark:border-white/[0.08] dark:bg-[#161b22] dark:text-slate-100 dark:placeholder-slate-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-[#dfcaa0] transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.25]" /> : <Eye className="h-4 w-4 stroke-[1.25]" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c5a059] hover:bg-[#d4b36f] px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#c5a059]/40 disabled:opacity-50 transition active:scale-[0.99] cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                </>
              )}
            </button>
          </form>

          {/* Destaque de Recursos do Sistema */}
          <div className="mt-6 pt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c5a059] shrink-0 stroke-[1.5]" />
              <span>Sincronização com Tribunais & Central DataJud</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c5a059] shrink-0 stroke-[1.5]" />
              <span>Assistente Jurídico com IA para triagem e minutas</span>
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <p className="mt-8 text-center text-xs text-slate-500">
          Davino Neves Advocacia © 2026 • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
