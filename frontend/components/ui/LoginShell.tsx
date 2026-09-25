import type { ReactNode } from "react";
import { Briefcase, CalendarClock, Scale, Users } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  {
    icon: Briefcase,
    title: "Processos organizados",
    text: "Histórico e informações para acompanhar cada caso.",
  },
  {
    icon: CalendarClock,
    title: "Prazos em perspectiva",
    text: "Uma agenda para as prioridades do escritório.",
  },
  {
    icon: Users,
    title: "Equipe conectada",
    text: "Clientes, responsáveis e atividades em um só lugar.",
  },
];

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <main className="login-page">
      <aside className="login-identity">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-500/15">
            <Scale className="h-6 w-6 text-blue-200" />
          </span>
          <div>
            <p className="text-lg font-semibold">Davino Neves</p>
            <p className="text-xs uppercase tracking-widest text-blue-200">
              Advocacia
            </p>
          </div>
        </div>
        <div className="my-auto py-12">
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
          <ul className="mt-10 space-y-6">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <Icon
                  aria-hidden
                  className="mt-1 h-5 w-5 shrink-0 text-blue-200"
                />
                <div>
                  <p className="text-sm font-medium">{title}</p>
                  <p className="mt-1 text-sm text-slate-300">{text}</p>
                </div>
              </li>
            ))}
          </ul>
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
            <Scale className="h-7 w-7 text-brand" />
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
          <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Precisa de acesso? Entre em contato com o administrador do
            escritório.
          </p>
        </div>
      </section>
    </main>
  );
}
