import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { permissionsFor } from '../frontend/utils/permissions';
import { ProcessDataTable } from '../frontend/components/ProcessDataTable';
import type { Usuario } from '../frontend/services/authService';
const actor = (role: Usuario['role'], id = 2): Usuario => ({
  id,
  nome: 'Pessoa',
  email: 'p@example.test',
  role,
});
const rows = [
  {
    id_processo: 101,
    id_responsavel: 2,
    titulo: 'Próprio',
    numero_processo: '101',
  },
  {
    id_processo: 102,
    id_responsavel: 3,
    titulo: 'Vinculado',
    numero_processo: '102',
  },
];
const noop = () => {};
test('administrador possui ações administrativas; advogado não exclui nem edita processo vinculado', () => {
  const admin = permissionsFor(actor('ADMINISTRADOR'));
  const lawyer = permissionsFor(actor('ADVOGADO'));
  assert.equal(admin.canDelete, true);
  assert.equal(admin.canEditProcess(rows[1]), true);
  assert.equal(lawyer.canDelete, false);
  assert.equal(lawyer.canEditProcess(rows[0]), true);
  assert.equal(lawyer.canEditProcess(rows[1]), false);
  assert.equal(lawyer.canDownloadDocument, true);
});
test('estagiário e sessão ausente não recebem ações de processo, prazo, exclusão ou download', () => {
  for (const user of [actor('ESTAGIARIO'), null]) {
    const p = permissionsFor(user);
    for (const key of [
      'canCreateProcess',
      'canManageDeadline',
      'canDelete',
      'canDownloadDocument',
    ] as const)
      assert.equal(p[key], false);
    assert.equal(p.canEditProcess(rows[0]), false);
  }
});
test('tabela oculta edição por registro e exclusão para advogado/estagiário', () => {
  for (const role of ['ADMINISTRADOR', 'ADVOGADO', 'ESTAGIARIO'] as const) {
    const p = permissionsFor(actor(role));
    const markup = renderToStaticMarkup(
      <ProcessDataTable
        processos={rows}
        onEdit={noop}
        canEdit={p.canEditProcess}
        onDelete={p.canDelete ? noop : undefined}
      />,
    );
    const editCount = (markup.match(/title="Editar processo"/g) ?? []).length;
    const deleteCount = (markup.match(/title="Excluir processo"/g) ?? [])
      .length;
    assert.equal(
      editCount,
      role === 'ADMINISTRADOR' ? 2 : role === 'ADVOGADO' ? 1 : 0,
    );
    assert.equal(deleteCount, role === 'ADMINISTRADOR' ? 2 : 0);
  }
});
