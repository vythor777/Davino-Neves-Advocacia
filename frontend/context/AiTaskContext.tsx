'use client';
import { createContext, useContext, useEffect, useState, useSyncExternalStore, useRef, type ReactNode, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AiTaskStore, aiTaskUrl } from '@/utils/ai-tasks';
import { toast } from 'sonner';
const Context = createContext<AiTaskStore | null>(null);
export function AiTaskProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const router = useRouter();
  const [store] = useState(() => new AiTaskStore());
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const announced = useRef(new Set<string>());
  useEffect(() => { store.clear(); announced.current.clear(); toast.dismiss(); }, [token, store]);
  useEffect(() => {
    for (const task of snapshot.tasks) {
      const key = `${task.id}:${task.status}`;
      if (announced.current.has(key)) continue;
      announced.current.add(key);
      if (task.status === 'pending') toast.info('A IA está trabalhando. Você pode continuar usando o sistema.', { id: task.id, duration: 5000 });
      else if (task.status === 'success') toast.success(`${task.title}: resultado pronto`, { id: task.id, duration: 10000, action: { label: 'Ver resultado', onClick: () => { store.markRead(task.id); router.push(aiTaskUrl(task)); } } });
      else toast.error(`${task.title}: não foi possível concluir`, { id: task.id, description: task.error, duration: 10000, action: { label: 'Tentar novamente', onClick: () => store.retry(task.id) } });
    }
  }, [snapshot.tasks, store, router]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useAiTasks() {
  const store = useContext(Context);
  if (!store) throw new Error('AiTaskProvider ausente');
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { store, ...snapshot };
}
export function useAiDraft<T>(key: string, initial: T): [T, (next: SetStateAction<T>) => void] {
  const { store, drafts } = useAiTasks();
  const value = (key in drafts ? drafts[key] : initial) as T;
  return [value, next => store.setDraft(key, typeof next === 'function' ? (next as (previous: T) => T)(value) : next)];
}
