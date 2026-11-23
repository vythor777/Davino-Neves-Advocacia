import api from './api';
export interface Documento { id_documento: number; nome_arquivo: string; id_processo: number | null; id_cliente: number | null; tamanho_bytes: number; sha256: string | null; situacao: string; acesso_restrito?: boolean; data_upload: string; }
export interface StorageUsage { usado: number; limite: number; percentual: number; alerta: string; }
export const documentDeletionBatchSize = 8;
interface DocumentDeletionResult {
  excluidos: Array<{ id_documento: number; nome_arquivo: string }>;
  ausentes: number[];
  falhas: Array<{ id_documento: number; mensagem: string }>;
}
export const documentoService = {
  async delete(id: number): Promise<void> { await api.delete(`/documentos/${id}`, { timeout: 45_000 }); },
  async deleteBatch(ids: number[]): Promise<DocumentDeletionResult> {
    return (await api.delete<DocumentDeletionResult>('/documentos', { data: { ids }, timeout: 45_000 })).data;
  },
  async list(processId?: number, clientId?: number): Promise<Documento[]> {
    return (await api.get('/documentos', { params: { id_processo: processId, id_cliente: clientId } })).data;
  },
  async usage(): Promise<StorageUsage> { return (await api.get('/documentos/uso')).data; },
  async upload(file: File, processId?: number, clientId?: number) {
    const body = new FormData(); body.append('arquivo', file);
    if (processId) body.append('id_processo', String(processId));
    if (clientId) body.append('id_cliente', String(clientId));
    return (await api.post('/documentos', body)).data;
  },
  async compress(file: File): Promise<Blob> { const body = new FormData(); body.append('arquivo', file); return (await api.post('/documentos/comprimir', body, { responseType: 'blob', timeout: 60000 })).data; },
  async download(id: number): Promise<Blob> { return (await api.get(`/documentos/${id}/download`, { responseType: 'blob' })).data; },
  async backup(ids: number[]): Promise<Blob> { return (await api.post('/documentos/backup', { ids }, { responseType: 'blob', timeout: 120000 })).data; },
  async archive(id: number, sha256: string) { return (await api.post(`/documentos/${id}/arquivar`, { backup_conferido: true, sha256 })).data; },
};
export function saveDocumentBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
