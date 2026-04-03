import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTemplates } from '../lib/template-loader.js';

test('template inheritance/composition merges parent/composed steps', () => {
  const templates = loadTemplates();
  const t = templates.find((x) => x.id === 'windows-open-run-notepad');
  assert.ok(t.steps.some((s) => s.type === 'delay' && s.value === 300));
  assert.ok(t.steps.some((s) => s.type === 'text' && String(s.value).includes('Authorized lab demo')));
});

test('template ids remain stable after composition', () => {
  const templates = loadTemplates();
  assert.ok(templates.find((t) => t.id === 'mac-spotlight-open-notes'));
});
