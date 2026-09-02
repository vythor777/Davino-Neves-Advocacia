'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthGuard from '@/components/AuthGuard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SecurityBadge } from '@/components/SecurityBadge';
import { InstitutionalFooter } from '@/components/InstitutionalFooter';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Search,
  Scale,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  BookmarkPlus,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Briefcase,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import datajudService, { DataJudProcessoResponse, ComplementoDataJud } from '@/services/datajudService';
import clienteService, { Cliente } from '@/services/clienteService';
import processoService from '@/services/processoService';

const EXEMPLOS_PROCESSOS = [
  {
    rotulo: 'TJSP - Cível (São Paulo)',
    numero: '1002345-67.2024.8.26.0100',
    tribunal: 'tjsp',
  },
  {
    rotulo: 'TJRJ - Cível (Rio de Janeiro)',
    numero: '0012345-88.2023.8.19.0001',
    tribunal: 'tjrj',
  },
  {
    rotulo: 'TRT2 - Trabalhista (SP)',
    numero: '1000123-45.2024.5.02.0001',
    tribunal: 'trt2',
  },
  {
    rotulo: 'TRF3 - Federal (SP/MS)',
    numero: '5001234-56.2023.4.03.6100',
    tribunal: 'trf3',
  },
];

const TRIBUNAIS_OPCOES = [
  { valor: '', rotulo: 'Detectar automaticamente pelo CNJ' },
  { valor: 'tjsp', rotulo: 'TJSP - Tribunal de Justiça de São Paulo' },
  { valor: 'tjrj', rotulo: 'TJRJ - Tribunal de Justiça do Rio de Janeiro' },
  { valor: 'tjmg', rotulo: 'TJMG - Tribunal de Justiça de Minas Gerais' },
  { valor: 'tjrs', rotulo: 'TJRS - Tribunal de Justiça do Rio Grande do Sul' },
  { valor: 'tjpr', rotulo: 'TJPR - Tribunal de Justiça do Paraná' },
  { valor: 'tjba', rotulo: 'TJBA - Tribunal de Justiça da Bahia' },
  { valor: 'tjdft', rotulo: 'TJDFT - Tribunal de Justiça do DF e Territórios' },
  { valor: 'trf1', rotulo: 'TRF1 - Tribunal Regional Federal 1ª Região' },
  { valor: 'trf2', rotulo: 'TRF2 - Tribunal Regional Federal 2ª Região' },
  { valor: 'trf3', rotulo: 'TRF3 - Tribunal Regional Federal 3ª Região' },
  { valor: 'trf4', rotulo: 'TRF4 - Tribunal Regional Federal 4ª Região' },
  { valor: 'trf5', rotulo: 'TRF5 - Tribunal Regional Federal 5ª Região' },
  { valor: 'trf6', rotulo: 'TRF6 - Tribunal Regional Federal 6ª Região' },
  { valor: 'trt2', rotulo: 'TRT2 - Tribunal Regional do Trabalho 2ª Região (SP)' },
  { valor: 'trt1', rotulo: 'TRT1 - Tribunal Regional do Trabalho 1ª Região (RJ)' },
  { valor: 'trt3', rotulo: 'TRT3 - Tribunal Regional do Trabalho 3ª Região (MG)' },
  { valor: 'stj', rotulo: 'STJ - Superior Tribunal de Justiça' },
  { valor: 'stf', rotulo: 'STF - Supremo Tribunal Federal' },
];

export default function DataJudPage() {
  return (
    <AuthGuard>
      <DataJudContent />
    </AuthGuard>
  );
}

