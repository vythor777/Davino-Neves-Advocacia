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
import { EncontrarJurisprudenciaDto } from './dto/encontrar-jurisprudencia.dto.js';
import { CriarPecaDto } from './dto/criar-peca.dto.js';
import { AnalisarProcessoIaDto } from './dto/analisar-processo-ia.dto.js';
import { ResumirDocumentoDto } from './dto/resumir-documento.dto.js';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private aiClient: GoogleGenAI | null = null;

  // Lista de modelos ordenados do principal para fallbacks suportados pelo @google/genai
  private readonly fallbackModels = [
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
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

    const systemInstruction = `Você é um assistente de inteligência artificial jurídica de alto nível para o escritório Davino Neves Advocacia.
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

    const systemInstruction = `Você é o especialista jurídico de IA do escritório Davino Neves Advocacia.
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

    const systemInstruction = `Você é um analista processual de controladoria jurídica do escritório Davino Neves Advocacia.
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

  /**
   * Realiza a análise profunda de processo, autos, riscos e probabilidade de êxito.
   */
  async analisarProcessoIa(dto: AnalisarProcessoIaDto) {
    const ai = this.getClient();
    const { numero_processo, titulo, conteudo_processual, polo_cliente, foco_estrategico } = dto;

    if (!conteudo_processual || conteudo_processual.trim().length === 0) {
      throw new BadRequestException('O conteúdo ou síntese dos autos processuais é obrigatório.');
    }

    const systemInstruction = `Você é o Estrategista Jurídico de Inteligência Artificial do escritório Davino Neves Advocacia.
Sua missão é realizar uma análise analítica e profunda de autos processuais, peças adversas, decisões interlocutórias e sentenças.
Você deve identificar:
1. Objeto da lide e fatos controvertidos;
2. Teses da parte autora vs. teses da parte ré;
3. Pontos fortes e vulnerabilidades do cliente (Polo: ${polo_cliente || 'Definido no processo'});
4. Probabilidade estimada de êxito fundamentada (Favorável, Incerta/Média ou Desfavorável);
5. Riscos processuais imediatos (preclusão, sucumbência, revelia, penhora);
6. Próximos atos processuais recomendados e teses de defesa/ataque a serem exploradas.`;

    const prompt = `Processo: ${numero_processo || 'Não informado'} - ${titulo || 'Processo'}
Polo do Cliente: ${polo_cliente || 'Não especificado'}
${foco_estrategico ? `Foco Estratégico Solicitado: ${foco_estrategico}\n` : ''}
Autos / Conteúdo Processual:
---
${conteudo_processual}
---

Por favor, forneça uma análise estruturada, técnica e com alto nível de acurácia jurídica.`;

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
      'Análise de Processo IA',
    );

    return {
      sucesso: true,
      numero_processo: numero_processo || null,
      analise: response?.text || 'Análise processual concluída com sucesso.',
    };
  }

  /**
   * Gera resumo conciso e estruturado de qualquer documento jurídico (petição, sentença, acórdão, contrato).
   */
  async resumirDocumento(dto: ResumirDocumentoDto) {
    const ai = this.getClient();
    const { texto, tipo_documento, formato_resumo } = dto;

    if (!texto || texto.trim().length === 0) {
      throw new BadRequestException('O texto do documento a ser resumido é obrigatório.');
    }

    const formato = formato_resumo || 'executivo';
    const orientacaoFormato =
      formato === 'cliente_simples'
        ? 'Linguagem simples (Visual Law / plain language), sem termos em latim ou juridiquês, pronto para ser encaminhado diretamente via WhatsApp ou e-mail ao cliente.'
        : formato === 'topicos_estrategicos'
        ? 'Tópicos curtos em bullet points: Fatos Principais, Decisão/Dispositivo, Valores Envolvidos, Prazos e Providências Imediatas.'
        : 'Resumo executivo completo para advogados, destacando ratio decidendi, fundamentos legais e implicações práticas.';

    const systemInstruction = `Você é o Especialista em Síntese Jurídica de IA do escritório Davino Neves Advocacia.
Objetivo: Transformar documentos jurídicos extensos em resumos claros, precisos e diretamente acionáveis.
Diretriz de Formatação: ${orientacaoFormato}`;

    const prompt = `Tipo do Documento: ${tipo_documento || 'Documento Jurídico'}
Texto Original:
---
${texto}
---

Elabore o resumo estruturado conforme as instruções.`;

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
      'Resumo de Documento IA',
    );

    return {
      sucesso: true,
      tipo_documento: tipo_documento || 'Geral',
      formato_resumo: formato,
      resumo: response?.text || 'Resumo do documento gerado com sucesso.',
    };
  }

  /**
   * Encontra teses jurisprudenciais, precedentes de tribunais superiores e súmulas aplicáveis.
   */
  async encontrarJurisprudencia(dto: EncontrarJurisprudenciaDto) {
    const ai = this.getClient();
    const { tema, ramo_direito, tribunal_alvo, tese_pretendida } = dto;

    if (!tema || tema.trim().length === 0) {
      throw new BadRequestException('O tema ou controvérsia para pesquisa de jurisprudência é obrigatório.');
    }

    const systemInstruction = `Você é o Especialista em Jurisprudência e Precedentes Qualificados de IA do escritório Davino Neves Advocacia.
Sua missão é mapear e estruturar teses consolidadas do STF, STJ, TST, TRFs e Tribunais de Justiça Estaduais (especialmente TJSP, TJRJ, TJMG, TJBA).
Para a consulta fornecida, estruture:
1. Tese Jurídica Predominante e Tendência Atual dos Tribunais;
2. Súmulas Aplicáveis (Vinculantes, STF, STJ, TST);
3. Precedentes Qualificados / Temas Repetitivos / IRDR relevantes;
4. Modelos de Ementas Exemplificativas com indicação de órgão julgador, relator e fundamentos legais;
5. Argumentos e Distinguishing recomendados para fundamentar a peça processual.`;

    const prompt = `Tema / Controvérsia: ${tema}
${ramo_direito ? `Ramo do Direito: ${ramo_direito}\n` : ''}
${tribunal_alvo ? `Tribunal Alvo Preferencial: ${tribunal_alvo}\n` : ''}
${tese_pretendida ? `Tese / Linha Argumentativa Pretendida: ${tese_pretendida}\n` : ''}

Apresente a pesquisa jurisprudencial completa, estruturada e com fundamentação legal aplicável.`;

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
      'Pesquisa de Jurisprudência IA',
    );

    return {
      sucesso: true,
      tema,
      resultado: response?.text || 'Pesquisa jurisprudencial gerada com sucesso.',
    };
  }

  /**
   * Cria minuta estruturada de peça processual (petição inicial, contestação, recurso, notificação).
   */
  async criarPeca(dto: CriarPecaDto) {
    const ai = this.getClient();
    const { tipo_peca, fatos_contexto, polos_partes, pedidos_especificos, jurisprudencia_referencia, tribunal_foro } = dto;

    if (!tipo_peca || !fatos_contexto) {
      throw new BadRequestException('O tipo da peça e os fatos/contexto são obrigatórios para a redação.');
    }

    const systemInstruction = `Você é o Redator Jurídico de IA de excelência do escritório Davino Neves Advocacia.
Sua missão é elaborar minutas completas, elegantes e com fundamentação técnica impecável conforme o Código de Processo Civil (CPC), CLT ou CPP.
Estruture a peça com:
- Endereçamento ao Juízo/Tribunal Competente;
- Qualificação das partes (indicando placeholders [NOME], [CPF/CNPJ] para dados faltantes);
- Síntese fática clara e cronológica;
- Fundamentação jurídica sólida (leis, princípios, doutrina e jurisprudência);
- Tutela de urgência/evidência se aplicável;
- Rol de Pedidos e Requerimentos finais claros, líquidos ou especificados;
- Valor da causa e fechamento formal com data e OAB.`;

    const prompt = `Tipo de Peça: ${tipo_peca}
Endereçamento / Tribunal: ${tribunal_foro || 'Juízo Competente'}
Partes: ${polos_partes || 'Cliente vs. Parte Adversa'}
Fatos e Contexto do Caso:
---
${fatos_contexto}
---
${pedidos_especificos ? `Pedidos Específicos Solicitados: ${pedidos_especificos}\n` : ''}
${jurisprudencia_referencia ? `Jurisprudência/Tese a incorporar: ${jurisprudencia_referencia}\n` : ''}

Elabore a minuta jurídica completa pronta para revisão do advogado.`;

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
      'Criação de Peça Jurídica IA',
    );

    return {
      sucesso: true,
      tipo_peca,
      minuta: response?.text || 'Minuta jurídica gerada com sucesso.',
    };
  }
}

