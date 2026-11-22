'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { documentoService, saveDocumentBlob } from '@/services/documentoService';

const button = 'rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-700 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800';
const uploadLimit = 5_000_000;
const compressionLimit = 20_000_000;

export function PdfUpload({
  processId, clientId, disabled = false, onUploaded,
}: {
  processId?: number;
  clientId?: number;
  disabled?: boolean;
  onUploaded: () => Promise<void>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function upload() {
    setBusy(true);
    setErrors([]);
    try {
      const remaining: File[] = [];
      const failures: string[] = [];
      for (const file of files) {
        try {
          await documentoService.upload(file, processId, clientId);
        } catch (error) {
          remaining.push(file);
          failures.push(file.name + ' — ' + (error instanceof Error ? error.message : 'Falha no envio.'));
        }
      }
      const uploaded = files.length - remaining.length;
      setFiles(remaining);
      setErrors(failures);
      if (uploaded > 0) {
        toast.success(uploaded === 1 ? 'Documento armazenado.' : `${uploaded} documentos armazenados.`);
        await onUploaded();
      }
    } finally {
      setBusy(false);
    }
  }

  async function optimize(file: File, index: number) {
    setBusy(true);
    try {
      const blob = await documentoService.compress(file);
      setFiles(previous => previous.map((item, position) => position === index ? new File([blob], file.name, { type: 'application/pdf' }) : item));
      setErrors([]);
      saveDocumentBlob(blob, 'otimizado-' + file.name);
      toast.success('PDF otimizado. Confira o arquivo antes de enviar.');
    } catch (error) {
      setErrors([file.name + ' — ' + (error instanceof Error ? error.message : 'Falha na otimização.')]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-w-0 space-y-3">
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Selecionar PDFs</span>
        <input
          type="file"
          multiple
          accept="application/pdf,.pdf"
          disabled={busy}
          onChange={event => {
            setFiles(Array.from(event.currentTarget.files ?? []));
            setErrors([]);
            event.currentTarget.value = '';
          }}
          className="block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-blue-800 dark:file:bg-slate-800 dark:file:text-slate-200"
        />
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400">Até 5 MB por PDF. A otimização está disponível para arquivos de até 20 MB.</p>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li key={index} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-0 wrap-break-word">{file.name} · {(file.size / 1e6).toFixed(2)} MB{file.size > uploadLimit && ' · Acima do limite de envio'}</span>
              <button type="button" className={button} disabled={busy || file.size > compressionLimit} onClick={() => void optimize(file, index)}>Otimizar PDF</button>
              <button type="button" className={button} disabled={busy} aria-label={`Remover ${file.name} da seleção`} onClick={() => {
                setFiles(previous => previous.filter((_, position) => position !== index));
                setErrors([]);
              }}>Remover</button>
            </li>
          ))}
        </ul>
      )}
      {errors.length > 0 && <ul role="alert" className="space-y-1 text-sm text-rose-700 dark:text-rose-400">{errors.map((message, index) => <li key={index}>{message}</li>)}</ul>}
      <button type="button" className={button} disabled={busy || disabled || files.length === 0 || files.some(file => file.size > uploadLimit)} onClick={() => void upload()}>
        {busy ? 'Processando…' : files.length === 1 ? 'Enviar PDF' : 'Enviar PDFs'}
      </button>
    </div>
  );
}
