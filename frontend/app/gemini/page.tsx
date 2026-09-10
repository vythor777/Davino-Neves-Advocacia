'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { NumberProcessInput } from '@/components/NumberProcessInput';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Sparkles,
  FileSearch,
  BookOpen,
  PenTool,
  CalendarClock,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Shield,
  BookmarkPlus,
  Clock,
  AlertTriangle,
  Lightbulb,
  Gavel,
} from 'lucide-react';
import geminiService, {
  DadosPrazoExtraido,
} from '@/services/geminiService';
import processoService, { Processo } from '@/services/processoService';
import prazoService from '@/services/prazoService';

type AcaoIA =
  | 'analisar_processo'
  | 'resumir_documento'
  | 'encontrar_jurisprudencia'
  | 'criar_peca'
  | 'identificar_prazos';

interface AcaoConfig {
  id: AcaoIA;
  titulo: string;
  tagline: string;
  descricao: string;
  icone: React.ElementType;
  cor: string;
  badge: string;
}

const ACOES_IA: AcaoConfig[] = [
  {
    id: 'analisar_processo',
    titulo: 'Analisar processo',
    tagline: 'Autos, riscos e probabilidade de êxito',
    descricao: 'Identifique teses adversas, pontos vulneráveis, riscos processuais e estratégia de defesa/ataque.',
    icone: FileSearch,
    cor: 'text-[#0047ab] dark:text-[#c5a059]',
    badge: 'Estratégico',
  },
  {
    id: 'resumir_documento',
    titulo: 'Resumir documento',
    tagline: 'Sentenças, contratos e decisões',
    descricao: 'Gere síntese executiva ou resumo em linguagem simples (Visual Law) pronto para envio ao cliente.',
    icone: BookOpen,
    cor: 'text-emerald-600 dark:text-emerald-400',
    badge: 'Produtividade',
  },
  {
    id: 'encontrar_jurisprudencia',
    titulo: 'Encontrar jurisprudência',
    tagline: 'Teses, súmulas e precedentes STJ/STF',
    descricao: 'Mapeie a tendência atual dos tribunais, súmulas vinculantes, temas repetitivos e argumentos sólidos.',
    icone: Gavel,
    cor: 'text-indigo-600 dark:text-indigo-400',
    badge: 'Pesquisa',
  },
  {
    id: 'criar_peca',
    titulo: 'Criar peça',
    tagline: 'Petições, contestações e recursos',
    descricao: 'Elabore minutas jurídicas completas com fundamentação legal, jurisprudência e rol de pedidos estruturado.',
    icone: PenTool,
    cor: 'text-amber-600 dark:text-amber-400',
    badge: 'Redação',
  },
  {
    id: 'identificar_prazos',
    titulo: 'Identificar prazos',
    tagline: 'Intimações, DJE e termos fatais',
    descricao: 'Extraia datas, providências exigidas, contagem em dias úteis e agende com 1 clique no calendário.',
    icone: CalendarClock,
    cor: 'text-rose-600 dark:text-rose-400',
    badge: 'Controladoria',
  },
];

