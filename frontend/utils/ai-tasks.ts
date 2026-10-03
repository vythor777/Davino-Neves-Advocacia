export type AiAction = 'analisar_processo' | 'resumir_documento' | 'encontrar_jurisprudencia' | 'criar_peca' | 'identificar_prazos';
export interface AiTask {
  id: string; action: AiAction; title: string; status: 'pending' | 'success' | 'error';
  result?: unknown; error?: string; read: boolean;
}
export interface AiSnapshot { tasks: AiTask[]; drafts: Record<string, unknown>; visible: Partial<Record<AiAction, string | null>>; }
/** Session-only store: survives route unmounts, never writes legal content to browser storage. */
export class AiTaskStore {
  private snapshot: AiSnapshot = { tasks: [], drafts: {}, visible: {} };
  private listeners = new Set<() => void>();
  private operations = new Map<string, () => Promise<unknown>>();
  private generation = 0;
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(snapshot: AiSnapshot) { this.snapshot = snapshot; this.listeners.forEach(fn => fn()); }
  clear() { this.generation++; this.operations.clear(); this.update({ tasks: [], drafts: {}, visible: {} }); }
  setDraft(key: string, value: unknown) { this.update({ ...this.snapshot, drafts: { ...this.snapshot.drafts, [key]: value } }); }
  hide(action: AiAction) { this.update({ ...this.snapshot, visible: { ...this.snapshot.visible, [action]: null } }); }
  markRead(id: string) { this.update({ ...this.snapshot, tasks: this.snapshot.tasks.map(t => t.id === id ? { ...t, read: true } : t) }); }
  start(action: AiAction, title: string, operation: () => Promise<unknown>): string {
    const pending = this.snapshot.tasks.find(t => t.action === action && t.status === 'pending');
    if (pending) return pending.id;
    const id = crypto.randomUUID(); const generation = this.generation;
    this.operations.set(id, operation);
    this.update({ ...this.snapshot, tasks: [{ id, action, title, status: 'pending', read: false }, ...this.snapshot.tasks], visible: { ...this.snapshot.visible, [action]: id } });
    void Promise.resolve().then(operation).then(result => {
      if (generation !== this.generation) return;
      this.operations.delete(id);
      this.update({ ...this.snapshot, tasks: this.snapshot.tasks.map(t => t.id === id ? { ...t, status: 'success', result } : t) });
    }, error => {
      if (generation !== this.generation) return;
      this.update({ ...this.snapshot, tasks: this.snapshot.tasks.map(t => t.id === id ? { ...t, status: 'error', error: error instanceof Error ? error.message : 'Não foi possível concluir a análise.' } : t) });
    });
    return id;
  }
  retry(id: string) {
    const task = this.snapshot.tasks.find(t => t.id === id);
    const operation = this.operations.get(id);
    if (!task || task.status !== 'error' || !operation) return;
    this.markRead(id);
    return this.start(task.action, task.title, operation);
  }
}
export function aiTaskUrl(task: AiTask) { return `/gemini?acao=${task.action}&resultado=${encodeURIComponent(task.id)}`; }
