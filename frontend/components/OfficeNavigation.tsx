'use client';
import { usePermissions } from '@/hooks/usePermissions';
import Link from "next/link";
import {
  Briefcase,
  Files,
  CalendarClock,
  CircleDollarSign,
  LayoutDashboard,
  Scale,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

const groups = [
  {
    label: "Escritório",
    links: [
      { label: "Visão geral", href: "/", icon: LayoutDashboard },
      { label: "Processos", href: "/processos", icon: Briefcase },
      { label: "Agenda e prazos", href: "/prazos", icon: CalendarClock },
      { label: "Clientes", href: "/clientes", icon: Users },
      { label: "Documentos", href: "/documentos", icon: Files },
      { label: "Financeiro", href: "/financeiro", icon: CircleDollarSign },
    ],
  },
  {
    label: "Ferramentas",
    links: [
      { label: "Consultar CNJ", href: "/datajud", icon: Scale },
      { label: "Assistente IA", href: "/gemini", icon: Sparkles },
      { label: "Equipe", href: "/usuarios", icon: Shield },
      { label: "Auditoria", href: "/auditoria", icon: Shield },
      { label: "Configurações", href: "/configuracoes", icon: Shield },
    ],
  },
];

export function OfficeNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { admin } = usePermissions();
  return (
    <nav aria-label="Navegação do escritório" className="mt-10 space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {group.label}
          </p>
          <ul className="space-y-1">
            {group.links.filter(link => admin || !["/usuarios", "/auditoria", "/configuracoes"].includes(link.href)).map(({ label, href, icon: Icon }) => {
              const active =
                pathname === href ||
                (href !== "/" && pathname.startsWith(`${href}/`));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:opacity-80 dark:hover:bg-blue-950 dark:hover:text-blue-200 ${active ? "bg-blue-50 font-semibold text-[#0047ab] ring-1 ring-inset ring-blue-100 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    <Icon aria-hidden className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
