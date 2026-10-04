import type { ReactNode } from "react";
import Image from "next/image";
import { BrandMark } from "@/components/ui/BrandMark";
import { LoginShowcase } from "./LoginShowcase";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="login-page">
      <aside className="login-identity">
        <div className="flex items-center gap-3">
          <BrandMark size="large" />
          <div>
            <p className="text-lg font-semibold">Davino Neves</p>
            <p className="text-xs uppercase tracking-widest text-blue-200">
              Advocacia
            </p>
          </div>
        </div>
        <div className="my-auto space-y-7 py-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-200">
            Gestão jurídica
          </p>
          <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Clareza para cuidar de cada caso.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
            Sua rotina de trabalho, organizada do primeiro atendimento ao
            acompanhamento processual.
          </p>
          <LoginShowcase />
          <p className="text-xs leading-relaxed text-blue-100/80">Assistente IA · Consulta CNJ · Agenda e prazos</p>
        </div>
        <p className="text-xs text-slate-400">
          Davino Neves Advocacia · {new Date().getFullYear()}
        </p>
      </aside>
      <section className="login-access" aria-label="Acesso ao sistema">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark />
            <span className="font-semibold">Davino Neves Advocacia</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            Área do escritório
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Bem-vindo de volta
          </h1>
          <p className="mt-3 mb-8 text-sm text-slate-500 dark:text-slate-400">
            Entre com sua conta para acessar o sistema.
          </p>
          {children}
          <div className="mt-8 overflow-hidden rounded-xl border border-line lg:hidden">
            <Image src="/login/cover-v2.png" width={1280} height={800}
              alt="Interface do sistema Davino Neves Advocacia"
              className="aspect-[8/5] w-full object-contain" />
          </div>
          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Precisa de acesso? Entre em contato com o administrador do
            escritório.
          </p>
        </div>
      </section>
    </main>
  );
}