function GeminiContent() {
  const searchParams = useSearchParams();
  const acaoParam = (searchParams.get('acao') as AcaoIA) || (searchParams.get('tab') as AcaoIA);
  const procParam = searchParams.get('processo') || '';

  const [acaoAtiva, setAcaoAtiva] = useState<AcaoIA>(() => {
    if (acaoParam && ACOES_IA.some((a) => a.id === acaoParam)) {
      return acaoParam;
    }
    return 'analisar_processo';
  });

  // Atualizar ação ativa se parâmetro mudar na URL
  useEffect(() => {
    if (acaoParam && ACOES_IA.some((a) => a.id === acaoParam)) {
      setAcaoAtiva(acaoParam);
    }
  }, [acaoParam]);

  // Lista de processos do escritório para preenchimento rápido
  const [processosEscritorio, setProcessosEscritorio] = useState<Processo[]>([]);

  useEffect(() => {
    const fetchProcessos = async () => {
      try {
        const dados = await processoService.getAll();
        setProcessosEscritorio(dados);
      } catch {
        // silenciar
      }
    };
    fetchProcessos();
  }, []);

  // 1. Estados: Analisar Processo
  const [procNumero, setProcNumero] = useState(procParam);
  const [procTitulo, setProcTitulo] = useState('');
  const [procPolo, setProcPolo] = useState<'Autor' | 'Réu' | 'Terceiro Interessado'>('Autor');
  const [procConteudo, setProcConteudo] = useState('');
  const [procFoco, setProcFoco] = useState('');
  const [procLoading, setProcLoading] = useState(false);
  const [procResultado, setProcResultado] = useState<string | null>(null);

  // 2. Estados: Resumir Documento
  const [docTexto, setDocTexto] = useState('');
  const [docTipo, setDocTipo] = useState('Sentença / Decisão');
  const [docFormato, setDocFormato] = useState<'executivo' | 'cliente_simples' | 'topicos_estrategicos'>('executivo');
  const [docLoading, setDocLoading] = useState(false);
  const [docResultado, setDocResultado] = useState<string | null>(null);

  // 3. Estados: Encontrar Jurisprudência
  const [jurisTema, setJurisTema] = useState('');
  const [jurisRamo, setJurisRamo] = useState('Direito Civil / Processual');
  const [jurisTribunal, setJurisTribunal] = useState('STJ & Tribunais Estaduais');
  const [jurisTese, setJurisTese] = useState('');
  const [jurisLoading, setJurisLoading] = useState(false);
  const [jurisResultado, setJurisResultado] = useState<string | null>(null);

  // 4. Estados: Criar Peça
  const [pecaTipo, setPecaTipo] = useState('Petição Inicial');
  const [pecaTribunal, setPecaTribunal] = useState('Vara Cível da Comarca de São Paulo/SP');
  const [pecaPartes, setPecaPartes] = useState('Autor (Cliente) x Réu (Instituição Financeira)');
  const [pecaFatos, setPecaFatos] = useState('');
  const [pecaPedidos, setPecaPedidos] = useState('');
  const [pecaJurisReferencia, setPecaJurisReferencia] = useState('');
  const [pecaLoading, setPecaLoading] = useState(false);
  const [pecaResultado, setPecaResultado] = useState<string | null>(null);

  // 5. Estados: Identificar Prazos
  const [prazoTexto, setPrazoTexto] = useState('');
  const [prazoDataPub, setPrazoDataPub] = useState(new Date().toISOString().slice(0, 10));
  const [prazoLoading, setPrazoLoading] = useState(false);
  const [prazoResultado, setPrazoResultado] = useState<DadosPrazoExtraido | null>(null);

  // Modal para agendar prazo extraído
  const [modalPrazoAberto, setModalPrazoAberto] = useState(false);
  const [processoSelecionadoId, setProcessoSelecionadoId] = useState<number | ''>('');
  const [descricaoPrazoModal, setDescricaoPrazoModal] = useState('');
  const [dataVencimentoModal, setDataVencimentoModal] = useState('');
  const [salvandoPrazo, setSalvandoPrazo] = useState(false);

  // Estado de cópia
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    toast.success('Conteúdo copiado para a área de transferência');
    setTimeout(() => setCopiado(false), 2500);
  };

  // Upload genérico de arquivo .txt/.md
  const handleUploadTexto = (e: React.ChangeEvent<HTMLInputElement>, setField: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      setField(conteudo);
      toast.success(`Arquivo ${file.name} carregado com sucesso.`);
    };
    reader.readAsText(file);
  };

  // -------------------------------------------------------------
  // PRESETS E EXEMPLOS RÁPIDOS
  // -------------------------------------------------------------
  const carregarExemplo = (tipo: AcaoIA) => {
    if (tipo === 'analisar_processo') {
      setProcNumero('1002345-89.2024.8.26.0100');
      setProcTitulo('Ação de Cobrança c/c Indenização');
      setProcPolo('Autor');
      setProcFoco('Identificar se houve prescrição da pretensão de cobrança e suficiência probatória dos e-mails');
      setProcConteudo(`AUTOR: Construtora Alvorada Ltda.
RÉU: Incorporadora Horizonte S/A
VALOR DA CAUSA: R$ 450.000,00

SÍNTESE DOS AUTOS:
A autora alega inadimplemento referente à última medição da obra do Edifício Jardins, concluída em outubro de 2021.
Juntou medições assinadas por engenheiro preposto, notificações extrajudiciais por e-mail e trocas de mensagens no WhatsApp.
O réu apresentou contestação alegando preliminarmente a prescrição trienal (art. 206, § 3º, IV do CC) e, no mérito, vícios aparentes na pintura da fachada não sanados, requerendo abatimento do preço e exceção do contrato não cumprido (art. 476 do CC).
Não houve perícia técnica realizada durante a entrega.`);
      toast.info('Exemplo de processo carregado!');
    } else if (tipo === 'resumir_documento') {
      setDocTipo('Sentença de Mérito');
      setDocFormato('cliente_simples');
      setDocTexto(`DISPOSITIVO DA SENTENÇA:
Vistos etc.
Ante o exposto e considerando tudo o mais que dos autos consta, JULGO PARCIALMENTE PROCEDENTES os pedidos formulados por MARCOS DA SILVA em face de BANCO CRÉDITO RÁPIDO S/A, com resolução de mérito, nos termos do art. 487, I, do Código de Processo Civil, para:
a) Declarar a inexigibilidade do débito inscrito no valor de R$ 3.450,00, determinando a exclusão definitiva do nome do autor dos cadastros de inadimplentes (SPC/SERASA);
b) Condenar a instituição financeira requerida ao pagamento de indenização por danos morais in re ipsa, no importe de R$ 8.000,00 (oito mil reais), acrescido de correção monetária pela Tabela Prática do TJSP a partir desta data (Súmula 362/STJ) e juros moratórios de 1% ao mês desde a citação;
c) Em razão da sucumbência recíproca, condeno ambas as partes ao pagamento de 50% das custas processuais, fixando honorários advocatícios em 10% sobre o valor da condenação.`);
      toast.info('Exemplo de sentença carregado!');
    } else if (tipo === 'encontrar_jurisprudencia') {
      setJurisTema('Validade de cláusula de tolerância de 180 dias em contrato de compra e venda de imóvel na planta');
      setJurisRamo('Direito Imobiliário e Consumidor');
      setJurisTribunal('STJ (Tema 996) e TJSP (Súmula 164)');
      setJurisTese('Atraso superior aos 180 dias gera dever de indenizar lucros cessantes presumidos e devolução integral');
      toast.info('Exemplo de pesquisa jurisprudencial carregado!');
    } else if (tipo === 'criar_peca') {
      setPecaTipo('Petição Inicial');
      setPecaTribunal('Vara do Juizado Especial Cível da Comarca da Capital/SP');
      setPecaPartes('Juliana Mendes (Consumidora) x Linhas Aéreas VoeBem S/A');
      setPecaFatos(`A autora adquiriu passagem aérea para viagem de férias com destino a Paris, com conexão em Lisboa.
No voo de ida, a companhia aérea atrasou a primeira perna em 6 horas sem fornecer alimentação, água ou vouchers, ocasionando a perda da conexão e atraso final de 28 horas na chegada ao destino.
A mala despachada foi extraviada e somente entregue 4 dias depois, obrigando a autora a comprar roupas e itens de primeira necessidade.`);
      setPecaPedidos('Condenação em danos materiais no valor de R$ 2.300,00 (comprovados por notas fiscais) e danos morais no valor de R$ 15.000,00.');
      setPecaJurisReferencia('Tema 210 do STF / Convenção de Montreal vs. Código de Defesa do Consumidor.');
      toast.info('Exemplo de caso para elaboração de peça carregado!');
    } else if (tipo === 'identificar_prazos') {
      setPrazoDataPub(new Date().toISOString().slice(0, 10));
      setPrazoTexto(`PODER JUDICIÁRIO - TRIBUNAL DE JUSTIÇA DO ESTADO DE SÃO PAULO
FORO CENTRAL CÍVEL - 12ª VARA CÍVEL
Processo nº 1012398-44.2024.8.26.0100
Intimação de Advogados - Publicação no DJE
Disponibilização: 10/09/2026. Publicação: 11/09/2026.
Fica a parte autora intimada para, no prazo impreterível de 15 (quinze) dias úteis, manifestar-se em RÉPLICA sobre a contestação e documentos de fls. 89/140, bem como especificar detalhadamente as provas que pretende produzir, justificando a pertinência de cada uma sob pena de indeferimento.`);
      toast.info('Exemplo de publicação do DJE carregado!');
    }
  };

  // -------------------------------------------------------------
  // HANDLERS DE EXECUÇÃO
  // -------------------------------------------------------------

  // 1. Analisar Processo
  const handleExecutarAnalisarProcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!procConteudo.trim()) {
      toast.warning('Informe o conteúdo ou síntese dos autos para análise.');
      return;
    }
    setProcLoading(true);
    setProcResultado(null);
    try {
      const res = await geminiService.analisarProcesso({
        numero_processo: procNumero || undefined,
        titulo: procTitulo || undefined,
        conteudo_processual: procConteudo,
        polo_cliente: procPolo,
        foco_estrategico: procFoco || undefined,
      });
      setProcResultado(res.analise);
      toast.success('Análise do processo concluída!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar análise com IA.';
      toast.error('Erro na análise', { description: msg });
    } finally {
      setProcLoading(false);
    }
  };

  // 2. Resumir Documento
  const handleExecutarResumirDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTexto.trim()) {
      toast.warning('Cole o texto do documento a ser resumido.');
      return;
    }
    setDocLoading(true);
    setDocResultado(null);
    try {
      const res = await geminiService.resumirDocumento({
        texto: docTexto,
        tipo_documento: docTipo,
        formato_resumo: docFormato,
      });
      setDocResultado(res.resumo);
      toast.success('Resumo gerado com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao gerar resumo com IA.';
      toast.error('Erro no resumo', { description: msg });
    } finally {
      setDocLoading(false);
    }
  };

  // 3. Encontrar Jurisprudência
  const handleExecutarEncontrarJurisprudencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jurisTema.trim()) {
      toast.warning('Informe o tema ou controvérsia para pesquisa.');
      return;
    }
    setJurisLoading(true);
    setJurisResultado(null);
    try {
      const res = await geminiService.encontrarJurisprudencia({
        tema: jurisTema,
        ramo_direito: jurisRamo || undefined,
        tribunal_alvo: jurisTribunal || undefined,
        tese_pretendida: jurisTese || undefined,
      });
      setJurisResultado(res.resultado);
      toast.success('Pesquisa jurisprudencial concluída!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao pesquisar jurisprudência.';
      toast.error('Erro na pesquisa', { description: msg });
    } finally {
      setJurisLoading(false);
    }
  };

  // 4. Criar Peça
  const handleExecutarCriarPeca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pecaFatos.trim()) {
      toast.warning('Informe os fatos e o contexto do caso para redigir a peça.');
      return;
    }
    setPecaLoading(true);
    setPecaResultado(null);
    try {
      const res = await geminiService.criarPeca({
        tipo_peca: pecaTipo,
        tribunal_foro: pecaTribunal || undefined,
        polos_partes: pecaPartes || undefined,
        fatos_contexto: pecaFatos,
        pedidos_especificos: pecaPedidos || undefined,
        jurisprudencia_referencia: pecaJurisReferencia || undefined,
      });
      setPecaResultado(res.minuta);
      toast.success('Minuta jurídica redigida com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao redigir minuta com IA.';
      toast.error('Erro na redação', { description: msg });
    } finally {
      setPecaLoading(false);
    }
  };

  // 5. Identificar Prazos
  const handleExecutarIdentificarPrazos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prazoTexto.trim()) {
      toast.warning('Cole o texto da publicação ou intimação.');
      return;
    }
    setPrazoLoading(true);
    setPrazoResultado(null);
    try {
      const res = await geminiService.identificarPrazos({
        texto_publicacao: prazoTexto,
        data_publicacao: prazoDataPub || undefined,
      });
      setPrazoResultado(res.dados_prazo);
      toast.success('Prazos e providências identificados com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao identificar prazos.';
      toast.error('Erro nos prazos', { description: msg });
    } finally {
      setPrazoLoading(false);
    }
  };

  // Modal para vincular e agendar prazo extraído
  const abrirModalSalvarPrazo = () => {
    if (!prazoResultado) return;
    if (processosEscritorio.length > 0 && !processoSelecionadoId) {
      setProcessoSelecionadoId(processosEscritorio[0].id_processo);
    }
    setDescricaoPrazoModal(prazoResultado.descricao_providencia || 'Cumprimento de Prazo Processual');
    setDataVencimentoModal(prazoResultado.data_limite_estimada || new Date().toISOString().slice(0, 10));
    setModalPrazoAberto(true);
  };

  const handleSalvarPrazoModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processoSelecionadoId) {
      toast.warning('Selecione um processo do escritório para vincular o prazo.');
      return;
    }
    setSalvandoPrazo(true);
    try {
      await prazoService.create({
        descricao: descricaoPrazoModal.trim(),
        data_vencimento: dataVencimentoModal,
        hora: '18:00',
        tipoCompromisso: 'Prazo Fatal',
        status: 'Pendente',
        id_processo: Number(processoSelecionadoId),
      });
      setModalPrazoAberto(false);
      toast.success('Prazo agendado com sucesso!', {
        description: `Registrado no calendário para ${new Date(dataVencimentoModal + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao agendar prazo.';
      toast.error('Erro ao agendar', { description: msg });
    } finally {
      setSalvandoPrazo(false);
    }
  };

  // Processo selecionador de preenchimento rápido
  const handleSelecionarProcessoExistente = (procIdStr: string) => {
    if (!procIdStr) return;
    const proc = processosEscritorio.find((p) => p.id_processo === Number(procIdStr));
    if (proc) {
      setProcNumero(proc.numero_processo || '');
      setProcTitulo(proc.titulo || '');
      setProcPolo('Autor');
      setProcConteudo(`Processo: ${proc.numero_processo}
Título: ${proc.titulo}
Cliente: ${proc.cliente?.nome || 'N/A'}
Status Atual: ${proc.status || 'Em andamento'}
Descrição / Histórico: ${proc.descricao || 'Sem descrição prévia'}`);
      toast.info(`Dados do processo ${proc.numero_processo} carregados!`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumbs items={[{ label: 'Assistente Jurídico IA', icon: Sparkles }]} />

      {/* ========================================================================= */}
      {/* HERO PROTAGONISTA: ASSISTENTE JURÍDICO IA */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#161b22] text-white border border-[#c5a059]/30 p-6 sm:p-8 shadow-md">
        {/* Elemento gráfico de fundo */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-[#c5a059]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-[#c5a059]/40 text-[#dfcaa0] text-xs font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
              <span>Inteligência Artificial Nativa • Davino Neves Advocacia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Assistente Jurídico IA
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Analise processos, documentos e decisões em segundos. Aumente a precisão das suas teses, economize horas de redação e antecipe riscos processuais com IA jurídica de alta fidelidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => carregarExemplo(acaoAtiva)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-[#dfcaa0] border border-[#c5a059]/40 px-4 py-2.5 text-xs font-medium transition cursor-pointer"
            >
              <Lightbulb className="h-4 w-4 text-[#c5a059]" />
              <span>Carregar caso de exemplo</span>
            </button>
            <Link
              href="/prazos"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white border border-white/[0.1] px-4 py-2.5 text-xs font-medium transition"
            >
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Ver agenda do escritório</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* “O QUE VOCÊ QUER FAZER?” - 5 AÇÕES CENTRAIS */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>O que você quer fazer?</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Selecione uma especialidade abaixo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ACOES_IA.map((acao) => {
            const Icon = acao.icone;
            const isAtiva = acaoAtiva === acao.id;

            return (
              <button
                key={acao.id}
                type="button"
                id={`btn-acao-${acao.id}`}
                onClick={() => setAcaoAtiva(acao.id)}
                className={`group relative flex flex-col justify-between text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isAtiva
                    ? 'bg-white dark:bg-slate-900 border-[#0047ab] dark:border-[#c5a059] shadow-sm ring-1 ring-[#0047ab]/20 dark:ring-[#c5a059]/20'
                    : 'bg-white dark:bg-[#161b22] border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isAtiva
                          ? 'bg-[#0047ab]/10 text-[#0047ab] dark:bg-[#c5a059]/15 dark:text-[#c5a059]'
                          : 'bg-slate-100 text-slate-600 dark:bg-white/[0.05] dark:text-slate-400'
                      }`}
                    >
                      <Icon className="h-5 w-5 stroke-[1.5]" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        isAtiva
                          ? 'bg-[#0047ab]/10 text-[#0047ab] dark:bg-[#c5a059]/20 dark:text-[#dfcaa0]'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-400'
                      }`}
                    >
                      {acao.badge}
                    </span>
                  </div>

                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
                    {acao.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {acao.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px]">
                  <span
                    className={`font-medium ${
                      isAtiva
                        ? 'text-[#0047ab] dark:text-[#c5a059]'
                        : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {isAtiva ? 'Ação ativa' : 'Executar'}
                  </span>
                  <ArrowRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isAtiva
                        ? 'translate-x-0.5 text-[#0047ab] dark:text-[#c5a059]'
                        : 'text-slate-400 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAINEL DE EXECUÇÃO INTERATIVO (SPLIT VIEW: ENTRADA / RESULTADO) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* FORMULÁRIO DE ENTRADA (COLUNA ESQUERDA - 6 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="legal-card p-6">
            {/* 1. AÇÃO: ANALISAR PROCESSO */}
            {acaoAtiva === 'analisar_processo' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0047ab]/10 text-[#0047ab] dark:bg-[#c5a059]/15 dark:text-[#c5a059]">
                      <FileSearch className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Analisar processo
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Identifique riscos, teses adversas e probabilidade de êxito.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload .txt</span>
                    <input
                      type="file"
                      accept=".txt,.md,.text"
                      onChange={(e) => handleUploadTexto(e, setProcConteudo)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Seleção rápida de processo existente */}
                {processosEscritorio.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04]">
                    <label
                      htmlFor="procExistenteSelect"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Puxar dados de um processo já cadastrado:
                    </label>
                    <select
                      id="procExistenteSelect"
                      onChange={(e) => handleSelecionarProcessoExistente(e.target.value)}
                      defaultValue=""
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    >
                      <option value="">Selecione um processo do escritório...</option>
                      {processosEscritorio.map((p) => (
                        <option key={p.id_processo} value={p.id_processo}>
                          {p.numero_processo} - {p.titulo} ({p.cliente?.nome || 'Sem cliente'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <form onSubmit={handleExecutarAnalisarProcesso} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <NumberProcessInput
                        id="procNumeroInput"
                        label="Número do Processo (CNJ)"
                        value={procNumero}
                        onChange={(e) => setProcNumero(e.target.value)}
                        placeholder="0000000-00.0000.0.00.0000"
                        helperText="Identificador CNJ (Opcional)"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="procPoloSelect"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Polo do Cliente *
                      </label>
                      <select
                        id="procPoloSelect"
                        value={procPolo}
                        onChange={(e) =>
                          setProcPolo(e.target.value as 'Autor' | 'Réu' | 'Terceiro Interessado')
                        }
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      >
                        <option value="Autor">Autor / Requerente</option>
                        <option value="Réu">Réu / Requerido</option>
                        <option value="Terceiro Interessado">Terceiro Interessado / Assistente</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="procTituloInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Título da Ação ou Objeto
                    </label>
                    <input
                      id="procTituloInput"
                      type="text"
                      value={procTitulo}
                      onChange={(e) => setProcTitulo(e.target.value)}
                      placeholder="Ex: Ação Indenizatória por Vício Oculto em Imóvel"
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="procConteudoArea"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Autos, Petição Inicial, Contestação ou Síntese do Caso *
                    </label>
                    <textarea
                      id="procConteudoArea"
                      rows={8}
                      required
                      value={procConteudo}
                      onChange={(e) => setProcConteudo(e.target.value)}
                      placeholder="Cole aqui o teor das peças, argumentos do adversário, provas juntadas ou despacho saneador..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="procFocoInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Foco Estratégico Solicitado (Opcional)
                    </label>
                    <input
                      id="procFocoInput"
                      type="text"
                      value={procFoco}
                      onChange={(e) => setProcFoco(e.target.value)}
                      placeholder="Ex: Avaliar risco de penhora, teses de prescrição, nulidade de citação..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProcConteudo('');
                        setProcTitulo('');
                        setProcFoco('');
                        setProcResultado(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={procLoading || !procConteudo.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-5 py-2 text-xs shadow-xs active:scale-98 disabled:opacity-50 transition cursor-pointer"
                    >
                      {procLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                          <span>Analisando autos...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Gerar Análise Estratégica</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. AÇÃO: RESUMIR DOCUMENTO */}
            {acaoAtiva === 'resumir_documento' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Resumir documento
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Converta decisões e contratos em resumos executivos ou para clientes.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload .txt</span>
                    <input
                      type="file"
                      accept=".txt,.md,.text"
                      onChange={(e) => handleUploadTexto(e, setDocTexto)}
                      className="hidden"
                    />
                  </label>
                </div>

                <form onSubmit={handleExecutarResumirDocumento} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="docTipoSelect"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Tipo de Documento
                      </label>
                      <select
                        id="docTipoSelect"
                        value={docTipo}
                        onChange={(e) => setDocTipo(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      >
                        <option value="Sentença / Decisão">Sentença / Decisão Monocrática</option>
                        <option value="Acórdão / Recurso">Acórdão / Julgamento Colegiado</option>
                        <option value="Petição Inicial / Contestação">Petição Inicial / Contestação</option>
                        <option value="Contrato Comercial / Imobiliário">Contrato Comercial / Imobiliário</option>
                        <option value="Notificação Extrajudicial">Notificação Extrajudicial</option>
                        <option value="Parecer Técnico">Parecer Técnico / Laudo Pericial</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="docFormatoSelect"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Formato e Público-Alvo
                      </label>
                      <select
                        id="docFormatoSelect"
                        value={docFormato}
                        onChange={(e) =>
                          setDocFormato(
                            e.target.value as 'executivo' | 'cliente_simples' | 'topicos_estrategicos',
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      >
                        <option value="executivo">Resumo Executivo (Técnico para Advogados)</option>
                        <option value="cliente_simples">Linguagem Simples (Visual Law para Cliente)</option>
                        <option value="topicos_estrategicos">Tópicos e Ações Imediatas (Bullet Points)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="docTextoArea"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Texto Completo do Documento *
                    </label>
                    <textarea
                      id="docTextoArea"
                      rows={10}
                      required
                      value={docTexto}
                      onChange={(e) => setDocTexto(e.target.value)}
                      placeholder="Cole aqui o texto da sentença, acórdão, contrato ou petição para sintetizar..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDocTexto('');
                        setDocResultado(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={docLoading || !docTexto.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-5 py-2 text-xs shadow-xs active:scale-98 disabled:opacity-50 transition cursor-pointer"
                    >
                      {docLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                          <span>Gerando resumo...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Sintetizar Documento</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. AÇÃO: ENCONTRAR JURISPRUDÊNCIA */}
            {acaoAtiva === 'encontrar_jurisprudencia' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <Gavel className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Encontrar jurisprudência
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Pesquise precedentes consolidados, súmulas e teses repetitivas.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleExecutarEncontrarJurisprudencia} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="jurisTemaInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Tema ou Controvérsia Jurídica *
                    </label>
                    <textarea
                      id="jurisTemaInput"
                      rows={3}
                      required
                      value={jurisTema}
                      onChange={(e) => setJurisTema(e.target.value)}
                      placeholder="Ex: Responsabilidade civil de banco por golpe do Pix com invasão de aplicativo e falha na segurança biométrica..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="jurisRamoSelect"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Ramo do Direito
                      </label>
                      <input
                        id="jurisRamoSelect"
                        type="text"
                        value={jurisRamo}
                        onChange={(e) => setJurisRamo(e.target.value)}
                        placeholder="Ex: Direito do Consumidor e Bancário"
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="jurisTribunalInput"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Tribunais Alvo
                      </label>
                      <input
                        id="jurisTribunalInput"
                        type="text"
                        value={jurisTribunal}
                        onChange={(e) => setJurisTribunal(e.target.value)}
                        placeholder="Ex: STJ (2ª Seção), TJSP, TJRJ"
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="jurisTeseInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Tese ou Linha Argumentativa Desejada (Opcional)
                    </label>
                    <input
                      id="jurisTeseInput"
                      type="text"
                      value={jurisTese}
                      onChange={(e) => setJurisTese(e.target.value)}
                      placeholder="Ex: Sustentar culpa concorrente ou fortuito interno (Súmula 479/STJ)..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setJurisTema('');
                        setJurisTese('');
                        setJurisResultado(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={jurisLoading || !jurisTema.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-5 py-2 text-xs shadow-xs active:scale-98 disabled:opacity-50 transition cursor-pointer"
                    >
                      {jurisLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                          <span>Mapeando teses...</span>
                        </>
                      ) : (
                        <>
                          <Gavel className="h-3.5 w-3.5" />
                          <span>Pesquisar Precedentes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. AÇÃO: CRIAR PEÇA */}
            {acaoAtiva === 'criar_peca' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <PenTool className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Criar peça jurídica
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Redija minutas estruturadas com fundamentação legal e pedidos.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleExecutarCriarPeca} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="pecaTipoSelect"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Tipo da Peça Processual *
                      </label>
                      <select
                        id="pecaTipoSelect"
                        value={pecaTipo}
                        onChange={(e) => setPecaTipo(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      >
                        <option value="Petição Inicial">Petição Inicial</option>
                        <option value="Contestação">Contestação com Preliminares</option>
                        <option value="Réplica à Contestação">Réplica à Contestação</option>
                        <option value="Recurso de Apelação">Recurso de Apelação</option>
                        <option value="Agravo de Instrumento com Pedido de Efeito Suspensivo">Agravo de Instrumento</option>
                        <option value="Embargos de Declaração">Embargos de Declaração</option>
                        <option value="Notificação Extrajudicial">Notificação Extrajudicial</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="pecaTribunalInput"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Endereçamento / Foro
                      </label>
                      <input
                        id="pecaTribunalInput"
                        type="text"
                        value={pecaTribunal}
                        onChange={(e) => setPecaTribunal(e.target.value)}
                        placeholder="Ex: Vara Cível da Comarca da Capital/SP"
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="pecaPartesInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Qualificação das Partes
                    </label>
                    <input
                      id="pecaPartesInput"
                      type="text"
                      value={pecaPartes}
                      onChange={(e) => setPecaPartes(e.target.value)}
                      placeholder="Ex: João da Silva (Autor) em face de Banco Seguro S/A (Réu)"
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pecaFatosArea"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Fatos e Histórico do Caso *
                    </label>
                    <textarea
                      id="pecaFatosArea"
                      rows={6}
                      required
                      value={pecaFatos}
                      onChange={(e) => setPecaFatos(e.target.value)}
                      placeholder="Descreva cronologicamente o que ocorreu, datas, valores e danos sofridos..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="pecaPedidosInput"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Pedidos Específicos
                      </label>
                      <input
                        id="pecaPedidosInput"
                        type="text"
                        value={pecaPedidos}
                        onChange={(e) => setPecaPedidos(e.target.value)}
                        placeholder="Ex: Liminar para suspender negativação, danos morais de R$ 10.000..."
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="pecaJurisInput"
                        className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Tese ou Jurisprudência de Referência
                      </label>
                      <input
                        id="pecaJurisInput"
                        type="text"
                        value={pecaJurisReferencia}
                        onChange={(e) => setPecaJurisReferencia(e.target.value)}
                        placeholder="Ex: Súmula 385 do STJ, art. 14 do CDC..."
                        className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPecaFatos('');
                        setPecaPedidos('');
                        setPecaResultado(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={pecaLoading || !pecaFatos.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-5 py-2 text-xs shadow-xs active:scale-98 disabled:opacity-50 transition cursor-pointer"
                    >
                      {pecaLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                          <span>Redigindo minuta...</span>
                        </>
                      ) : (
                        <>
                          <PenTool className="h-3.5 w-3.5" />
                          <span>Gerar Minuta da Peça</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 5. AÇÃO: IDENTIFICAR PRAZOS */}
            {acaoAtiva === 'identificar_prazos' && (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Identificar prazos
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Extraia termos fatais de intimações do DJE e agende no calendário.
                      </p>
                    </div>
                  </div>

                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 transition">
                    <Upload className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload .txt</span>
                    <input
                      type="file"
                      accept=".txt,.md,.text"
                      onChange={(e) => handleUploadTexto(e, setPrazoTexto)}
                      className="hidden"
                    />
                  </label>
                </div>

                <form onSubmit={handleExecutarIdentificarPrazos} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="prazoDataPubInput"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Data da Disponibilização / Publicação no DJE
                    </label>
                    <input
                      id="prazoDataPubInput"
                      type="date"
                      value={prazoDataPub}
                      onChange={(e) => setPrazoDataPub(e.target.value)}
                      className="w-full sm:w-64 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="prazoTextoArea"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Texto da Publicação, Despacho ou Intimação *
                    </label>
                    <textarea
                      id="prazoTextoArea"
                      rows={8}
                      required
                      value={prazoTexto}
                      onChange={(e) => setPrazoTexto(e.target.value)}
                      placeholder="Cole aqui o recorte do Diário da Justiça Eletrônico ou teor da intimação..."
                      className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPrazoTexto('');
                        setPrazoResultado(null);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.04] transition cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      type="submit"
                      disabled={prazoLoading || !prazoTexto.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-5 py-2 text-xs shadow-xs active:scale-98 disabled:opacity-50 transition cursor-pointer"
                    >
                      {prazoLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white dark:border-slate-950 border-t-transparent" />
                          <span>Calculando termos...</span>
                        </>
                      ) : (
                        <>
                          <CalendarClock className="h-3.5 w-3.5" />
                          <span>Calcular Prazos & Termos</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RELATÓRIO E RESULTADOS DE IA (COLUNA DIREITA - 6 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="legal-card p-6 min-h-[520px] flex flex-col justify-between">
            <div>
              {/* Header do resultado */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0047ab] dark:text-[#c5a059]" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Parecer & Resultado da Inteligência Artificial
                  </h3>
                </div>

                {/* Ações de cópia e exportação */}
                {((acaoAtiva === 'analisar_processo' && procResultado) ||
                  (acaoAtiva === 'resumir_documento' && docResultado) ||
                  (acaoAtiva === 'encontrar_jurisprudencia' && jurisResultado) ||
                  (acaoAtiva === 'criar_peca' && pecaResultado)) && (
                  <button
                    type="button"
                    onClick={() => {
                      const txt =
                        acaoAtiva === 'analisar_processo'
                          ? procResultado
                          : acaoAtiva === 'resumir_documento'
                          ? docResultado
                          : acaoAtiva === 'encontrar_jurisprudencia'
                          ? jurisResultado
                          : pecaResultado;
                      if (txt) handleCopiar(txt);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300 cursor-pointer transition"
                  >
                    {copiado ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiado ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                )}
              </div>

              {/* Corpo do resultado */}
              <div className="mt-4">
                {/* 1. Loading State */}
                {(procLoading || docLoading || jurisLoading || pecaLoading || prazoLoading) && (
                  <div className="py-20 text-center space-y-4">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-3 border-[#0047ab] dark:border-[#c5a059] border-t-transparent" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">
                        O Gemini está processando a solicitação jurídica...
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Estruturando teses, analisando riscos e formatando o documento.
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Resultados: Texto corrido estruturado */}
                {!procLoading && acaoAtiva === 'analisar_processo' && procResultado && (
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/[0.04] whitespace-pre-wrap font-sans">
                    {procResultado}
                  </div>
                )}

                {!docLoading && acaoAtiva === 'resumir_documento' && docResultado && (
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/[0.04] whitespace-pre-wrap font-sans">
                    {docResultado}
                  </div>
                )}

                {!jurisLoading && acaoAtiva === 'encontrar_jurisprudencia' && jurisResultado && (
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/[0.04] whitespace-pre-wrap font-sans">
                    {jurisResultado}
                  </div>
                )}

                {!pecaLoading && acaoAtiva === 'criar_peca' && pecaResultado && (
                  <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/[0.04] whitespace-pre-wrap font-serif">
                    {pecaResultado}
                  </div>
                )}

                {/* 3. Resultado: Identificar Prazos (Card Estruturado) */}
                {!prazoLoading && acaoAtiva === 'identificar_prazos' && prazoResultado && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl border ${
                        prazoResultado.urgencia?.toLowerCase().includes('fatal') ||
                        prazoResultado.urgencia?.toLowerCase().includes('alta')
                          ? 'bg-rose-50/70 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 text-rose-950 dark:text-rose-200'
                          : 'bg-slate-50 border-slate-200 dark:bg-white/[0.02] dark:border-white/[0.06] text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            Urgência: {prazoResultado.urgencia || 'Média'}
                          </span>
                        </div>
                        {prazoResultado.tem_prazo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600 text-white dark:bg-rose-500">
                            Prazo Processual Exigido
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        <h4 className="text-sm font-semibold">
                          {prazoResultado.descricao_providencia || 'Cumprimento de Prazo'}
                        </h4>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-200/60 dark:border-white/[0.08] pt-3">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Contagem estipulada:</span>
                          <p className="font-semibold mt-0.5">
                            {prazoResultado.quantidade_dias ? `${prazoResultado.quantidade_dias} dias` : 'Não especificado'}{' '}
                            {prazoResultado.tipo_contagem ? `(${prazoResultado.tipo_contagem})` : ''}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[11px]">Data limite sugerida:</span>
                          <p className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                            {prazoResultado.data_limite_estimada
                              ? new Date(prazoResultado.data_limite_estimada + 'T00:00:00').toLocaleDateString('pt-BR')
                              : 'Conferir termo'}
                          </p>
                        </div>
                      </div>

                      {prazoResultado.observacoes && (
                        <div className="mt-3 text-[11px] text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Atenção:</span>{' '}
                          {prazoResultado.observacoes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={abrirModalSalvarPrazo}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        <span>Agendar no Calendário de Prazos</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Estado Vazio / Inicial */}
                {!procLoading &&
                  !docLoading &&
                  !jurisLoading &&
                  !pecaLoading &&
                  !prazoLoading &&
                  !procResultado &&
                  !docResultado &&
                  !jurisResultado &&
                  !pecaResultado &&
                  !prazoResultado && (
                    <div className="py-20 text-center text-slate-400 space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.04] text-slate-400">
                        <Sparkles className="h-6 w-6 stroke-[1.25]" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Nenhuma análise processada ainda
                        </p>
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                          Preencha as informações no formulário ao lado ou clique em &quot;Carregar caso de exemplo&quot; para testar imediatamente.
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Rodapé do card de resultado */}
            <div className="mt-6 pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-slate-400" />
                <span>Privacidade & Sigilo Profissional OAB</span>
              </span>
              <Link href="/prazos" className="hover:text-slate-700 dark:hover:text-slate-200">
                Prazos do Escritório &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SALVAR PRAZO EXTRAÍDO NO CALENDÁRIO */}
      {/* ========================================================================= */}
      {modalPrazoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] p-6 shadow-xl space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#0047ab] dark:text-[#c5a059]" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Agendar Prazo no Calendário
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPrazoAberto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarPrazoModal} className="space-y-3">
              <div>
                <label
                  htmlFor="modalProcessoSelect"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Vincular ao Processo *
                </label>
                <select
                  id="modalProcessoSelect"
                  value={processoSelecionadoId}
                  onChange={(e) => setProcessoSelecionadoId(Number(e.target.value))}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                >
                  <option value="">Selecione um processo...</option>
                  {processosEscritorio.map((p) => (
                    <option key={p.id_processo} value={p.id_processo}>
                      {p.numero_processo} - {p.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="modalDescricaoInput"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Descrição da Providência *
                </label>
                <input
                  id="modalDescricaoInput"
                  type="text"
                  required
                  value={descricaoPrazoModal}
                  onChange={(e) => setDescricaoPrazoModal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                />
              </div>

              <div>
                <label
                  htmlFor="modalDataInput"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Data de Vencimento Fatal *
                </label>
                <input
                  id="modalDataInput"
                  type="date"
                  required
                  value={dataVencimentoModal}
                  onChange={(e) => setDataVencimentoModal(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0047ab]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setModalPrazoAberto(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.04]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoPrazo || !processoSelecionadoId}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0047ab] hover:bg-[#003d94] dark:bg-[#c5a059] dark:hover:bg-[#d4b36f] text-white dark:text-slate-950 font-semibold px-4 py-2 text-xs shadow-xs transition disabled:opacity-50"
                >
                  {salvandoPrazo ? 'Salvando...' : 'Confirmar e Agendar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé institucional */}
      <InstitutionalFooter />
    </div>
  );
}

export default function GeminiPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0047ab] dark:border-[#c5a059] border-t-transparent" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Carregando Assistente Jurídico IA...
              </p>
            </div>
          </div>
        }
      >
        <GeminiContent />
      </Suspense>
    </AuthGuard>
  );
}
