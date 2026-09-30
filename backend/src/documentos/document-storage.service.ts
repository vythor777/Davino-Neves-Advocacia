import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
@Injectable()
export class DocumentStorageService {
  private client() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new ServiceUnavailableException('O armazenamento de documentos ainda não foi configurado pelo administrador.');
    return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(30_000) }) } });
  }
  private bucket() { return this.client().storage.from(process.env.SUPABASE_DOCUMENTS_BUCKET || 'documentos-juridicos'); }
  async upload(path: string, bytes: Buffer) {
    const { error } = await this.bucket().upload(path, bytes, { contentType: 'application/pdf', upsert: false });
    if (error) throw new ServiceUnavailableException('Não foi possível armazenar o PDF. Tente novamente.');
  }
  async download(path: string) {
    const { data, error } = await this.bucket().download(path);
    if (error || !data) throw new ServiceUnavailableException('Não foi possível baixar o PDF.');
    return Buffer.from(await data.arrayBuffer());
  }
  async remove(path: string) {
    const { error } = await this.bucket().remove([path]);
    if (error) throw new ServiceUnavailableException('Não foi possível liberar o arquivo na nuvem.');
  }
}
