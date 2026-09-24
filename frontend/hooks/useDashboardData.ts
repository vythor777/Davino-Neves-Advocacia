"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { processoService } from "@/services/processoService";
import { prazoService } from "@/services/prazoService";
import { clienteService } from "@/services/clienteService";
import { aniversarianteService } from "@/services/aniversarianteService";
import { financeiroService } from "@/services/financeiroService";
import { usuarioService } from "@/services/usuarioService";

const loaders = {
  processos: processoService.getAll,
  prazos: prazoService.getAll,
  clientes: clienteService.getAll,
  aniversariantes: aniversarianteService.getAniversariantesDoMes,
  financeiro: financeiroService.getResumo,
  equipe: usuarioService.getAll,
};
type Module = keyof typeof loaders;
type DashboardData = {
  [K in Module]?: Awaited<ReturnType<(typeof loaders)[K]>>;
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({});
  const [errors, setErrors] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);

  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    const entries = await Promise.all(
      Object.entries(loaders).map(async ([key, load]) => {
        try {
          return { key: key as Module, value: await load() };
        } catch {
          return { key: key as Module, value: undefined };
        }
      }),
    );
    if (current !== generation.current) return;
    setData(Object.fromEntries(entries.map(({ key, value }) => [key, value])));
    setErrors(
      entries.filter(({ value }) => value === undefined).map(({ key }) => key),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    const requestGeneration = generation;
    void reload();
    return () => {
      requestGeneration.current++;
    };
  }, [reload]);

  return { data, errors, loading, reload };
}
