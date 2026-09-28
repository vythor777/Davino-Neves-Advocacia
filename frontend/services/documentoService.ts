import api from './api';
export interface Documento {
  id_documento: number;
  nome_arquivo: string;
  tamanho: number;
  data_upload: string;
}
export const documentoService = {
  async list(id: number) {
    return (
      await api.get<Documento[]>('/documentos', { params: { id_processo: id } })
    ).data;
  },
  async upload(id: number, file: File) {
    const form = new FormData();
    form.append('id_processo', String(id));
    form.append('arquivo', file);
    await api.post('/documentos', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  async download(doc: Documento) {
    const { data } = await api.get<Blob>(
      `/documentos/${doc.id_documento}/download`,
      { responseType: 'blob', timeout: 60000 },
    );
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.nome_arquivo;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};
