/** Sugestões para organização interna do escritório; a subcategoria aceita texto livre. */
export const processCategories: Record<string, readonly string[]> = {
  'Cível': ['Divórcio', 'Ação de cobrança', 'Indenização por danos morais', 'Indenização por danos materiais', 'Execução de título', 'Obrigação de fazer', 'Usucapião', 'Inventário'],
  'Penal': ['Defesa criminal', 'Habeas corpus', 'Liberdade provisória', 'Execução penal', 'Queixa-crime', 'Revisão criminal'],
  'Trabalhista': ['Insalubridade', 'Periculosidade', 'Verbas rescisórias', 'Horas extras', 'Reconhecimento de vínculo', 'Rescisão indireta', 'Acidente de trabalho', 'Assédio moral'],
  'Previdenciário': ['Benefício BPC/LOAS', 'Aposentadoria por idade', 'Aposentadoria especial', 'Aposentadoria por incapacidade permanente', 'Auxílio por incapacidade temporária', 'Auxílio-acidente', 'Pensão por morte', 'Salário-maternidade', 'Revisão de benefício'],
  'Família': ['Divórcio', 'Alimentos', 'Guarda', 'Regulamentação de convivência', 'Reconhecimento de união estável', 'Dissolução de união estável', 'Investigação de paternidade', 'Interdição e curatela'],
  'Sucessões': ['Inventário', 'Partilha', 'Testamento', 'Petição de herança'],
  'Consumidor': ['Cobrança indevida', 'Negativação indevida', 'Defeito de produto ou serviço', 'Plano de saúde', 'Revisão contratual'],
  'Tributário': ['Execução fiscal', 'Restituição de tributos', 'Anulação de débito fiscal', 'Mandado de segurança tributário'],
  'Administrativo': ['Servidor público', 'Concurso público', 'Licitação', 'Responsabilidade do Estado', 'Processo administrativo disciplinar'],
  'Empresarial': ['Contrato empresarial', 'Dissolução societária', 'Recuperação judicial', 'Falência', 'Propriedade intelectual'],
  'Imobiliário': ['Despejo', 'Locação', 'Usucapião', 'Reintegração de posse', 'Regularização de imóvel'],
  'Ambiental': ['Infração ambiental', 'Licenciamento ambiental', 'Reparação de dano ambiental'],
  'Eleitoral': ['Registro de candidatura', 'Prestação de contas', 'Propaganda eleitoral'],
  'Outros': [],
};
