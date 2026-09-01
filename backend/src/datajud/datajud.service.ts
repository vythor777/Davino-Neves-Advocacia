import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConsultarProcessoDto } from './dto/consultar-processo.dto.js';

@Injectable()
export class DataJudService {
  private readonly logger = new Logger(DataJudService.name);
  private readonly baseUrl =
    process.env.DATAJUD_API_URL || 'https://api-publica.datajud.cnj.jus.br';
  private readonly apiKey =
    process.env.DATAJUD_API_KEY ||
    'cDZHYzlZa0JadVREZDJCendQbXZ6YVpmOjE1MDExNWVlLTczYjctNGNiZi1iOWJhLTI4YjQ4ZDRjNzM2NQ==';

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

    const siglaTribunal =
      tribunal?.toLowerCase() || this.identificarTribunal(numeroLimpo);

    const endpoint = `${this.baseUrl}/api_publica_${siglaTribunal}/_search`;

    this.logger.log(
      `Consultando processo ${numeroLimpo} no tribunal ${siglaTribunal} (${endpoint})`,
    );

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `APIKey ${this.apiKey}`,
        },
        body: JSON.stringify({
          query: {
            match: {
              numeroProcesso: numeroLimpo,
            },
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new NotFoundException(
            `Tribunal ${siglaTribunal.toUpperCase()} ou processo não encontrado na API do DataJud.`,
          );
        }
        if (response.status === 401 || response.status === 403) {
          throw new InternalServerErrorException(
            'Chave de API do DataJud inválida ou não autorizada.',
          );
        }
        throw new InternalServerErrorException(
          `Erro na resposta do DataJud (HTTP ${response.status}).`,
        );
      }

      const data = await response.json();
      const hits = data?.hits?.hits || [];

      if (hits.length === 0) {
        throw new NotFoundException(
          `Nenhum registro encontrado para o processo ${numero_processo} no tribunal ${siglaTribunal.toUpperCase()}.`,
        );
      }

      const processoData = hits[0]._source;

      return {
        sucesso: true,
        tribunal: siglaTribunal.toUpperCase(),
        numeroProcesso: processoData.numeroProcesso,
        classe: processoData.classe?.nome,
        orgaoJulgador: processoData.orgaoJulgador?.nome,
        dataAjuizamento: processoData.dataAjuizamento,
        grau: processoData.grau,
        nivelSigilo: processoData.nivelSigilo,
        assuntos: processoData.assuntos?.map((a: any) => a.nome) || [],
        movimentos: (processoData.movimentos || []).map((m: any) => ({
          codigo: m.codigo,
          nome: m.nome,
          dataHora: m.dataHora,
          complementos: m.complementosTabelados || [],
        })),
        dadosCompletos: processoData,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error('Erro na consulta ao DataJud:', error);
      throw new InternalServerErrorException(
        'Falha ao conectar com o serviço DataJud do CNJ.',
      );
    }
  }
}
