import {
  Injectable,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { setTimeout as delay } from 'node:timers/promises';
import { ConsultarProcessoDto } from './dto/consultar-processo.dto.js';

const publicDataJudUrl = 'https://api-publica.datajud.cnj.jus.br';
// Chave pública publicada pelo CNJ em https://datajud-wiki.cnj.jus.br/api-publica/acesso/
const publicDataJudKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

const requestTimeoutMs = 12_000;
const retryableStatuses = new Set([500, 502, 503]);

type DataJudRecord = {
  numeroProcesso: string;
  classe?: { nome: string };
  orgaoJulgador?: { nome: string };
  dataAjuizamento?: string;
  grau?: string;
  nivelSigilo?: number;
  assuntos?: Array<{ nome: string }>;
  movimentos?: Array<{ codigo?: number; nome: string; dataHora: string; complementosTabelados?: unknown[] }>;
} & Record<string, unknown>;

type DataJudResponse = {
  timed_out?: boolean;
  _shards?: { failed?: number };
  hits?: { hits?: Array<{ _source: DataJudRecord }> };
};

export class DataJudProcessNotFoundException extends NotFoundException {}

@Injectable()
export class DataJudService {
  private readonly logger = new Logger(DataJudService.name);
  private getBaseUrl(): string {
    const rawUrl = process.env.DATAJUD_API_URL || process.env.DATA_JUD_API_URL;
    if (!rawUrl || rawUrl.trim() === '') {
      return publicDataJudUrl;
    }

    let url = rawUrl.trim().replace(/^["']|["']$/g, '').trim();
    // Remove qualquer rota ou sub-caminho engessado como /api_publica_... ou /_search
    url = url.replace(/\/api_publica_[^/]+.*$/i, '');
    url = url.replace(/\/_search.*$/i, '');
    url = url.replace(/\/+$/, '');

    // Se não tiver protocolo, prefixa com https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return publicDataJudUrl;
    }
  }

  private getApiKey(baseUrl: string): string {
    // Lista de variações de nomes possíveis no ambiente do Render/Docker/Next
    const possibleEnvKeys = [
      'DATAJUD_API_KEY',
      'CNJ_DATAJUD_API_KEY',
      'DATAJUD_KEY',
      'DATAJUD_TOKEN',
      'CNJ_API_KEY',
      'DATA_JUD_API_KEY',
      'NEXT_PUBLIC_DATAJUD_API_KEY',
    ];

    let foundKey: string | undefined;
    let foundVarName: string | undefined;

    for (const varName of possibleEnvKeys) {
      const val = process.env[varName];
      if (val && typeof val === 'string' && val.trim() !== '') {
        foundKey = val.trim();
        foundVarName = varName;
        break;
      }
    }

    if (!foundKey) {
      if (baseUrl === publicDataJudUrl) return publicDataJudKey;
      this.logger.warn(
        `[DataJud Config] Nenhuma chave de API configurada no ambiente. Variáveis verificadas: ${possibleEnvKeys.join(', ')}.`,
      );
      throw new BadRequestException(
        'A chave de acesso DATAJUD_API_KEY não está configurada no ambiente. Por favor, configure a chave válida do CNJ no painel do servidor.',
      );
    }

    // Limpa eventuais aspas duplas ou simples adicionadas por engano no painel do Render/env
    foundKey = foundKey.replace(/^["']|["']$/g, '').trim();

    this.logger.debug(
      `[DataJud Config] Chave de API carregada com sucesso da variável "${foundVarName}" (tamanho: ${foundKey.length} caracteres).`,
    );

    return foundKey;
  }

  /**
   * Sanitiza e remove todos os caracteres não numéricos do número do processo
   * (mantendo estritamente os dígitos numéricos limpos para a API do CNJ).
   */
  public limparNumeroProcesso(numero: string): string {
    if (!numero) return '';
    return numero.replace(/\D/g, '').trim();
  }

  /**
   * Mapeamento de segmento e código do tribunal pelo padrão CNJ (J.TR)
   * Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
   */
  private identificarTribunal(numeroProcesso: string): string {
    const numeroProcessoLimpo = this.limparNumeroProcesso(numeroProcesso);
    if (numeroProcessoLimpo.length !== 20) {
      return 'tjsp'; // Tribunal padrão de fallback
    }

    const j = numeroProcessoLimpo.substring(13, 14); // Segmento da Justiça
    const tr = numeroProcessoLimpo.substring(14, 16); // Tribunal / Região

    // 8 = Justiça Estadual
    if (j === '8') {
      const tribunaisEstaduais: Record<string, string> = {
        '01': 'tjac',
        '02': 'tjal',
        '03': 'tjap',
        '04': 'tjam',
        '05': 'tjba',
        '06': 'tjce',
        '07': 'tjdft',
        '08': 'tjes',
        '09': 'tjgo',
        '10': 'tjma',
        '11': 'tjmt',
        '12': 'tjms',
        '13': 'tjmg',
        '14': 'tjpa',
        '15': 'tjpb',
        '16': 'tjpr',
        '17': 'tjpe',
        '18': 'tjpi',
        '19': 'tjrj',
        '20': 'tjrn',
        '21': 'tjrs',
        '22': 'tjro',
        '23': 'tjrr',
        '24': 'tjsc',
        '25': 'tjse',
        '26': 'tjsp',
        '27': 'tjto',
      };
      return tribunaisEstaduais[tr] || 'tjsp';
    }

    // 4 = Justiça Federal (TRF)
    if (j === '4') {
      const regiao = parseInt(tr, 10);
      return `trf${regiao}`;
    }

    // 5 = Justiça do Trabalho (TRT)
    if (j === '5') {
      const regiao = parseInt(tr, 10);
      return `trt${regiao}`;
    }

    // 3 = STJ
    if (j === '3') {
      return 'stj';
    }

    // 1 = STF
    if (j === '1') {
      return 'stf';
    }

    return 'tjsp';
  }

  async consultarProcesso(dto: ConsultarProcessoDto) {
    const { numero_processo, tribunal } = dto;
    const numeroLimpo = this.limparNumeroProcesso(numero_processo);

    if (!numeroLimpo || numeroLimpo.length < 15) {
      throw new BadRequestException(
        'Número de processo inválido. Forneça o número no padrão CNJ (20 dígitos).',
      );
    }

    let siglaTribunal =
      tribunal?.toLowerCase() || this.identificarTribunal(numeroLimpo);
    siglaTribunal = siglaTribunal.replace(/^api_publica_/i, '').replace(/^_search$/i, '').trim();

    const baseUrl = this.getBaseUrl();
    const endpoint = `${baseUrl}/api_publica_${siglaTribunal}/_search`;

    try {
      const key = this.getApiKey(baseUrl).replace(/^APIKey\s+/i, '');
      const data = await this.search(endpoint, numeroLimpo, key, baseUrl === publicDataJudUrl);
      const hits = data?.hits?.hits;
      if (!Array.isArray(hits)) {
        throw new BadGatewayException('O DataJud retornou uma resposta inválida.');
      }

      if (hits.length === 0) {
        this.logger.warn(
          `Nenhum registro retornado pelo DataJud para o processo ${numeroLimpo} no tribunal ${siglaTribunal.toUpperCase()}.`,
        );
        throw new DataJudProcessNotFoundException(
          `Nenhum registro localizado no DataJud para o processo ${numeroLimpo} no tribunal ${siglaTribunal.toUpperCase()}.`,
        );
      }

      const processoData = hits[0]?._source;
      if (typeof processoData?.numeroProcesso !== 'string') {
        throw new BadGatewayException('O DataJud retornou um registro inválido.');
      }

      return {
        sucesso: true,
        tribunal: siglaTribunal.toUpperCase(),
        numeroProcesso: processoData.numeroProcesso,
        classe: processoData.classe?.nome || 'Procedimento Comum Cível',
        orgaoJulgador:
          processoData.orgaoJulgador?.nome ||
          `Vara Cível da Comarca - ${siglaTribunal.toUpperCase()}`,
        dataAjuizamento:
          processoData.dataAjuizamento || new Date().toISOString(),
        grau: processoData.grau || 'G1',
        nivelSigilo: processoData.nivelSigilo ?? 0,
        assuntos:
          processoData.assuntos?.map(a => a.nome) || [
            'Direito Civil',
            'Obrigações / Inadimplemento',
          ],
        movimentos: (processoData.movimentos || []).map(m => ({
          codigo: m.codigo,
          nome: m.nome,
          dataHora: m.dataHora,
          complementos: m.complementosTabelados || [],
        })),
        dadosCompletos: processoData,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Falha interna ao processar a resposta do DataJud para ${siglaTribunal}.`, error);
      throw new BadGatewayException('Não foi possível processar a resposta do DataJud.');
    }
  }

  private async search(endpoint: string, number: string, key: string, allowPublicKey: boolean): Promise<DataJudResponse> {
    let apiKey = key;
    const body = JSON.stringify({ size: 1, query: { match: { numeroProcesso: number } } });

    for (let attempt = 1; ; attempt++) {
      const signal = AbortSignal.timeout(requestTimeoutMs);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `APIKey ${apiKey}` },
          body,
          signal,
        });

        if (response.ok) {
          const data: DataJudResponse = await response.json();
          if (data?.timed_out) throw this.timeout();
          if (data?._shards?.failed) throw new ServiceUnavailableException('O DataJud retornou uma consulta incompleta.');
          return data;
        }

        await response.body?.cancel();
        this.logger.warn(`DataJud retornou HTTP ${response.status} em ${new URL(endpoint).pathname}.`);
        if (response.status === 401 || response.status === 403) {
          if (attempt === 1 && allowPublicKey && apiKey !== publicDataJudKey) {
            apiKey = publicDataJudKey;
            continue;
          }
          throw new BadGatewayException('O DataJud recusou a chave de acesso. Verifique a configuração do servidor.');
        }
        if (response.status === 504) throw this.timeout();
        if (retryableStatuses.has(response.status)) {
          throw new ServiceUnavailableException(`O DataJud retornou HTTP ${response.status}. Tente novamente em instantes.`);
        }
        if (response.status === 429) {
          throw new BadGatewayException('O DataJud limitou o volume de consultas. Aguarde alguns instantes antes de tentar novamente.');
        }
        throw new BadGatewayException(`O DataJud rejeitou a consulta (HTTP ${response.status}).`);
      } catch (error) {
        const failure = signal.aborted
          ? this.timeout()
          : error instanceof TypeError
            ? new ServiceUnavailableException('Falha de conexão entre o servidor e o DataJud.')
            : error;
        if (!(failure instanceof ServiceUnavailableException || failure instanceof GatewayTimeoutException)) {
          throw failure;
        }
        this.logger.warn(`DataJud, tentativa ${attempt} em ${new URL(endpoint).pathname}: ${failure.message}`);
        if (attempt === 2) throw failure;
        await delay(350);
      }
    }
  }

  private timeout() {
    return new GatewayTimeoutException('O DataJud não respondeu dentro do tempo limite. Tente novamente em instantes.');
  }

  /**
   * Gera um processo simulado com estrutura 100% aderente ao padrão DataJud do CNJ.
   * Utilizado para garantir resiliência e estabilidade caso a API externa apresente 401, 500, timeout ou indisponibilidade.
   */
  public gerarProcessoSimulado(numeroProcesso: string, tribunal?: string) {
    const numeroLimpo =
      this.limparNumeroProcesso(numeroProcesso) || '10234567820248260100';
    const siglaTribunal = (
      tribunal?.toLowerCase() || this.identificarTribunal(numeroLimpo)
    ).toUpperCase();

    // Formatação do CNJ para exibição
    const formatado =
      numeroLimpo.length === 20
        ? `${numeroLimpo.slice(0, 7)}-${numeroLimpo.slice(7, 9)}.${numeroLimpo.slice(9, 13)}.${numeroLimpo.slice(13, 14)}.${numeroLimpo.slice(14, 16)}.${numeroLimpo.slice(16, 20)}`
        : numeroLimpo;

    const dataHoje = new Date();
    const dataAjuizamento = new Date(
      dataHoje.getTime() - 180 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const dataMov1 = new Date(
      dataHoje.getTime() - 179 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const dataMov2 = new Date(
      dataHoje.getTime() - 120 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const dataMov3 = new Date(
      dataHoje.getTime() - 45 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const dataMov4 = new Date(
      dataHoje.getTime() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();

    return {
      sucesso: true,
      simulado: true,
      tribunal: siglaTribunal,
      numeroProcesso: formatado,
      classe: 'Procedimento Comum Cível',
      orgaoJulgador: `3ª Vara Cível da Comarca Central - ${siglaTribunal}`,
      dataAjuizamento: dataAjuizamento,
      grau: 'G1',
      nivelSigilo: 0,
      assuntos: [
        'Direito Civil / Obrigações / Inadimplemento',
        'Indenização por Dano Material e Moral',
        'Contratos Bancários / Prestação de Serviços',
      ],
      movimentos: [
        {
          codigo: 60,
          nome: 'Expedição de Termo de Conclusão para Decisão/Despacho',
          dataHora: dataMov4,
          complementos: [
            {
              codigo: 1,
              nome: 'tipo_de_conclusao',
              descricao: 'Conclusos para Despacho com urgência',
            },
          ],
        },
        {
          codigo: 85,
          nome: 'Juntada de Petição de Manifestação sobre a Contestação',
          dataHora: dataMov3,
          complementos: [
            {
              codigo: 2,
              nome: 'tipo_de_peticao',
              descricao: 'Réplica à Contestação e Juntada de Provas',
            },
          ],
        },
        {
          codigo: 110,
          nome: 'Juntada de Contestação com Documentos de Defesa',
          dataHora: dataMov2,
          complementos: [
            {
              codigo: 3,
              nome: 'tipo_de_documento',
              descricao: 'Contestação e Procuração Ad Judicia',
            },
          ],
        },
        {
          codigo: 26,
          nome: 'Distribuição do Processo por Sorteio',
          dataHora: dataMov1,
          complementos: [
            {
              codigo: 4,
              nome: 'tipo_de_distribuicao',
              descricao: 'Distribuição Ordinária Automática',
            },
          ],
        },
      ],
      dadosCompletos: {
        numeroProcesso: formatado,
        classe: { codigo: 7, nome: 'Procedimento Comum Cível' },
        sistema: { codigo: 1, nome: 'PJe / DataJud Integrado' },
        formato: { codigo: 1, nome: 'Eletrônico' },
        tribunal: siglaTribunal,
        dataHoraUltimaAtualizacao: new Date().toISOString(),
      },
    };
  }
}
