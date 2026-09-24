"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";
import AuthGuard from "@/components/AuthGuard";
import { InstitutionalFooter } from "@/components/InstitutionalFooter";
import {
  DashboardSection,
  EmptyState,
} from "@/components/dashboard/DashboardSection";
import { DeadlineAgenda } from "@/components/dashboard/DeadlineAgenda";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatPrazoDateBR } from "@/utils/dateUtils";

const money = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const shortcuts = [
  ["/clientes?novo=true", "Cadastrar cliente"],
  ["/datajud", "Consultar processo no CNJ"],
  ["/gemini?acao=resumir_documento", "Resumir documento"],
  ["/gemini?acao=criar_peca", "Preparar peça com IA"],
  ["/gemini?acao=identificar_prazos", "Identificar prazos com IA"],
];

export default function HomePage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

function Dashboard() {
  const { data, loading, errors, reload } = useDashboardData();
  const [birthdayFilter, setBirthdayFilter] = useState("TODOS");
  const { processos, prazos, clientes, financeiro, equipe, aniversariantes } =
    data;
  const active = processos?.filter(
    (p) => !/arquivado|encerrado|finalizado|julgado/i.test(p.status),
  ).length;
  const pending = prazos?.filter(
    (p) => p.status.toLowerCase() !== "cumprido",
  ).length;
  const metrics = [
    {
      label: "Processos ativos",
      value: active,
      href: "/processos",
      detail: "Acompanhamento do acervo",
    },
    {
      label: "Prazos pendentes",
      value: pending,
      href: "/prazos",
      detail: "Todos os compromissos em aberto",
    },
    {
      label: "Clientes",
      value: clientes?.length,
      href: "/clientes",
      detail: "Relacionamento com o escritório",
    },
    {
      label: "Honorários a receber",
      value: financeiro
        ? money(financeiro.metricas.honorariosAReceber)
        : undefined,
      href: "/financeiro",
      detail: financeiro
        ? `Referência: ${financeiro.periodo.mes}/${financeiro.periodo.ano}`
        : "Resumo financeiro",
    },
  ];
  const birthdays =
    aniversariantes?.aniversariantes.filter(
      (p) => birthdayFilter === "TODOS" || p.tipo === birthdayFilter,
    ) || [];

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("E-mail copiado.");
    } catch {
      toast.error("Não foi possível copiar o e-mail.");
    }
  }

  return (
    <div className="dashboard mx-auto max-w-7xl space-y-6 px-4 py-6 text-slate-900 sm:px-6 lg:px-8 dark:text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Gestão do escritório
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Painel de acompanhamento
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Prazos, processos e informações para organizar o dia.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={reload}
            disabled={loading}
            className="dashboard-button"
            aria-label="Atualizar painel"
            title="Atualizar painel"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link href="/prazos?novo=true" className="dashboard-button">
            Novo prazo
          </Link>
          <Link
            href="/processos?novo=true"
            className="dashboard-button dashboard-primary"
          >
            <Plus className="h-4 w-4" />
            Novo processo
          </Link>
        </div>
      </header>
      {!loading && errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
        >
          Algumas informações estão indisponíveis: {errors.join(", ")}. Use
          Atualizar para tentar novamente.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link
            key={metric.label}
            href={metric.href}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
          >
            <div className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
              {metric.label}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </div>
            {loading ? (
              <div
                className="my-3 h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"
                aria-label="Carregando"
              />
            ) : (
              <p className="my-3 break-words text-2xl font-semibold tabular-nums">
                {metric.value ?? "—"}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {!loading && metric.value === undefined
                ? "Informação indisponível"
                : metric.detail}
            </p>
          </Link>
        ))}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <DashboardSection
            title="Agenda e prazos"
            href="/prazos"
            loading={loading}
            unavailable={!prazos}
          >
            <DeadlineAgenda prazos={prazos || []} onUpdate={reload} />
          </DashboardSection>
          <DashboardSection
            title="Processos recentes"
            href="/processos"
            loading={loading}
            unavailable={!processos}
          >
            {!processos?.length ? (
              <EmptyState>Nenhum processo cadastrado.</EmptyState>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {[...processos]
                  .sort((a, b) => b.id_processo - a.id_processo)
                  .slice(0, 5)
                  .map((p) => (
                    <li key={p.id_processo} className="py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/processos?q=${encodeURIComponent(p.numero_processo)}`}
                          className="dashboard-link text-sm font-medium"
                        >
                          {p.titulo || p.numero_processo}
                        </Link>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {p.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {p.numero_processo} ·{" "}
                        {p.cliente?.nome || "Cliente não informado"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Abertura: {formatPrazoDateBR(p.data_abertura)}
                      </p>
                    </li>
                  ))}
              </ul>
            )}
          </DashboardSection>
        </div>
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 font-semibold">Acesso rápido</h2>
            <nav aria-label="Ações do escritório" className="space-y-1">
              {shortcuts.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="dashboard-link flex items-center justify-between gap-2 rounded-lg py-3 text-sm"
                >
                  {label}
                  <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0" />
                </Link>
              ))}
            </nav>
          </section>
          <DashboardSection
            title="Financeiro"
            href="/financeiro"
            loading={loading}
            unavailable={!financeiro}
          >
            {financeiro && (
              <dl className="space-y-4">
                {[
                  [
                    "Entradas realizadas",
                    financeiro.metricas.entradasRealizadas,
                  ],
                  ["Despesas pagas", financeiro.metricas.despesasPagas],
                  ["Saldo líquido", financeiro.metricas.saldoLiquido],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-wrap justify-between gap-2 text-sm"
                  >
                    <dt className="text-slate-500 dark:text-slate-400">
                      {label}
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {money(Number(value))}
                    </dd>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Período: {financeiro.periodo.mes}/{financeiro.periodo.ano}
                </div>
              </dl>
            )}
          </DashboardSection>
        </div>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DashboardSection
          title="Equipe"
          href="/usuarios"
          loading={loading}
          unavailable={!equipe}
        >
          {!equipe?.length ? (
            <EmptyState>Nenhum integrante cadastrado.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {equipe.map((person) => (
                <li
                  key={person.id_usuario}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <Link
                      href="/usuarios"
                      className="dashboard-link font-medium"
                    >
                      {person.nome}
                    </Link>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {person.email}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {person.ativo ? "Ativo" : "Inativo"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
        <DashboardSection
          title={`Aniversariantes${aniversariantes ? ` de ${aniversariantes.nomeMes}` : ""}`}
          href="/clientes"
          loading={loading}
          unavailable={!aniversariantes}
        >
          <label className="mb-3 flex items-center gap-3 text-sm">
            Exibir
            <select
              value={birthdayFilter}
              onChange={(e) => setBirthdayFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
            >
              <option value="TODOS">Todos</option>
              <option value="USUARIO">Equipe</option>
              <option value="CLIENTE">Clientes</option>
            </select>
          </label>
          {!birthdays.length ? (
            <EmptyState>Nenhum aniversariante neste grupo.</EmptyState>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {birthdays.map((person) => (
                <li key={person.id} className="flex items-center gap-3 py-3">
                  <span className="rounded-lg bg-blue-50 p-2 text-sm font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                    {person.diaFormatado}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {person.nome}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {person.tipo === "USUARIO" ? "Equipe" : "Cliente"} ·{" "}
                      {person.isHoje ? "Hoje" : person.diasRestantesTexto}
                    </p>
                  </div>
                  {person.email && (
                    <button
                      className="dashboard-button"
                      onClick={() => copyEmail(person.email)}
                      aria-label={`Copiar e-mail de ${person.nome}`}
                      title="Copiar e-mail"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>
      <InstitutionalFooter />
    </div>
  );
}