function DataJudContent() {
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [tribunalSelecionado, setTribunalSelecionado] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DataJudProcessoResponse | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Estados para vinculação de processo ao sistema
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<number | ''>('');
  const [tituloProcesso, setTituloProcesso] = useState('');
  const [statusProcesso, setStatusProcesso] = useState('Em Andamento');
  const [descricaoProcesso, setDescricaoProcesso] = useState('');
  const [salvandoVinculo, setSalvandoVinculo] = useState(false);
  const [sucessoVinculo, setSucessoVinculo] = useState<{ id: number; titulo: string } | null>(null);

  // Formatação de máscara CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
  const formatarCNJ = (valor: string) => {
    const limpo = valor.replace(/\D/g, '').slice(0, 20);
    if (limpo.length <= 7) return limpo;
    if (limpo.length <= 9) return `${limpo.slice(0, 7)}-${limpo.slice(7)}`;
    if (limpo.length <= 13) return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9)}`;
    if (limpo.length <= 14) return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13)}`;
    if (limpo.length <= 16) return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13, 14)}.${limpo.slice(14)}`;
    return `${limpo.slice(0, 7)}-${limpo.slice(7, 9)}.${limpo.slice(9, 13)}.${limpo.slice(13, 14)}.${limpo.slice(14, 16)}.${limpo.slice(16, 20)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatado = formatarCNJ(e.target.value);
    setNumeroProcesso(formatado);
    if (erro) setErro(null);
  };

  const handleAplicarExemplo = (numero: string, tribunal: string) => {
    setNumeroProcesso(formatarCNJ(numero));
    setTribunalSelecionado(tribunal);
    if (erro) setErro(null);
  };

  const handleConsultar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const limpo = numeroProcesso.replace(/\D/g, '');

    if (!limpo || limpo.length < 15) {
      setErro('Por favor, informe o número completo do processo no padrão CNJ (20 dígitos).');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);
    setSucessoVinculo(null);

    try {
      const data = await datajudService.consultarProcesso({
        numero_processo: limpo,
        tribunal: tribunalSelecionado || undefined,
      });
      setResultado(data);
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Não foi possível consultar os dados no DataJud CNJ.';
      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarNumero = () => {
    if (!resultado?.numeroProcesso) return;
    navigator.clipboard.writeText(formatarCNJ(resultado.numeroProcesso));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const abrirModalVinculacao = async () => {
    if (!resultado) return;

    try {
      const listaClientes = await clienteService.getAll();
      setClientes(listaClientes);
      if (listaClientes.length > 0) {
        setClienteSelecionadoId(listaClientes[0].id_cliente);
      }
    } catch {
      // Caso não consiga buscar clientes
    }

    const classeDesc = resultado.classe || 'Ação Judicial';
    const orgaoDesc = resultado.orgaoJulgador || resultado.tribunal;
    const assuntosDesc = resultado.assuntos?.join(', ') || 'Sem assuntos discriminados';

    setTituloProcesso(`${classeDesc} - ${resultado.tribunal}`);
    setDescricaoProcesso(
      `Processo consultado e importado via DataJud CNJ.\nTribunal: ${resultado.tribunal}\nÓrgão Julgador: ${orgaoDesc}\nAssuntos: ${assuntosDesc}`,
    );
    setStatusProcesso('Em Andamento');
    setModalVincularAberto(true);
  };

  const handleSalvarVinculo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultado || !clienteSelecionadoId) {
      setErro('Selecione um cliente para vincular o processo.');
      return;
    }

    setSalvandoVinculo(true);
    try {
      const dataAberturaFormatada = resultado.dataAjuizamento
        ? resultado.dataAjuizamento.slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const novoProcesso = await processoService.create({
        numero_processo: formatarCNJ(resultado.numeroProcesso),
        titulo: tituloProcesso.trim() || `Processo ${resultado.tribunal}`,
        descricao: descricaoProcesso.trim(),
        data_abertura: dataAberturaFormatada,
        status: statusProcesso,
        id_cliente: Number(clienteSelecionadoId),
      });

      setSucessoVinculo({
        id: novoProcesso.id_processo,
        titulo: novoProcesso.titulo,
      });
      setModalVincularAberto(false);
      toast.success('Processo importado com sucesso!', {
        description: `O processo "${novoProcesso.titulo}" foi adicionado ao acervo ativo do escritório.`,
      });
    } catch (err: unknown) {
      const mensagem = err instanceof Error ? err.message : 'Falha na requisição ao servidor.';
      toast.error('Erro ao vincular processo ao acervo', {
        description: mensagem,
      });
    } finally {
      setSalvandoVinculo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col antialiased">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up space-y-6">
        {/* Breadcrumb e Indicador de Segurança */}
        <div className="flex items-center justify-between">
          <Breadcrumbs items={[{ label: 'Consulta DataJud (CNJ)', icon: Scale }]} />
          <SecurityBadge variant="compact" className="hidden sm:inline-flex" />
        </div>

        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-900 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-900 dark:text-indigo-300">
              <Scale className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              Conselho Nacional de Justiça • API Pública
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              Consulta Processual DataJud
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Consulte dados oficiais, classes, órgãos julgadores e andamentos de processos em tribunais de todo o Brasil.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/processos"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
            >
              <Briefcase className="h-4 w-4" />
              Ver Processos do Escritório
            </Link>
          </div>
        </div>

        {/* Formulário de Busca */}
        <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleConsultar} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-8">
                <label
                  htmlFor="numeroProcesso"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-200"
                >
                  Número do Processo (Padrão CNJ)
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    id="numeroProcesso"
                    type="text"
                    value={numeroProcesso}
                    onChange={handleInputChange}
                    placeholder="0000000-00.0000.0.00.0000"
                    maxLength={25}
                    className="block w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 font-mono text-sm tracking-wide text-white placeholder:text-slate-400 transition focus:border-amber-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label
                  htmlFor="tribunalSelect"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-200"
                >
                  Tribunal (Opcional)
                </label>
                <select
                  id="tribunalSelect"
                  value={tribunalSelecionado}
                  onChange={(e) => setTribunalSelecionado(e.target.value)}
                  className="mt-1.5 block w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white focus:border-amber-500 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {TRIBUNAIS_OPCOES.map((t) => (
                    <option key={t.valor} value={t.valor} className="bg-slate-900 text-slate-100 py-1.5">
                      {t.rotulo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exemplos de busca rápida */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Exemplos para teste:</span>
              {EXEMPLOS_PROCESSOS.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAplicarExemplo(ex.numero, ex.tribunal)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-200 transition hover:border-amber-500 hover:bg-slate-700 hover:text-amber-300"
                >
                  {ex.rotulo}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {resultado && (
                <button
                  type="button"
                  onClick={() => {
                    setResultado(null);
                    setNumeroProcesso('');
                    setErro(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar Consulta
                </button>
              )}

              <button
                type="submit"
                disabled={loading || !numeroProcesso.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Buscando no DataJud...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Consultar Processo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 p-5 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Não foi possível localizar o processo</h4>
                <p className="mt-1 text-xs leading-relaxed">{erro}</p>
                <div className="mt-3 flex items-center gap-3 text-xs">
                  <span className="font-medium text-red-800 dark:text-red-200">Dica:</span>
                  <span>
                    Confira se o número do processo possui 20 dígitos e se o tribunal correto foi selecionado.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback de Vínculo com Sucesso */}
        {sucessoVinculo && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="font-bold text-sm">Processo vinculado com sucesso ao escritório!</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    &quot;{sucessoVinculo.titulo}&quot; já está salvo na base de dados de Processos.
                  </p>
                </div>
              </div>
              <Link
                href="/processos"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
              >
                <span>Acessar Módulo Processos</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Resultados da Consulta */}
        {resultado && (
          <div className="mt-8 space-y-6">
            {/* Bloco Superior: Dados Gerais do Processo */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 border-b border-slate-100 pb-6 dark:border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                      Tribunal {resultado.tribunal}
                    </span>
                    {resultado.grau && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {resultado.grau === 'G1' ? '1ª Instância (Vara)' : resultado.grau === 'G2' ? '2ª Instância (Tribunal)' : resultado.grau}
                      </span>
                    )}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
                      Sincronizado via DataJud
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <h2 className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      {formatarCNJ(resultado.numeroProcesso)}
                    </h2>
                    <button
                      onClick={handleCopiarNumero}
                      title="Copiar número do processo"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {resultado.classe || 'Classe processual não informada'}
                  </p>
                </div>

                {/* Botões de Ação Imediata */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={abrirModalVinculacao}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-800 active:scale-95 dark:bg-amber-800 dark:hover:bg-amber-700"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    <span>Vincular ao Sistema com 1 Clique</span>
                  </button>

                  <Link
                    href={`/gemini?processo=${encodeURIComponent(formatarCNJ(resultado.numeroProcesso))}&tribunal=${encodeURIComponent(resultado.tribunal)}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-semibold text-purple-900 shadow-xs transition hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                  >
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Analisar com IA Gemini</span>
                  </Link>
                </div>
              </div>

              {/* Grid com detalhes do processo */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Building2 className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                    <span>Órgão Julgador / Vara</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {resultado.orgaoJulgador || 'Não especificado'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                    <span>Data de Distribuição / Ajuizamento</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {resultado.dataAjuizamento
                      ? new Date(resultado.dataAjuizamento).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Não informada'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Layers className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                    <span>Total de Andamentos</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {resultado.movimentos?.length || 0} movimentações
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <Scale className="h-4 w-4 text-amber-800 dark:text-amber-400" />
                    <span>Nível de Sigilo</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {resultado.nivelSigilo === 0 ? 'Público (Nível 0)' : `Sigiloso (Nível ${resultado.nivelSigilo})`}
                  </p>
                </div>
              </div>

              {/* Assuntos Processuais */}
              {resultado.assuntos && resultado.assuntos.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assuntos / Matérias Vinculadas
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {resultado.assuntos.map((assunto, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                      >
                        {assunto}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Linha do Tempo de Movimentações */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                      Linha do Tempo de Movimentações
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Histórico cronológico de atos, despachos, decisões e publicações.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {resultado.movimentos.length} atos registrados
                </span>
              </div>

              {resultado.movimentos && resultado.movimentos.length > 0 ? (
                <div className="mt-6 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  <div className="space-y-6">
                    {resultado.movimentos.map((mov, index) => {
                      const isMaisRecente = index === 0;
                      const dataFormatada = mov.dataHora
                        ? new Date(mov.dataHora).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Data não informada';

                      return (
                        <div key={index} className="relative group">
                          {/* Marcador na Linha */}
                          <div
                            className={`absolute -left-[29px] top-1 h-3.5 w-3.5 rounded-full border-2 transition ${
                              isMaisRecente
                                ? 'border-amber-700 bg-amber-600 dark:border-amber-400 dark:bg-amber-500 shadow-xs'
                                : 'border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-900 group-hover:border-amber-600'
                            }`}
                          />

                          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                                {dataFormatada}
                              </span>
                              {mov.codigo && (
                                <span className="font-mono text-[11px] text-slate-400">
                                  Cód. CNJ: #{mov.codigo}
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1.5 font-medium text-sm text-slate-900 dark:text-slate-100 leading-snug">
                              {mov.nome}
                            </h4>

                            {mov.complementos && mov.complementos.length > 0 && (
                              <div className="mt-2 space-y-1 rounded-lg bg-white p-2.5 text-xs text-slate-600 border border-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                                {mov.complementos.map((comp: ComplementoDataJud, cIdx: number) => (
                                  <div key={cIdx} className="flex items-start gap-1.5">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {comp.nome || comp.descricao || 'Complemento'}:
                                    </span>
                                    <span>{String(comp.valor || comp.descricao || '')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  Nenhum andamento detalhado foi retornado para este processo no DataJud.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal para Vincular Processo ao Sistema */}
      {modalVincularAberto && resultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5 text-amber-800 dark:text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-slate-100">
                  Vincular Processo ao Escritório
                </h3>
              </div>
              <button
                onClick={() => setModalVincularAberto(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarVinculo} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Número do Processo (CNJ)
                </label>
                <input
                  type="text"
                  disabled
                  value={formatarCNJ(resultado.numeroProcesso)}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 font-mono text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cliente Responsável / Titular *
                </label>
                {clientes.length > 0 ? (
                  <select
                    required
                    value={clienteSelecionadoId}
                    onChange={(e) => setClienteSelecionadoId(Number(e.target.value))}
                    className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {clientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente} className="bg-slate-900 text-slate-100">
                        {c.nome} ({c.cpf_cnpj || 'Sem documento'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 rounded-lg bg-amber-950/40 p-2.5 text-xs text-amber-300 border border-amber-800">
                    Nenhum cliente cadastrado. Cadastre um cliente primeiro no módulo de Clientes.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Título de Identificação Interna *
                </label>
                <input
                  type="text"
                  required
                  value={tituloProcesso}
                  onChange={(e) => setTituloProcesso(e.target.value)}
                  placeholder="Título do processo"
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Status do Processo
                </label>
                <select
                  value={statusProcesso}
                  onChange={(e) => setStatusProcesso(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Em Andamento" className="bg-slate-900 text-slate-100">Em Andamento</option>
                  <option value="Aguardando Sentença" className="bg-slate-900 text-slate-100">Aguardando Sentença</option>
                  <option value="Fase Recursal" className="bg-slate-900 text-slate-100">Fase Recursal</option>
                  <option value="Cumprimento de Sentença" className="bg-slate-900 text-slate-100">Cumprimento de Sentença</option>
                  <option value="Arquivado" className="bg-slate-900 text-slate-100">Arquivado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Anotações / Descrição Inicial
                </label>
                <textarea
                  rows={3}
                  value={descricaoProcesso}
                  onChange={(e) => setDescricaoProcesso(e.target.value)}
                  placeholder="Descrição..."
                  className="mt-1 block w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalVincularAberto(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoVinculo || clientes.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-900 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 dark:bg-amber-800 dark:hover:bg-amber-700"
                >
                  {salvandoVinculo ? 'Salvando...' : 'Salvar no Escritório'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rodapé Institucional */}
      <InstitutionalFooter />
    </div>
  );
}
