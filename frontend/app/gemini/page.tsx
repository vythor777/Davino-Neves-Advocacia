'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquareQuote,
  CalendarClock,
  Copy,
  Check,
  Scale,
  FileSearch,
  Upload,
  BookmarkPlus,
  Zap,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import geminiService, {
  DadosPrazoExtraido,
  MovimentoProcessoInput,
} from '@/services/geminiService';
import processoService, { Processo } from '@/services/processoService';
import prazoService from '@/services/prazoService';

// Exemplos rápidos para cada aba
const EXEMPLOS_DOCUMENTOS = [
  {
    rotulo: 'Sentença Cível (Indenizatória)',
    tipo: 'Sentença',
    texto: `Vistos etc. Trata-se de Ação Indenizatória ajuizada por CONSTRUTORA SILVA LTDA em face de FORNECEDORA DE MATERIAIS S/A, alegando atraso injustificado na entrega de insumos estruturais, culminando em paralisação de obra e lucros cessantes.
A ré contestou arguindo caso fortuito em decorrência de chuvas torrenciais no período, bem como ausência de comprovação documental do nexo causal.
É o relatório. DECIDO.
O pedido é PARCIALMENTE PROCEDENTE.
Restou incontroverso o inadimplemento da ré quanto ao cronograma firmado em contrato. As intempéries climáticas constituem fortuito interno inerente à atividade empresarial, não elidindo a responsabilidade civil objetiva da contratada.
Condeno a ré ao pagamento de R$ 120.000,00 a título de perdas e danos materiais, corrigidos pela taxa SELIC a partir da citação, além de custas e honorários advocatícios sucumbenciais fixados em 15% sobre o valor da condenação.
Publique-se. Registre-se. Intimem-se. Prazo recursal legal de 15 (quinze) dias.`,
    instrucoes: 'Identificar teses recursais de apelação para a parte ré, focando na quantificação dos honorários e comprovação do prejuízo real.',
  },
  {
    rotulo: 'Contrato de Prestação de Serviços',
    tipo: 'Contrato',
    texto: `INSTRUMENTO PARTICULAR DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS E CONSULTORIA.
CONTRATANTE: ALPHA LOGÍSTICA S.A.
CONTRATADA: BETA TECNOLOGIA E ASSESSORIA LTDA.
CLÁUSULA QUINTA - DA RESCISÃO E MULTA:
O presente contrato possui vigência de 24 meses. Em caso de rescisão imotivada por qualquer das partes antes do término do prazo, incidirá multa compensatória não compensável de 50% (cinquenta por cento) sobre a totalidade das parcelas vincendas restantes até o termo final, com vencimento em 48 horas após notificação.
CLÁUSULA OITAVA - DO FORO:
Fica eleito com exclusividade o Foro da Comarca de Manaus/AM para dirimir quaisquer dúvidas, renunciando a qualquer outro por mais privilegiado que seja, ainda que a execução dos serviços ocorra em São Paulo/SP.`,
    instrucoes: 'Analisar a abusividade da cláusula penal de 50% e a validade da cláusula de eleição de foro sob a ótica do STJ.',
  },
];

const EXEMPLOS_MOVIMENTACOES = [
  {
    rotulo: 'Ação de Cobrança com Penhora',
    titulo: 'Cobrança Bancária em Execução',
    numero: '1004567-89.2023.8.26.0100',
    movimentos: [
      {
        dataHora: '2026-08-25T14:30:00',
        nome: 'Juntada de comprovante de bloqueio de ativos SISBAJUD',
        complemento: 'Frutífero bloqueio no valor integral da dívida (R$ 45.890,20)',
      },
      {
        dataHora: '2026-08-20T10:15:00',
        nome: 'Decisão interlocutória deferindo penhora online',
      },
      {
        dataHora: '2026-07-12T16:00:00',
        nome: 'Certidão de trânsito em julgado da fase de conhecimento',
      },
      {
        dataHora: '2026-06-01T09:00:00',
        nome: 'Sentença com resolução do mérito acolhendo o pedido inicial',
      },
    ],
  },
  {
    rotulo: 'Ação Trabalhista (Fase Pericial)',
    titulo: 'Reclamatória Trabalhista - Horas Extras e Insalubridade',
    numero: '0001234-56.2024.5.02.0015',
    movimentos: [
      {
        dataHora: '2026-08-28T11:00:00',
        nome: 'Apresentação de Laudo Pericial de Engenharia/Insalubridade',
        complemento: 'Conclusão favorável à concessão do adicional de 20% (grau médio)',
      },
      {
        dataHora: '2026-08-10T15:20:00',
        nome: 'Realização de vistoria técnica in loco pelo perito judicial',
      },
      {
        dataHora: '2026-07-05T13:45:00',
        nome: 'Audiência Una realizada - Fixação de pontos controvertidos e nomeação do perito',
      },
    ],
  },
];

