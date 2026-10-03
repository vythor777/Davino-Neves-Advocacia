import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AiTaskStore, aiTaskUrl, findAiTask } from '../frontend/utils/ai-tasks';
const tick = () => new Promise(resolve => setImmediate(resolve));
test('generation completes after page subscriber leaves; results and drafts remain', async () => {
  const store = new AiTaskStore();
  let finish!: (value: unknown) => void;
  const unsubscribe = store.subscribe(() => {});
  store.setDraft('docTexto', 'Texto de teste');
  const id = store.start('resumir_documento', 'Resumo', () => new Promise(resolve => { finish = resolve; }));
  await tick(); unsubscribe();
  finish('Resumo concluído'); await tick();
  assert.equal(store.getSnapshot().tasks[0].result, 'Resumo concluído');
  assert.equal(store.getSnapshot().drafts.docTexto, 'Texto de teste');
  assert.equal(store.getSnapshot().visible.resumir_documento, id);
  assert.equal(aiTaskUrl(store.getSnapshot().tasks[0]), `/gemini?acao=resumir_documento&resultado=${id}`);
});
test('parallel actions survive completion order and repeated clicks do not duplicate', async () => {
  const store = new AiTaskStore(); let finish!: (value: unknown) => void; let calls = 0;
  const id = store.start('criar_peca', 'Peça', () => { calls++; return new Promise(resolve => { finish = resolve; }); });
  assert.equal(store.start('criar_peca', 'Peça', async () => 'duplicado'), id);
  store.start('resumir_documento', 'Resumo', async () => 'Resumo');
  await tick(); finish('Peça'); await tick();
  assert.equal(calls, 1); assert.equal(store.getSnapshot().tasks.length, 2);
  assert.ok(store.getSnapshot().tasks.every(t => t.status === 'success'));
});
test('failure can retry original input after navigation and mark notification read', async () => {
  const store = new AiTaskStore(); let attempt = 0;
  const id = store.start('analisar_processo', 'Análise', async () => { if (++attempt === 1) throw new Error('Falha temporária'); return 'Pronto'; });
  await tick(); assert.equal(store.getSnapshot().tasks[0].status, 'error');
  const retryId = store.retry(id); await tick();
  assert.notEqual(retryId, id); assert.equal(store.getSnapshot().tasks[0].result, 'Pronto');
  store.markRead(retryId!); assert.equal(store.getSnapshot().tasks[0].read, true);
});
test('logout clears content and ignores late responses from the previous session', async () => {
  const store = new AiTaskStore(); let finish!: (value: unknown) => void;
  store.start('resumir_documento', 'Resumo', () => new Promise(resolve => { finish = resolve; }));
  store.setDraft('docTexto', 'Privado'); await tick(); store.clear();
  finish('Resposta antiga'); await tick();
  assert.deepEqual(store.getSnapshot(), { tasks: [], drafts: {}, visible: {} });
});

test('switching actions restores their results despite a URL pointing at another action', async () => {
 const store=new AiTaskStore();
 const analysis=store.start('analisar_processo','Análise',async()=>'Análise');
 const summary=store.start('resumir_documento','Resumo',async()=>'Resumo');
 await tick();
 assert.equal(findAiTask(store.getSnapshot(),'resumir_documento',analysis)?.id,summary);
 store.hide('resumir_documento');
 assert.equal(findAiTask(store.getSnapshot(),'resumir_documento',analysis),undefined);
});
test('retry replaces an old failed result while preserving explicit successful history', async () => {
 const store=new AiTaskStore();let attempt=0;
 const failed=store.start('criar_peca','Peça',async()=>{if(++attempt===1)throw new Error('Falha');return 'Peça';});
 await tick();const retried=store.retry(failed);await tick();
 assert.equal(findAiTask(store.getSnapshot(),'criar_peca',failed)?.id,retried);
 const newer=store.start('criar_peca','Peça nova',async()=>'Nova');await tick();
 assert.equal(findAiTask(store.getSnapshot(),'criar_peca',retried)?.id,retried);
 assert.equal(findAiTask(store.getSnapshot(),'criar_peca')?.id,newer);
});
