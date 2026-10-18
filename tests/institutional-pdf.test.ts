import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInstitutionalPdf } from '../frontend/utils/institutionalPdf';

test('PDF renders Markdown headings, emphasis and lists without literal markers', () => {
  const doc = createInstitutionalPdf('Teste', '# Parecer\n## Análise\nTexto **importante** e *urgente*.\n* Documento\n1. Conferir 2026-10-18');
  const operations = Object.values(doc.internal.pages).flat().join('\n');
  assert.doesNotMatch(operations, /#{1,6}|\*\*/);
  assert.match(operations, /Parecer/);
  assert.match(operations, /importante/);
  assert.match(operations, /18\/10\/2026/);
});

test('long formatted documents paginate within the content area', () => {
  const doc = createInstitutionalPdf('Teste', ('## Fundamentação\nTexto **importante** para conferir a continuidade do documento.\n\n').repeat(100));
  assert.ok(doc.getNumberOfPages() > 1);
});