const EXEMPLOS_INTIMACOES = [
  {
    rotulo: 'Intimação para Réplica (CPC)',
    texto: `PODER JUDICIÁRIO - TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO
Processo Digital nº: 1023456-78.2026.8.26.0100
Classe: Procedimento Comum Cível
Autor: João da Silva
Réu: Banco Nacional S.A.
INTIMAÇÃO DE ADVOGADOS:
Fica o autor intimado, na pessoa de seus ilustres procuradores, para que no prazo legal de 15 (quinze) dias úteis manifeste-se em RÉPLICA sobre a contestação e documentos juntados às fls. 89/145, sob pena de preclusão.
São Paulo, data da disponibilização no DJE.`,
  },
  {
    rotulo: 'Despacho de Emenda à Inicial (15 dias)',
    texto: `Vistos. Determino ao autor que, no prazo improrrogável de 15 (quinze) dias, emende a petição inicial para juntar comprovante idôneo e atualizado de residência em seu nome, bem como retificar o valor atribuído à causa em estrita conformidade com o proveito econômico almejado (art. 292, II, do CPC), sob pena de indeferimento da exordial e extinção do feito sem julgamento do mérito (art. 321, parágrafo único). Int.`,
  },
  {
    rotulo: 'Publicação de Audiência de Instrução',
    texto: `Ficam as partes intimadas acerca da designação de AUDIÊNCIA DE INSTRUÇÃO E JULGAMENTO a ser realizada em 15/10/2026 às 14h00 no formato híbrido. O rol de testemunhas deverá ser apresentado no prazo preclusivo de 5 (cinco) dias anteriores à audiência, na forma do art. 357, § 4º do CPC.`,
  },
];

