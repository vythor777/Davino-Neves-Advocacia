import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { AnalisarDocumentoDto } from './dto/analisar-documento.dto.js';
import { ResumirProcessoDto } from './dto/resumir-processo.dto.js';
import { ExtrairPrazosDto } from './dto/extrair-prazos.dto.js';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private aiClient: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new BadRequestException(
          'Chave de API do Gemini não configurada no ambiente (GEMINI_API_KEY).',
        );
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Realiza a análise jurídica de um documento (petição, contrato, sentença, parecer).
   */
  async analisarDocumento(dto: AnalisarDocumentoDto) {
    const ai = this.getClient();
    const { texto, tipo_documento, instrucoes } = dto;

    const systemInstruction = `Você é um assistente de inteligência artificial jurídica de alto nível para o escritório Davino & Neves Advocacia.
Sua missão é analisar documentos jurídicos (contratos, petições, sentenças, decisões, despachos, notificações) e fornecer uma análise estruturada, precisa e de alto valor prático para os advogados.
Analise a validade, pontos fortes, riscos processuais ou contratuais, obrigações, prazos implícitos/explícitos e forneça recomendações práticas objetivas.`;

    const prompt = `Tipo do Documento: ${tipo_documento || 'Não especificado'}
${instrucoes ? `Instruções Adicionais do Advogado: ${instrucoes}\n` : ''}
Texto do Documento a ser analisado:
---
${texto}
---

Por favor, forneça:
1. Resumo Executivo da Peça/Documento.
2. Identificação das Partes e Objeto Principal.
3. Principais Obrigações, Condenações ou Riscos Identificados.
4. Prazos Processuais e Ações Imediatas Recomendadas.
5. Estratégia Jurídica Sugerida para o Escritório.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return {
        sucesso: true,
        tipo_documento: tipo_documento || 'Geral',
        analise: response.text,
      };
    } catch (error: any) {
      this.logger.error('Erro ao analisar documento com Gemini:', error);
      throw new InternalServerErrorException(
        error?.message || 'Falha ao processar análise do documento via Gemini.',
      );
    }
  }

  /**
   * Gera um resumo executivo da linha do tempo e movimentações de um processo.
   */
  async resumirProcesso(dto: ResumirProcessoDto) {
    const ai = this.getClient();
    const { titulo, numero_processo, movimentacoes, publico_alvo } = dto;

    const publico = publico_alvo || 'advogado';
    const tomDeVoz =
      publico === 'cliente'
        ? 'Linguagem clara, amigável, livre de jargões jurídicos excessivos (linguagem simples/visual law), ideal para envio em relatório de status ao cliente.'
        : 'Linguagem técnica, focada em estratégia processual, status das fases recursais/probatórias e próximos passos para o advogado.';

    const systemInstruction = `Você é o especialista jurídico de IA do escritório Davino & Neves Advocacia.
Objetivo: Resumir o andamento processual com base no histórico de movimentações fornecido.
Público-alvo: ${publico.toUpperCase()} (${tomDeVoz})`;

    const prompt = `Processo: ${numero_processo || 'N/A'} - ${titulo || 'Processo'}
Histórico de Movimentações:
${JSON.stringify(movimentacoes, null, 2)}

Elabore um resumo conciso contendo:
- Situação atual do processo (Fase atual)
- O que aconteceu de mais relevante nas últimas movimentações
- Próximo passo esperado ou pendência
- Mensagem de status consolidada`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return {
        sucesso: true,
        publico_alvo: publico,
        resumo: response.text,
      };
    } catch (error: any) {
      this.logger.error('Erro ao resumir processo com Gemini:', error);
      throw new InternalServerErrorException(
        error?.message || 'Falha ao processar resumo do processo via Gemini.',
      );
    }
  }

  /**
   * Extrai prazos, datas fatais e providências a partir do texto de intimações/publicações do DJE.
   */
  async extrairPrazos(dto: ExtrairPrazosDto) {
    const ai = this.getClient();
    const { texto_publicacao, data_publicacao } = dto;

    const systemInstruction = `Você é um analista processual de controladoria jurídica do escritório Davino & Neves Advocacia.
Sua função é identificar prazos legais (CPC, CPP, CLT ou Juizados Especiais), providências necessárias, termos fatais e partes intimadas a partir de publicações e intimações judiciais.`;

    const prompt = `Data da Publicação/Disponibilização: ${data_publicacao || 'Não informada (assumir data atual)'}
Texto da Intimação/Publicação:
---
${texto_publicacao}
---

Extraia as informações estruturadas sobre o prazo.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tem_prazo: {
                type: Type.BOOLEAN,
                description: 'Se há prazo processual a ser cumprido.',
              },
              descricao_providencia: {
                type: Type.STRING,
                description: 'Qual a providência exigida (ex: Apresentar Réplica, Recolher Custas, Contrarrazões).',
              },
              quantidade_dias: {
                type: Type.INTEGER,
                description: 'Quantidade de dias úteis ou corridos estipulada.',
              },
              tipo_contagem: {
                type: Type.STRING,
                description: 'Dias úteis (CPC/CLT) ou dias corridos (CPP/ECA).',
              },
              data_limite_estimada: {
                type: Type.STRING,
                description: 'Data sugerida para vencimento do prazo no formato YYYY-MM-DD.',
              },
              urgencia: {
                type: Type.STRING,
                description: 'Nível de urgência: Baixa, Média, Alta ou Fatal.',
              },
              observacoes: {
                type: Type.STRING,
                description: 'Observações sobre feriados, suspensões ou cuidados especiais.',
              },
            },
            required: ['tem_prazo', 'descricao_providencia', 'urgencia'],
          },
        },
      });

      const parsedResult = JSON.parse(response.text?.trim() || '{}');

      return {
        sucesso: true,
        dados_prazo: parsedResult,
      };
    } catch (error: any) {
      this.logger.error('Erro ao extrair prazos com Gemini:', error);
      throw new InternalServerErrorException(
        error?.message || 'Falha ao extrair prazos via Gemini.',
      );
    }
  }
}
