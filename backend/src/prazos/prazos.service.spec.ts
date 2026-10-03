import { describe, it, expect, vi } from 'vitest';
import { PrazosService } from './prazos.service.js';
const actor = { id_usuario: 1, nome: 'Admin', role: 'ADMINISTRADOR' as const };
const dto = { descricao: 'Teste', data_vencimento: '2027-01-31', hora: '18:00', tipoCompromisso: 'Prazo Fatal', status: 'Pendente', id_processo: 3, id_responsavel: 2, responsavel: 'Nome adulterado' };
function setup(ativo = true) {
  const prisma = { usuario: { findUnique: vi.fn().mockResolvedValue({ id_usuario: 2, nome: 'Advogada', role: 'ADVOGADO', ativo }) }, prazo: { create: vi.fn().mockImplementation(x => x.data) } };
  const access = { requireRole: vi.fn(), process: vi.fn().mockResolvedValue({}) };
  return { prisma, access, service: new PrazosService(prisma as never, access as never) };
}
describe('responsável vinculado ao prazo', () => {
  it('salva o ID e o nome oficial da equipe', async () => {
    const {service, access} = setup();
    expect(await service.create(dto, actor)).toMatchObject({id_responsavel: 2, responsavel: 'Advogada'});
    expect(access.process).toHaveBeenCalledTimes(2);
  });
  it('rejeita usuário inativo antes de gravar', async () => {
    const {service, prisma} = setup(false);
    await expect(service.create(dto, actor)).rejects.toThrow('ativo');
    expect(prisma.prazo.create).not.toHaveBeenCalled();
  });
  it('rejeita responsável sem acesso ao processo', async () => {
    const {service, prisma, access} = setup();
    access.process.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Sem acesso'));
    await expect(service.create(dto, actor)).rejects.toThrow('Sem acesso');
    expect(prisma.prazo.create).not.toHaveBeenCalled();
  });
});
