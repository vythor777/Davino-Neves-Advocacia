import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProcessDataTable } from '../frontend/components/ProcessDataTable';

for (const timezone of ['America/Sao_Paulo', 'America/Manaus', 'UTC', 'Asia/Tokyo']) {
  test(`a data civil da distribuição permanece correta em ${timezone}`, () => {
    const previous = process.env.TZ;
    process.env.TZ = timezone;
    try {
      const html = renderToStaticMarkup(React.createElement(ProcessDataTable, {
        processos: [{ id_processo: 1, titulo: 'Processo fictício de teste', data_abertura: '2026-09-08T00:00:00.000Z' }],
      }));
      assert.ok(html.includes('08/09/2026'));
      assert.ok(!html.includes('07/09/2026'));
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });
}
