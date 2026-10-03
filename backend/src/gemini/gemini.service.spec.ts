import { describe, it, expect, vi } from 'vitest';
import { GeminiService } from './gemini.service.js';
function setup(text = 'Resposta jurídica de teste') {
  const service = new GeminiService();
  const generate = vi.fn().mockResolvedValue({ text });
  (service as any).aiClient = { models: { generateContent: generate } };
  return { service, generate };
}
const cases = [
  ['analisarProcessoIa', { conteudo_processual: 'Contrato fictício' }, 'analise'],
  ['resumirDocumento', { texto: 'Documento fictício' }, 'resumo'],
  ['encontrarJurisprudencia', { tema: 'Tema fictício' }, 'resultado'],
  ['criarPeca', { tipo_peca: 'Petição', fatos_contexto: 'Fatos fictícios' }, 'minuta'],
] as const;
describe('recursos de IA', () => {
  for (const [method, payload, output] of cases) {
    it(`${method}: retorna conteúdo e rejeita saída vazia/incompleta`, async () => {
      const {service, generate} = setup();
      expect((await (service[method] as any).call(service, payload))[output]).toContain('Resposta jurídica');
      generate.mockResolvedValue({text: '  '});
      await expect((service[method] as any).call(service, payload)).rejects.toThrow('não retornou conteúdo');
      generate.mockResolvedValue({text: 'Parcial', candidates: [{finishReason: 'MAX_TOKENS'}]});
      await expect((service[method] as any).call(service, payload)).rejects.toThrow('incompleta');
    });
  }
  it('não alterna modelos para chave inválida', async () => {
    const {service, generate} = setup(); generate.mockRejectedValue({status:401});
    await expect(service.resumirDocumento({texto:'Teste'})).rejects.toThrow();
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it('modelo inexistente usa fallback', async () => {
    const {service, generate} = setup(); generate.mockRejectedValueOnce({status:404});
    await expect(service.resumirDocumento({texto:'Teste'})).resolves.toMatchObject({sucesso:true});
    expect(generate).toHaveBeenCalledTimes(2);
  });
  it('prazos: regra explícita prevalece e termo ausente/conflito bloqueiam data', async () => {
    const result = {tem_prazo:true, descricao_providencia:'Cumprir', urgencia:'Média', quantidade_dias:120, tipo_contagem:'Dias úteis', data_limite_estimada:'2027-01-31'};
    const {service, generate} = setup(JSON.stringify(result));
    const valid = await service.extrairPrazos({texto_publicacao:'Intimação para responder em 120 dias corridos', data_publicacao:'2026-10-03'});
    expect(valid.dados_prazo.tipo_contagem).toBe('Dias corridos');
    expect(generate.mock.calls[0][0].contents).toContain('já definida pelo usuário');
    expect((await service.extrairPrazos({texto_publicacao:'Intimação para responder em 120 dias corridos'})).dados_prazo.data_limite_estimada).toBeUndefined();
    expect((await service.extrairPrazos({texto_publicacao:'Intimação para responder em 120 dias corridos',tipo_contagem:'uteis',data_publicacao:'2026-10-03'})).dados_prazo.data_limite_estimada).toBeUndefined();
    expect((await service.extrairPrazos({texto_publicacao:'Intimação para responder em 120 dias',data_publicacao:'2026-10-03'})).dados_prazo.data_limite_estimada).toBeUndefined();
  });
  it('prazos: rejeita JSON, data e quantidade inválidos; sem prazo não agenda', async () => {
    const {service,generate}=setup('Não é JSON');
    await expect(service.extrairPrazos({texto_publicacao:'Teste'})).rejects.toThrow('resposta inválida');
    const result={tem_prazo:true,descricao_providencia:'Cumprir',urgencia:'Média',quantidade_dias:10,data_limite_estimada:'2026-02-30'};
    generate.mockResolvedValue({text:JSON.stringify(result)});
    await expect(service.extrairPrazos({texto_publicacao:'Intimação para responder em 10 dias corridos',data_publicacao:'2026-10-03'})).rejects.toThrow('data inválida');
    generate.mockResolvedValue({text:JSON.stringify({...result,quantidade_dias:-1})});
    await expect(service.extrairPrazos({texto_publicacao:'Teste'})).rejects.toThrow('quantidade');
    generate.mockResolvedValue({text:JSON.stringify({...result,tem_prazo:false})});
    expect((await service.extrairPrazos({texto_publicacao:'Intimação para responder em 10 dias corridos',data_publicacao:'2026-10-03'})).dados_prazo.data_limite_estimada).toBeUndefined();
  });
});

it('cota diária não repete o mesmo modelo e preserva cooldown entre chamadas', async () => {
 const {service,generate}=setup();
 const quota={status:429,message:'GenerateRequestsPerDayPerProjectPerModel-FreeTier',error:{details:[{retryDelay:'36000s'}]}};
 generate.mockRejectedValue(quota);
 (service as any).sleep=async()=>{};
 await expect(service.resumirDocumento({texto:'Teste'})).rejects.toThrow('cota diária');
 expect(generate).toHaveBeenCalledTimes(3);
 await expect(service.resumirDocumento({texto:'Teste'})).rejects.toThrow('cota diária');
 expect(generate).toHaveBeenCalledTimes(3);
});
