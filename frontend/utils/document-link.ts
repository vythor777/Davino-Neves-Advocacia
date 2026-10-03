import type { Documento } from '@/services/documentoService';
import type { Processo } from '@/services/processoService';
import type { Cliente } from '@/services/clienteService';
export function documentLink(document: Documento, processes: Processo[], clients: Cliente[]) {
  const process = processes.find(p => p.id_processo === document.id_processo);
  if (process) return { label: `${process.numero_processo} · ${process.titulo}`, href: `/processos?q=${encodeURIComponent(process.numero_processo)}` };
  const client = clients.find(c => c.id_cliente === document.id_cliente);
  if (client) return { label: client.nome, href: `/clientes?q=${encodeURIComponent(client.nome)}` };
  return { label: document.id_processo ? `Processo #${document.id_processo} (vínculo indisponível)` : document.id_cliente ? `Cliente #${document.id_cliente} (vínculo indisponível)` : 'Escritório', href: null };
}
