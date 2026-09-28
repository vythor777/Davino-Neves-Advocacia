"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { prazoService, type Prazo } from "@/services/prazoService";
import { calcularStatusPrazo, extractDateParts } from "@/utils/dateUtils";
import { EmptyState } from "./DashboardSection";

const filters = {
  prioridade: "Prioridades",
  hoje: "Hoje",
  semana: "Próximos 7 dias",
};
export function DeadlineAgenda({
  prazos,
  onUpdate,
}: {
  prazos: Prazo[];
  onUpdate: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<keyof typeof filters>("prioridade");
  const [saving, setSaving] = useState<number | null>(null);
  const items = prazos
    .map((prazo) => ({
      prazo,
      timing: calcularStatusPrazo(
        prazo.data_vencimento,
        prazo.status,
        prazo.hora,
      ),
    }))
    .filter(
      ({ timing }) =>
        timing.urgencia !== "cumprido" &&
        (filter === "hoje"
          ? timing.urgencia === "hoje"
          : filter === "semana"
            ? timing.dias >= 0 && timing.dias <= 7
            : timing.dias <= 7),
    )
    .sort(
      (a, b) =>
        a.prazo.data_vencimento.localeCompare(b.prazo.data_vencimento) ||
        (a.prazo.hora || "").localeCompare(b.prazo.hora || ""),
    );

  async function complete(id: number) {
    setSaving(id);
    try {
      await prazoService.update(id, { status: "Cumprido" });
      toast.success("Prazo marcado como cumprido.");
      await onUpdate();
    } catch {
      toast.error("Não foi possível atualizar o prazo.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <div
        className="mb-5 flex w-fit max-w-full flex-wrap gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800"
        role="group"
        aria-label="Filtrar agenda"
      >
        {Object.entries(filters).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as keyof typeof filters)}
            aria-pressed={filter === key}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-blue-100 dark:hover:bg-slate-700 ${filter === key ? "bg-white text-blue-800 shadow-xs dark:bg-slate-700 dark:text-blue-200" : "text-slate-600 dark:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!items.length ? (
        <EmptyState icon={CalendarDays} action={{ href: "/prazos?novo=true", label: "Agendar compromisso" }}>Nenhum prazo pendente neste período.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.slice(0, 6).map(({ prazo, timing }) => (
            <li key={prazo.id_prazo} className="flex items-center gap-3 py-4">
              <div aria-hidden className="flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-background">
                <span className="text-lg font-semibold leading-none">{extractDateParts(prazo.data_vencimento).day}</span>
                <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">{["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"][extractDateParts(prazo.data_vencimento).month]}</span>
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href="/prazos"
                  className="dashboard-link block truncate text-sm font-medium"
                >
                  {prazo.descricao}
                </Link>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {prazo.processo?.numero_processo || "Processo não informado"}
                  {prazo.responsavel ? ` · ${prazo.responsavel}` : ""}
                </p>
                <p
                  className={`mt-1 text-xs ${timing.urgencia === "vencido" ? "text-red-700 dark:text-red-300" : "text-slate-600 dark:text-slate-300"}`}
                >
                  {timing.dataExibicao}
                  {prazo.hora ? ` · ${prazo.hora}` : ""}
                  <span className={`ml-2 inline-flex rounded-md px-2 py-0.5 font-medium ${timing.isVencido ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : timing.isHoje || timing.isUrgente ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{timing.label}</span>
                </p>
              </div>
              <button
                disabled={saving !== null}
                onClick={() => complete(prazo.id_prazo)}
                aria-label={`Marcar como cumprido: ${prazo.descricao}`}
                title="Marcar como cumprido"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-green-950 dark:hover:text-green-300"
              >
                {saving === prazo.id_prazo ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <Check aria-hidden className="h-4 w-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 6 && (
        <Link href="/prazos" className="dashboard-link mt-4 block text-sm">
          Ver os {items.length} prazos do período
        </Link>
      )}
    </>
  );
}
