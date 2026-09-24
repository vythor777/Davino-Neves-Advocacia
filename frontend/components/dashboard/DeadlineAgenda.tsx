"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { prazoService, type Prazo } from "@/services/prazoService";
import { calcularStatusPrazo } from "@/utils/dateUtils";
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
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrar agenda"
      >
        {Object.entries(filters).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as keyof typeof filters)}
            aria-pressed={filter === key}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-blue-100 dark:hover:bg-slate-700 ${filter === key ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200" : "text-slate-600 dark:text-slate-300"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {!items.length ? (
        <EmptyState>Nenhum prazo pendente neste período.</EmptyState>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.slice(0, 6).map(({ prazo, timing }) => (
            <li key={prazo.id_prazo} className="flex items-center gap-3 py-3">
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
                  {prazo.hora ? ` · ${prazo.hora}` : ""} · {timing.label}
                </p>
              </div>
              <button
                disabled={saving !== null}
                onClick={() => complete(prazo.id_prazo)}
                aria-label={`Marcar como cumprido: ${prazo.descricao}`}
                title="Marcar como cumprido"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-green-50 hover:text-green-700 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-green-950 dark:hover:text-green-300"
              >
                <Check className="h-4 w-4" />
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
