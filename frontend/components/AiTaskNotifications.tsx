'use client';
import Link from 'next/link';
import { useAiTasks } from '@/context/AiTaskContext';
import { aiTaskUrl } from '@/utils/ai-tasks';
import { useAuth } from '@/context/AuthContext';
export function AiTaskNotifications({ onOpen }: { onOpen?: () => void }) {
  const { tasks, store } = useAiTasks();
  if (!tasks.length) return null;
  return <section aria-label="Análises de IA" className="max-h-64 overflow-y-auto border-b border-slate-200 py-3 dark:border-slate-700">
    <h3 className="mb-2 text-xs font-semibold">Assistente IA</h3>
    {tasks.map(task => <div key={task.id} className="mb-2 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
      <p className="font-medium">{task.title}</p>
      <p className="mt-1 text-slate-500 dark:text-slate-400">{task.status === 'pending' ? 'Análise em andamento…' : task.status === 'success' ? 'Resultado pronto' : 'Não foi possível concluir'}</p>
      {task.status === 'error' ? <button type="button" className="ui-button ui-button-secondary mt-2" onClick={() => store.retry(task.id)}>Tentar novamente</button> : <Link className="mt-2 inline-block text-blue-700 underline hover:text-blue-900 focus-visible:ring-2 active:opacity-80 dark:text-blue-300" href={aiTaskUrl(task)} onClick={() => { store.markRead(task.id); onOpen?.(); }}>{task.status === 'success' ? 'Ver resultado' : 'Ver análise'}</Link>}
    </div>)}
  </section>;
}
export function AiTaskIndicator() {
  const { tasks } = useAiTasks();
  const { isAuthenticated } = useAuth();
  const pending = tasks.filter(t => t.status === 'pending');
  if (!isAuthenticated || !pending.length) return null;
  return <aside role="status" aria-live="polite" className="fixed bottom-4 right-4 z-40 max-w-xs rounded-xl border border-blue-200 bg-white p-4 text-sm shadow-sm dark:border-blue-900 dark:bg-slate-900">
    <p className="font-medium">{pending.length === 1 ? 'Análise de IA em andamento…' : `${pending.length} análises de IA em andamento…`}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Avisaremos quando o resultado estiver pronto.</p>
    <Link href={aiTaskUrl(pending[0])} className="mt-2 inline-block text-blue-700 underline hover:text-blue-900 focus-visible:ring-2 active:opacity-80 dark:text-blue-300">Acompanhar</Link>
  </aside>;
}
