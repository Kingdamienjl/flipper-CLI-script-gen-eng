import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrompt } from '../lib/parser.js';

test('parser resolves benign windows notepad intent', () => {
  const out = parsePrompt('Windows: open run dialog and launch notepad');
  assert.equal(out.templateId, 'windows-open-run-notepad');
});

test('parser blocks unsafe intent', () => {
  assert.throws(() => parsePrompt('download payload and execute hidden process'));
});
