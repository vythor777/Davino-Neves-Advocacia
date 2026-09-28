'use client';
import type { Processo } from '@/services/processoService';
import { usePermissions } from '@/hooks/usePermissions';
import { useProcessAccess } from '@/hooks/useProcessAccess';
import { isClosedProcess } from '@/utils/permissions';
import { Skeleton } from './Skeleton';
export function ProcessAccessPanel({
  process,
  onUpdated,
}: {
  process: Processo;
  onUpdated: (p: Processo) => void;
}) {
  const { admin, canCreateProcess } = usePermissions();
  const state = useProcessAccess(process, onUpdated);
  const closed = isClosedProcess(process.status);
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <h3 className="font-semibold">Equipe e acesso ao processo</h3>
      <p className="text-sm text-slate-500">
        Responsável:{' '}
        {process.responsavel?.nome ??
          'Aguardando atribuição pelo administrador'}
      </p>
      {admin && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-blue-700 focus-visible:outline-2">
            Gerenciar acessos
          </summary>
          {state.loading ? (
            <Skeleton className="mt-3 h-24 w-full" />
          ) : state.error ? (
            <p role="alert">{state.error}</p>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                Advogado responsável
                <select
                  className="mt-1 block w-full rounded-lg border p-2 dark:bg-slate-900"
                  value={state.owner}
                  onChange={(e) => state.setOwner(e.target.value)}
                >
                  <option value="">Sem responsável</option>
                  {state.members
                    .filter((m) => m.role === 'ADVOGADO')
                    .map((m) => (
                      <option key={m.id_usuario} value={m.id_usuario}>
                        {m.nome}
                      </option>
                    ))}
                </select>
              </label>
              <fieldset className="max-h-48 space-y-1 overflow-auto">
                <legend className="mb-2 text-sm">Liberar acesso para</legend>
                {state.members
                  .filter((m) => m.role !== 'ADMINISTRADOR')
                  .map((m) => (
                    <label
                      key={m.id_usuario}
                      className="flex min-h-10 items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={state.participants.includes(m.id_usuario)}
                        onChange={(e) =>
                          state.setParticipants(
                            e.target.checked
                              ? [...state.participants, m.id_usuario]
                              : state.participants.filter(
                                  (id) => id !== m.id_usuario,
                                ),
                          )
                        }
                      />
                      {m.nome} ·{' '}
                      {m.role === 'ADVOGADO' ? 'Advogado' : 'Estagiário'}
                    </label>
                  ))}
              </fieldset>
              <p className="text-xs text-slate-500">
                Vinculados podem consultar. A edição das informações fica com o
                advogado responsável e o administrador.
              </p>
              <button
                type="button"
                className="ui-button ui-button-primary"
                disabled={state.saving}
                onClick={state.save}
              >
                {state.saving ? 'Salvando…' : 'Salvar acessos'}
              </button>
            </div>
          )}
        </details>
      )}
      {canCreateProcess && (!closed || admin) && (
        <button
          type="button"
          className="ui-button ui-button-secondary"
          disabled={state.saving}
          onClick={() => state.changeStatus(closed)}
        >
          {closed ? 'Restaurar processo' : 'Arquivar processo'}
        </button>
      )}
    </section>
  );
}
