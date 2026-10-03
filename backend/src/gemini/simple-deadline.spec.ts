import {it,expect} from 'vitest';
import {simpleDeadline} from './simple-deadline.js';
it('120 corridos, excluindo 03/10/2026, terminam em 31/01/2027',()=>expect(simpleDeadline('120 dias corridos','2026-10-03')?.data_limite_estimada).toBe('2027-01-31'));
it('120 úteis sem feriados, excluindo sábado 03/10, terminam em 19/03/2027',()=>expect(simpleDeadline('120 dias úteis','2026-10-03')?.data_limite_estimada).toBe('2027-03-19'));
it('pula fins de semana, cruza ano e aceita regra selecionada',()=>{
 expect(simpleDeadline('1 dia útil','2026-10-02')?.data_limite_estimada).toBe('2026-10-05');
 expect(simpleDeadline('1 dia','2026-12-31','corridos')?.data_limite_estimada).toBe('2027-01-01');
});
it('não interpreta intimações como calculadora nem decide regra ausente ou conflitante',()=>{
 expect(simpleDeadline('Intime-se para responder em 10 dias úteis','2026-10-03')).toBeUndefined();
 expect(simpleDeadline('120 dias','2026-10-03')?.data_limite_estimada).toBeUndefined();
 expect(simpleDeadline('120 dias corridos','2026-10-03','uteis')?.data_limite_estimada).toBeUndefined();
 expect(simpleDeadline('120 dias corridos')?.data_limite_estimada).toBeUndefined();
});
it('rejeita data inexistente e quantidade inválida',()=>{
 expect(()=>simpleDeadline('10 dias corridos','2026-02-30')).toThrow();
 expect(()=>simpleDeadline('0 dias corridos','2026-10-03')).toThrow();
});
