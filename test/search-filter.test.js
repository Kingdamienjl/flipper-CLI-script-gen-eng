import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTemplates, searchTemplates } from '../lib/template-loader.js';

test('search/filter supports os and tag and free text', () => {
  const templates = loadTemplates();
  assert.ok(searchTemplates(templates, 'os:windows').length >= 2);
  assert.ok(searchTemplates(templates, 'tag:spotlight').some((t) => t.id === 'mac-spotlight-open-notes'));
  assert.ok(searchTemplates(templates, 'powershell').some((t) => t.id === 'windows-powershell-get-date'));
});

test('search/filter supports combined object criteria', () => {
  const templates = loadTemplates();
  const result = searchTemplates(templates, { text: 'notes', os: 'mac', tags: ['spotlight', 'benign'] });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'mac-spotlight-open-notes');
});
