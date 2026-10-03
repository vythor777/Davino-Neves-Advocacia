const labels: Record<string, string> = {
  acesso_financeiro: 'Acesso ao Financeiro',
  nome: 'Nome', titulo: 'Título', numero_processo: 'Número CNJ', descricao: 'Descrição',
  cpf_cnpj: 'CPF/CNPJ', email: 'E-mail', telefone: 'Telefone', endereco: 'Endereço',
  data_nascimento: 'Data de nascimento', data_abertura: 'Data de abertura', status: 'Status',
  data_vencimento: 'Vencimento', hora: 'Hora', tipoCompromisso: 'Tipo de compromisso',
  responsavel: 'Responsável', id_responsavel: 'Responsável (ID)', id_processo: 'Processo (ID)',
  id_cliente: 'Cliente (ID)', role: 'Cargo', ativo: 'Ativo', valor: 'Valor',
  dataVencimento: 'Vencimento', dataPagamento: 'Pagamento', tipo: 'Tipo', categoria: 'Categoria',
};
function comparable(value: unknown) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}
export function auditChanges(body: Record<string, unknown>, previous: Record<string, unknown> | null) {
  return Object.entries(body).filter(([key, value]) => key in labels &&
    !(previous && key in previous && JSON.stringify(comparable(previous[key])) === JSON.stringify(comparable(value))))
    .map(([key, value]) => `${labels[key]}: ${previous && key in previous ? JSON.stringify(comparable(previous[key])) + ' → ' : ''}${JSON.stringify(comparable(value))}`).join('; ');
}
