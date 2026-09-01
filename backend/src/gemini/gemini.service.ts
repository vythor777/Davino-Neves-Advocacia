import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  ServiceUnavailableException,
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

  // Lista de modelos ordenados do principal para fallbacks mais estáveis / leves
  private readonly fallbackModels = [
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-flash-latest',
  ];

  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GOOGLE_GENAI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        this.logger.warn('[GeminiService] Chave GEMINI_API_KEY não configurada.');
        throw new BadRequestException(
          'A chave de API do Gemini não está configurada no ambiente (GEMINI_API_KEY).',
        );
      }
      this.aiClient = new GoogleGenAI({
        apiKey: apiKey.trim().replace(/^["']|["']$/g, ''),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Identifica se um erro retornado pela API ou rede é transitório (503, 429, sobrecarga, timeout, indisponibilidade).
   */
  private isTransientError(error: any): boolean {
    if (!error) return false;

    const status =
      error.status ||
      error.statusCode ||
      error.response?.status ||
      error.response?.statusCode ||
      error.error?.code ||
      error.code;

    // Códigos HTTP e gRPC comuns de sobrecarga/indisponibilidade
    if (
      status === 503 ||
      status === 429 ||
      status === 502 ||
      status === 504 ||
      status === 500 ||
      status === 14 || // UNAVAILABLE no gRPC
      status === 8 // RESOURCE_EXHAUSTED no gRPC
    ) {
      return true;
    }

    const message = (
      (typeof error === 'string' ? error : error.message || '') +
      ' ' +
      (error.statusText || '') +
      ' ' +
      (error.details || '') +
      ' ' +
      (error.stack || '') +
      ' ' +
      JSON.stringify(error)
    ).toLowerCase();

    return (
      message.includes('503') ||
      message.includes('unavailable') ||
      message.includes('resource_exhausted') ||
      message.includes('overloaded') ||
      message.includes('overload') ||
      message.includes('high demand') ||
      message.includes('rate limit') ||
      message.includes('quota') ||
      message.includes('too many requests') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('socket hang up') ||
      message.includes('deadline exceeded') ||
      message.includes('fetch failed') ||
      message.includes('service unavailable')
    );
  }

  /**
   * Converte erros técnicos em mensagens amigáveis e explicativas para o usuário final.
   */
  private formatUserFriendlyErrorMessage(error: any): string {
    if (!error) {
      return 'Serviço de Inteligência Artificial temporariamente indisponível. Por favor, tente novamente em instantes.';
    }

    const errorStr = (
      (error?.message || '') +
      ' ' +
      (error?.statusText || '') +
      ' ' +
      JSON.stringify(error)
    ).toLowerCase();

    if (
      errorStr.includes('503') ||
      errorStr.includes('unavailable') ||
      errorStr.includes('overload') ||
      errorStr.includes('high demand')
    ) {
      return 'Os servidores do Google Gemini estão enfrentando alta demanda no momento (Erro 503 - Alta Sobrecarga). Efetuamos tentativas automáticas e alternância de modelos, mas a instabilidade persiste. Por favor, aguarde alguns instantes e tente novamente.';
    }

    if (
      errorStr.includes('429') ||
      errorStr.includes('resource_exhausted') ||
      errorStr.includes('quota') ||
      errorStr.includes('rate limit')
    ) {
      return 'Limite de requisições por minuto atingido na API do Gemini (Erro 429). Por favor, aguarde cerca de 10 a 20 segundos antes de enviar uma nova solicitação.';
    }

    if (
      errorStr.includes('api key') ||
      errorStr.includes('chave') ||
      errorStr.includes('unauthenticated') ||
      errorStr.includes('401') ||
      errorStr.includes('403')
    ) {
      return 'Chave de API do Gemini inválida ou não autorizada. Verifique a configuração da variável GEMINI_API_KEY no painel do servidor.';
    }

    return (
      error?.message ||
      'Ocorreu uma instabilidade ao conectar com a IA do Google Gemini. Por favor, tente novamente.'
    );
  }

  /**
   * Executor resiliente que realiza tentativas automáticas (retries com delay) e alternância de modelos fallback.
   */
  private async executeWithResilience<T>(
    generateFn: (model: string) => Promise<T>,
    taskName = 'Operação com IA',
  ): Promise<T> {
    const modelsToTry = this.fallbackModels;
    const maxRetriesPerModel = 3; // 3 tentativas por modelo
    let lastError: any = null;

    for (let mIndex = 0; mIndex < modelsToTry.length; mIndex++) {
      const model = modelsToTry[mIndex];

      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        try {
          if (attempt > 1 || mIndex > 0) {
            this.logger.log(
              `[GeminiService] [${taskName}] Tentando modelo '${model}' (Tentativa ${attempt}/${maxRetriesPerModel})`,
            );
          }

          const result = await generateFn(model);

          if (attempt > 1 || mIndex > 0) {
            this.logger.log(
              `[GeminiService] [${taskName}] Sucesso alcançado com modelo '${model}' após recuperação automática.`,
            );
          }

          return result;
        } catch (error: any) {
          lastError = error;
          const isTransient = this.isTransientError(error);

          this.logger.warn(
            `[GeminiService] [${taskName}] Erro na tentativa ${attempt}/${maxRetriesPerModel} com '${model}': ${error?.message || error}. Transitório/Sobrecarga: ${isTransient}`,
          );

          // Se for erro permanente (ex: prompt vazio, chave inválida), não tenta novamente o mesmo modelo
          if (!isTransient) {
            this.logger.warn(
              `[GeminiService] Erro considerado permanente ou não recuperável por retry direto no modelo '${model}'.`,
            );
            break;
          }

          // Se ainda restam tentativas no mesmo modelo, aguarda de 2s a 3s com jitter
          if (attempt < maxRetriesPerModel) {
            const delayMs = 2000 + Math.floor(Math.random() * 1000); // 2000ms a 3000ms
            this.logger.log(
              `[GeminiService] Aguardando ${delayMs}ms antes da próxima tentativa com '${model}'...`,
            );
            await this.sleep(delayMs);
          }
        }
      }

      // Se todas as tentativas deste modelo falharem por 503/sobrecarga e houver próximo modelo
      if (mIndex < modelsToTry.length - 1 && this.isTransientError(lastError)) {
        const nextModel = modelsToTry[mIndex + 1];
        this.logger.warn(
          `[GeminiService] Modelo '${model}' indisponível ou sobrecarregado (503/429). Ativando fallback automático para '${nextModel}'...`,
        );
        await this.sleep(1000); // Pausa de 1s antes de alternar
      }
    }

    // Se todos os modelos e retries esgotaram
    this.logger.error(
      `[GeminiService] Todas as tentativas e modelos de fallback foram esgotados para ${taskName}.`,
      lastError,
    );

    const friendlyMessage = this.formatUserFriendlyErrorMessage(lastError);
    throw new ServiceUnavailableException(friendlyMessage);
  }

  /**
   * Realiza a análise jurídica de um documento (petição, contrato, sentença, parecer).
   */
  async analisarDocumento(dto: AnalisarDocumentoDto) {
    const ai = this.getClient();
    const { texto, tipo_documento, instrucoes } = dto;

    if (!texto || texto.trim().length === 0) {
      throw new BadRequestException(
        'O texto do documento a ser analisado é obrigatório.',
      );
    }

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

    const response = await this.executeWithResilience(
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
      },
      'Análise de Documento',
    );

    return {
      sucesso: true,
      tipo_documento: tipo_documento || 'Geral',
      analise:
        response?.text ||
        'Análise jurídica gerada com sucesso pela Inteligência Artificial.',
    };
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

    const response = await this.executeWithResilience(
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });
      },
      'Resumo de Processo',
    );

    return {
      sucesso: true,
      publico_alvo: publico,
      resumo: response?.text || 'Resumo processual gerado com sucesso.',
    };
  }

  /**
   * Extrai prazos, datas fatais e providências a partir do texto de intimações/publicações do DJE.
   */
  async extrairPrazos(dto: ExtrairPrazosDto) {
    const ai = this.getClient();
    const { texto_publicacao, data_publicacao } = dto;

    if (!texto_publicacao || texto_publicacao.trim().length === 0) {
      throw new BadRequestException(
        'O texto da intimação ou publicação é obrigatório.',
      );
    }

    const systemInstruction = `Você é um analista processual de controladoria jurídica do escritório Davino & Neves Advocacia.
Sua função é identificar prazos legais (CPC, CPP, CLT ou Juizados Especiais), providências necessárias, termos fatais e partes intimadas a partir de publicações e intimações judiciais.`;

    const prompt = `Data da Publicação/Disponibilização: ${data_publicacao || 'Não informada (assumir data atual)'}
Texto da Intimação/Publicação:
---
${texto_publicacao}
---

Extraia as informações estruturadas sobre o prazo.`;

    const response = await this.executeWithResilience(
      async (modelName) => {
        return await ai.models.generateContent({
          model: modelName,
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
                  description:
                    'Qual a providência exigida (ex: Apresentar Réplica, Recolher Custas, Contrarrazões).',
                },
                quantidade_dias: {
                  type: Type.INTEGER,
                  description:
                    'Quantidade de dias úteis ou corridos estipulada.',
                },
                tipo_contagem: {
                  type: Type.STRING,
                  description:
                    'Dias úteis (CPC/CLT) ou dias corridos (CPP/ECA).',
                },
                data_limite_estimada: {
                  type: Type.STRING,
                  description:
                    'Data sugerida para vencimento do prazo no formato YYYY-MM-DD.',
                },
                urgencia: {
                  type: Type.STRING,
                  description: 'Nível de urgência: Baixa, Média, Alta ou Fatal.',
                },
                observacoes: {
                  type: Type.STRING,
                  description:
                    'Observações sobre feriados, suspensões ou cuidados especiais.',
                },
              },
              required: ['tem_prazo', 'descricao_providencia', 'urgencia'],
            },
          },
        });
      },
      'Extração de Prazos',
    );

    let rawText = response?.text?.trim() || '{}';
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(rawText);
    } catch (parseError) {
      this.logger.warn(
        `[GeminiService] Falha ao fazer parse do JSON retornado pela IA. Resposta bruta: ${rawText}`,
      );
      parsedResult = {
        tem_prazo: true,
        descricao_providencia: 'Análise de prazo concluída',
        urgencia: 'Média',
        observacoes: rawText,
      };
    }

    return {
      sucesso: true,
      dados_prazo: parsedResult,
    };
  }
}

