import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { processCategories } from '../frontend/utils/processCategories';
import { ClientClassificationFields } from '../frontend/components/clientes/ClientClassificationFields';
import { PROCESS_CATEGORIES } from '../backend/dist/processos/dto/create-processo.dto.js';

test('opções do formulário e da API estão alinhadas', () => {
  assert.deepEqual(Object.keys(processCategories), [...PROCESS_CATEGORIES]);
});
test('sugestões são da categoria selecionada e campo permite texto livre', () => {
  for (const [category, example] of [['Cível', 'Divórcio'], ['Trabalhista', 'Insalubridade'], ['Previdenciário', 'Benefício BPC/LOAS']]) {
    const html = renderToStaticMarkup(<ClientClassificationFields category={category} subcategory={example} onChange={() => {}} />);
    assert.ok(processCategories[category].includes(example));
    assert.ok(html.includes('role="combobox"'));
    assert.ok(!html.includes('<datalist'));
    assert.ok(html.includes('Use uma sugestão ou digite outra subcategoria.'));
    if (category !== 'Trabalhista') assert.ok(!html.includes('<option value="Insalubridade">'));
  }
});
test('sem categoria a subcategoria permanece desabilitada', () => {
  const html = renderToStaticMarkup(<ClientClassificationFields category="" subcategory="" onChange={() => {}} />);
  assert.match(html, /id="cliente-subcategoria"[^>]*disabled=""/);
});
