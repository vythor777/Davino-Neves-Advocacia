import { BadRequestException } from '@nestjs/common';
/** Calendar estimate only: no judicial calendar, holidays or suspensions are inferred. */
export function simpleDeadline(text: string, initial?: string, selected?: 'uteis' | 'corridos') {
  const match = text.trim().match(/^(\d+)\s+dias?(?:\s+([uú]til|[uú]teis|corridos?))?[.!]?$/i);
  if (!match) return undefined;
  const days = Number(match[1]);
  if (!Number.isSafeInteger(days) || days < 1 || days > 10000) throw new BadRequestException('Informe entre 1 e 10 mil dias para a contagem simples.');
  const explicit = match[2] ? (/corridos?/i.test(match[2]) ? 'corridos' : 'uteis') : undefined;
  const conflict = !!(selected && explicit && selected !== explicit);
  const counting = conflict ? undefined : explicit || selected;
  const result: Record<string, any> = {tem_prazo: true, natureza:'calculo_simples', descricao_providencia:'Contagem simples informada pelo usuário', quantidade_dias:days, tipo_contagem:counting === 'uteis' ? 'Dias úteis' : counting === 'corridos' ? 'Dias corridos' : 'Não confirmada', urgencia:'Baixa'};
  if (!counting) { result.observacoes = conflict ? 'Há conflito entre a regra no texto e a selecionada. Confirme a contagem.' : 'Informe se a contagem deve ser em dias úteis ou corridos.'; return result; }
  if (!initial) { result.observacoes = 'Informe a data inicial para calcular. A regra de contagem já foi definida.'; return result; }
  const date=new Date(initial+'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(initial) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10)!==initial) throw new BadRequestException('Informe uma data inicial válida.');
  let counted=0;
  while (counted<days) { date.setUTCDate(date.getUTCDate()+1); if (counting==='corridos' || (date.getUTCDay()!==0 && date.getUTCDay()!==6)) counted++; }
  result.data_limite_estimada=date.toISOString().slice(0,10);
  result.observacoes=`Estimativa de calendário: data inicial ${initial} excluída. ${counting==='uteis' ? 'Contados apenas segunda a sexta, sem descontar feriados ou suspensões.' : 'Contados todos os dias, incluindo sábados, domingos e feriados; sem ajuste do vencimento.'} Não confirma vencimento processual; confira o calendário e o termo inicial antes de agendar.`;
  return result;
}