function GeminiContent() {
  const searchParams = useSearchParams();
  const procParam = searchParams.get('processo') || '';
  const tribunalParam = searchParams.get('tribunal') || '';

  const [abaAtiva, setAbaAtiva] = useState<'documento' | 'resumo' | 'prazo'>(() => {
    return procParam ? 'resumo' : 'documento';
  });

  // Estado da Aba 1: Análise de Documentos
  const [docTexto, setDocTexto] = useState('');
  const [docTipo, setDocTipo] = useState('Petição Inicial');
  const [docInstrucoes, setDocInstrucoes] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [docResultado, setDocResultado] = useState<string | null>(null);
  const [docErro, setDocErro] = useState<string | null>(null);

  // Estado da Aba 2: Resumo de Processo
  const [resumoTitulo, setResumoTitulo] = useState(() => {
    return procParam ? `Processo ${procParam} - ${tribunalParam || 'Tribunal'}` : '';
  });
  const [resumoNumero, setResumoNumero] = useState(() => procParam);
  const [resumoMovsTexto, setResumoMovsTexto] = useState('');
  const [resumoPublico, setResumoPublico] = useState<'cliente' | 'advogado'>('cliente');
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoResultado, setResumoResultado] = useState<string | null>(null);
  const [resumoErro, setResumoErro] = useState<string | null>(null);

  // Estado da Aba 3: Extração de Prazos
  const [prazoTexto, setPrazoTexto] = useState('');
  const [prazoDataPub, setPrazoDataPub] = useState(new Date().toISOString().slice(0, 10));
  const [prazoLoading, setPrazoLoading] = useState(false);
  const [prazoResultado, setPrazoResultado] = useState<DadosPrazoExtraido | null>(null);
  const [prazoErro, setPrazoErro] = useState<string | null>(null);

  // Estado para adicionar o prazo extraído ao sistema
  const [modalPrazoAberto, setModalPrazoAberto] = useState(false);
  const [processosDisponiveis, setProcessosDisponiveis] = useState<Processo[]>([]);
  const [processoSelecionadoId, setProcessoSelecionadoId] = useState<number | ''>('');
  const [descricaoPrazoModal, setDescricaoPrazoModal] = useState('');
  const [dataVencimentoModal, setDataVencimentoModal] = useState('');
  const [salvandoPrazo, setSalvandoPrazo] = useState(false);
  const [sucessoPrazo, setSucessoPrazo] = useState<string | null>(null);

  // Estado de cópia
  const [copiado, setCopiado] = useState(false);

  // Handler de cópia genérico
  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Upload de arquivo de texto para análise
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      setDocTexto(conteudo);
    };
    reader.readAsText(file);
  };

  // 1. Executar Análise de Documento
  const handleAnalisarDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTexto.trim()) {
      setDocErro('Por favor, informe ou cole o texto do documento a ser analisado.');
      return;
    }

    setDocLoading(true);
    setDocErro(null);
    setDocResultado(null);

    try {
      const res = await geminiService.analisarDocumento({
        texto: docTexto,
        tipo_documento: docTipo,
        instrucoes: docInstrucoes || undefined,
      });
      setDocResultado(res.analise);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha ao processar análise do documento via IA.';
      setDocErro(mensagem);
    } finally {
      setDocLoading(false);
    }
  };

  // 2. Executar Resumo de Processo
  const handleResumirProcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumoMovsTexto.trim()) {
      setResumoErro('Por favor, cole as movimentações ou histórico do processo.');
      return;
    }

    setResumoLoading(true);
    setResumoErro(null);
    setResumoResultado(null);

    try {
      let movsArray: Array<string | MovimentoProcessoInput> = [];
      try {
        const parsed = JSON.parse(resumoMovsTexto);
        movsArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        movsArray = resumoMovsTexto
          .split('\n')
          .filter((l) => l.trim().length > 0)
          .map((linha) => ({ descricao: linha.trim() }));
      }

      const res = await geminiService.resumirProcesso({
        titulo: resumoTitulo || undefined,
        numero_processo: resumoNumero || undefined,
        movimentacoes: movsArray,
        publico_alvo: resumoPublico,
      });
      setResumoResultado(res.resumo);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha ao gerar resumo processual.';
      setResumoErro(mensagem);
    } finally {
      setResumoLoading(false);
    }
  };

  // 3. Executar Extração de Prazos
  const handleExtrairPrazos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prazoTexto.trim()) {
      setPrazoErro('Por favor, informe o texto da publicação ou intimação.');
      return;
    }

    setPrazoLoading(true);
    setPrazoErro(null);
    setPrazoResultado(null);
    setSucessoPrazo(null);

    try {
      const res = await geminiService.extrairPrazos({
        texto_publicacao: prazoTexto,
        data_publicacao: prazoDataPub || undefined,
      });
      setPrazoResultado(res.dados_prazo);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha ao extrair prazos via IA.';
      setPrazoErro(mensagem);
    } finally {
      setPrazoLoading(false);
    }
  };

  // Abrir modal de criação de prazo a partir do resultado da IA
  const abrirModalSalvarPrazo = async () => {
    if (!prazoResultado) return;
    try {
      const procs = await processoService.getAll();
      setProcessosDisponiveis(procs);
      if (procs.length > 0) {
        setProcessoSelecionadoId(procs[0].id_processo);
      }
    } catch {
      // Ignorar falha de busca
    }

    setDescricaoPrazoModal(prazoResultado.descricao_providencia || 'Providência Processual');
    setDataVencimentoModal(prazoResultado.data_limite_estimada || new Date().toISOString().slice(0, 10));
    setModalPrazoAberto(true);
  };

  const handleSalvarPrazoModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processoSelecionadoId) {
      alert('Selecione um processo do escritório para vincular o prazo.');
      return;
    }

    setSalvandoPrazo(true);
    try {
      await prazoService.create({
        descricao: descricaoPrazoModal.trim(),
        data_vencimento: dataVencimentoModal,
        status: 'Pendente',
        id_processo: Number(processoSelecionadoId),
      });

      setSucessoPrazo('Prazo agendado e registrado com sucesso no Módulo de Prazos!');
      setModalPrazoAberto(false);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha na requisição';
      alert(`Erro ao cadastrar prazo: ${mensagem}`);
    } finally {
      setSalvandoPrazo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Superior da IA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-900 border border-purple-200 dark:bg-purple-950/60 dark:border-purple-900 dark:text-purple-300">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              Google Gemini 3.7 Flash • Inteligência Artificial Jurídica
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Assistente de IA & Controladoria Jurídica
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Análise aprofundada de peças, simplificação de andamentos para clientes e detecção automatizada de termos fatais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/prazos"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <CalendarClock className="h-4 w-4" />
              Agenda de Prazos
            </Link>
          </div>
        </div>

        {/* Abas de Ferramentas */}
        <div className="mt-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
            <button
              onClick={() => setAbaAtiva('documento')}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                abaAtiva === 'documento'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <FileSearch className="h-4 w-4" />
              <span>Análise de Peças & Contratos</span>
            </button>

            <button
              onClick={() => setAbaAtiva('resumo')}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                abaAtiva === 'resumo'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquareQuote className="h-4 w-4" />
              <span>Resumo Executivo para Cliente</span>
            </button>

            <button
              onClick={() => setAbaAtiva('prazo')}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold transition ${
                abaAtiva === 'prazo'
                  ? 'bg-amber-900 text-white shadow-xs dark:bg-amber-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Extração Automática de Prazos (DJE)</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ABA 1: ANÁLISE DE DOCUMENTOS & PEÇAS */}
        {/* ========================================================================= */}
        {abaAtiva === 'documento' && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Coluna da Esquerda: Formulário de Entrada */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      <FileSearch className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                        Dados da Peça Processual / Contrato
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cole o teor integral do documento ou faça upload.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload .txt</span>
                    <input
                      type="file"
                      accept=".txt,.md,.text"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <form onSubmit={handleAnalisarDocumento} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="docTipoSelect"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Tipo de Documento
                    </label>
                    <select
                      id="docTipoSelect"
                      value={docTipo}
                      onChange={(e) => setDocTipo(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="Petição Inicial">Petição Inicial</option>
                      <option value="Contestação">Contestação</option>
                      <option value="Sentença">Sentença / Decisão Monocrática</option>
                      <option value="Acórdão">Acórdão / Recurso</option>
                      <option value="Contrato">Contrato / Instrumento Particular</option>
                      <option value="Notificação Extrajudicial">Notificação Extrajudicial</option>
                      <option value="Parecer Jurídico">Parecer Jurídico</option>
                    </select>
                  </div>

                  {/* Exemplos Rápidos */}
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Modelos de exemplo:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {EXEMPLOS_DOCUMENTOS.map((ex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setDocTipo(ex.tipo);
                            setDocTexto(ex.texto);
                            setDocInstrucoes(ex.instrucoes);
                            setDocErro(null);
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-amber-600 hover:bg-amber-50 hover:text-amber-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500"
                        >
                          {ex.rotulo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="docTextoArea"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Teor do Documento *
                    </label>
                    <textarea
                      id="docTextoArea"
                      rows={10}
                      required
                      value={docTexto}
                      onChange={(e) => setDocTexto(e.target.value)}
                      placeholder="Cole aqui o texto da sentença, contestação, contrato ou petição inicial..."
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 font-mono text-xs leading-relaxed text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="docInstrucoesInput"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Instruções Estratégicas do Advogado (Opcional)
                    </label>
                    <input
                      id="docInstrucoesInput"
                      type="text"
                      value={docInstrucoes}
                      onChange={(e) => setDocInstrucoes(e.target.value)}
                      placeholder="Ex: Focar em teses de nulidade de citação, prescrição quinquenal..."
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {docErro && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {docErro}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocTexto('');
                        setDocInstrucoes('');
                        setDocResultado(null);
                        setDocErro(null);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={docLoading || !docTexto.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
                    >
                      {docLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Analisando com Gemini...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Gerar Análise Jurídica</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Coluna da Direita: Relatório de Análise */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[480px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                      Parecer & Matriz de Risco Estratégica
                    </h3>
                  </div>

                  {docResultado && (
                    <button
                      onClick={() => handleCopiar(docResultado)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiado ? 'Copiado!' : 'Copiar Análise'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 flex-1 flex flex-col justify-center">
                  {docLoading ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent dark:border-amber-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        O Gemini 3.7 está avaliando o teor da peça, identificando riscos e teses cabíveis...
                      </p>
                      <p className="text-[11px] text-slate-400">Tempo estimado: 3 a 7 segundos.</p>
                    </div>
                  ) : docResultado ? (
                    <div className="rounded-xl bg-slate-50/80 p-5 font-sans text-xs leading-relaxed text-slate-800 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {docResultado}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      <FileSearch className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                      Preencha o formulário à esquerda e clique em &quot;Gerar Análise Jurídica&quot; para visualizar o parecer e teses recomendadas.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 2: RESUMO EXECUTIVO PARA CLIENTE */}
        {/* ========================================================================= */}
        {abaAtiva === 'resumo' && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      <MessageSquareQuote className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                        Histórico de Movimentações
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Converta termos técnicos em comunicados claros para o cliente.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleResumirProcesso} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="resumoNumeroInput"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Número do Processo (CNJ)
                      </label>
                      <input
                        id="resumoNumeroInput"
                        type="text"
                        value={resumoNumero}
                        onChange={(e) => setResumoNumero(e.target.value)}
                        placeholder="0000000-00.0000.0.00.0000"
                        className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 font-mono text-xs text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="resumoPublicoSelect"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                      >
                        Público-Alvo / Tom de Voz
                      </label>
                      <select
                        id="resumoPublicoSelect"
                        value={resumoPublico}
                        onChange={(e) => setResumoPublico(e.target.value as 'cliente' | 'advogado')}
                        className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="cliente">Cliente (Linguagem Acessível / WhatsApp)</option>
                        <option value="advogado">Advogado (Técnico e Estratégico)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="resumoTituloInput"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Título ou Identificação da Causa
                    </label>
                    <input
                      id="resumoTituloInput"
                      type="text"
                      value={resumoTitulo}
                      onChange={(e) => setResumoTitulo(e.target.value)}
                      placeholder="Ex: Ação Indenizatória por Vício em Imóvel"
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Exemplos de Movimentações */}
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Exemplos prontos:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {EXEMPLOS_MOVIMENTACOES.map((ex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setResumoTitulo(ex.titulo);
                            setResumoNumero(ex.numero);
                            setResumoMovsTexto(JSON.stringify(ex.movimentos, null, 2));
                            setResumoErro(null);
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-amber-600 hover:bg-amber-50 hover:text-amber-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {ex.rotulo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="resumoMovsArea"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Movimentações ou Andamentos Processuais *
                    </label>
                    <textarea
                      id="resumoMovsArea"
                      rows={8}
                      required
                      value={resumoMovsTexto}
                      onChange={(e) => setResumoMovsTexto(e.target.value)}
                      placeholder="Cole aqui a lista de andamentos do tribunal, linha por linha ou em formato JSON..."
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {resumoErro && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {resumoErro}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={resumoLoading || !resumoMovsTexto.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
                    >
                      {resumoLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Gerando Resumo...</span>
                        </>
                      ) : (
                        <>
                          <MessageSquareQuote className="h-3.5 w-3.5" />
                          <span>Simplificar Andamentos</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[480px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                      Relatório Formatado para Envio
                    </h3>
                  </div>

                  {resumoResultado && (
                    <button
                      onClick={() => handleCopiar(resumoResultado)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {copiado ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-4 flex-1 flex flex-col justify-center">
                  {resumoLoading ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent dark:border-amber-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Traduzindo termos processuais para linguagem simplificada...
                      </p>
                    </div>
                  ) : resumoResultado ? (
                    <div className="rounded-xl bg-slate-50/80 p-5 font-sans text-xs leading-relaxed text-slate-800 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {resumoResultado}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      <MessageSquareQuote className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                      Insira o histórico de movimentações ao lado para gerar um resumo claro e amigável pronto para enviar ao cliente via WhatsApp ou e-mail.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA 3: EXTRAÇÃO AUTOMÁTICA DE PRAZOS (DJE) */}
        {/* ========================================================================= */}
        {abaAtiva === 'prazo' && (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                        Intimação / Publicação do DJE
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cole o recorte da publicação para calcular providência e termo fatal.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleExtrairPrazos} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="prazoDataPubInput"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Data da Publicação / Disponibilização no Diário
                    </label>
                    <input
                      id="prazoDataPubInput"
                      type="date"
                      value={prazoDataPub}
                      onChange={(e) => setPrazoDataPub(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-xs text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Exemplos de Intimações */}
                  <div>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Exemplos de publicações:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {EXEMPLOS_INTIMACOES.map((ex, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setPrazoTexto(ex.texto);
                            setPrazoErro(null);
                          }}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-amber-600 hover:bg-amber-50 hover:text-amber-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {ex.rotulo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="prazoTextoArea"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Texto Completo da Publicação / Despacho *
                    </label>
                    <textarea
                      id="prazoTextoArea"
                      rows={8}
                      required
                      value={prazoTexto}
                      onChange={(e) => setPrazoTexto(e.target.value)}
                      placeholder="Cole aqui o texto da publicação do Diário da Justiça Eletrônico..."
                      className="mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-900 focus:border-amber-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {prazoErro && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                      {prazoErro}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={prazoLoading || !prazoTexto.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
                    >
                      {prazoLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Identificando Prazos...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5 text-amber-300" />
                          <span>Calcular Prazos e Providências</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Coluna da Direita: Card Estruturado do Prazo Extraído */}
            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 min-h-[480px] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-slate-100">
                      Resultado Estruturado de Controladoria
                    </h3>
                  </div>

                  {prazoResultado && (
                    <button
                      onClick={abrirModalSalvarPrazo}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 dark:bg-amber-800"
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      <span>Agendar na Pauta</span>
                    </button>
                  )}
                </div>

                {sucessoPrazo && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <div className="flex items-center gap-2 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{sucessoPrazo}</span>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex-1 flex flex-col justify-center">
                  {prazoLoading ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent dark:border-amber-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        O Gemini está computando os dias úteis/corridos e providência exigida...
                      </p>
                    </div>
                  ) : prazoResultado ? (
                    <div className="space-y-4">
                      {/* Urgência e Tem Prazo */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">Status do Prazo</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {prazoResultado.tem_prazo ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" /> Há Prazo Peremptório / Processual
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                                Sem prazo fatal identificado
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">Urgência</span>
                          <div className="mt-0.5">
                            <span
                              className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                                prazoResultado.urgencia === 'Fatal' || prazoResultado.urgencia === 'Alta'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : prazoResultado.urgencia === 'Média'
                                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              Urgência: {prazoResultado.urgencia}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Providência */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Providência Exigida
                        </span>
                        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
                          {prazoResultado.descricao_providencia}
                        </p>
                      </div>

                      {/* Grid de Dias e Data Estimada */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Contagem Legal
                          </span>
                          <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {prazoResultado.quantidade_dias ? `${prazoResultado.quantidade_dias} dias` : 'Não especificado'}
                            {prazoResultado.tipo_contagem ? ` (${prazoResultado.tipo_contagem})` : ''}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Termo Fatal Sugerido
                          </span>
                          <p className="mt-1 font-mono text-sm font-bold text-amber-900 dark:text-amber-400">
                            {prazoResultado.data_limite_estimada
                              ? new Date(prazoResultado.data_limite_estimada).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                              : 'A calcular'}
                          </p>
                        </div>
                      </div>

                      {/* Observações */}
                      {prazoResultado.observacoes && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Observações e Recomendações
                          </span>
                          <p className="mt-1 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {prazoResultado.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400">
                      <CalendarClock className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600 mb-2" />
                      Cole o texto da publicação ao lado para que a IA identifique automaticamente a providência, contagem em dias e data limite.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal para Salvar Prazo Extraído */}
      {modalPrazoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Agendar Prazo na Pauta do Escritório
                </h3>
              </div>
              <button
                onClick={() => setModalPrazoAberto(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPrazoModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Processo Vinculado *
                </label>
                {processosDisponiveis.length > 0 ? (
                  <select
                    required
                    value={processoSelecionadoId}
                    onChange={(e) => setProcessoSelecionadoId(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {processosDisponiveis.map((p) => (
                      <option key={p.id_processo} value={p.id_processo}>
                        {p.numero_processo} - {p.titulo} ({p.cliente?.nome || 'Cliente'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
                    Nenhum processo cadastrado no momento. Cadastre um processo primeiro no módulo de Processos.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Descrição da Providência *
                </label>
                <input
                  type="text"
                  required
                  value={descricaoPrazoModal}
                  onChange={(e) => setDescricaoPrazoModal(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Data de Vencimento / Termo Fatal *
                </label>
                <input
                  type="date"
                  required
                  value={dataVencimentoModal}
                  onChange={(e) => setDataVencimentoModal(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalPrazoAberto(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoPrazo || processosDisponiveis.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
                >
                  {salvandoPrazo ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeminiPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center dark:bg-slate-950">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-800 border-t-transparent dark:border-amber-400" />
          </div>
        }
      >
        <GeminiContent />
      </Suspense>
    </AuthGuard>
  );
}
