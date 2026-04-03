import test from 'node:test';
import assert from 'node:assert/strict';
import { getRenderer } from '../lib/renderer-registry.js';

const template = {
  steps: [
    { type: 'keys', value: 'GUI r' },
    { type: 'text', value: 'echo hello' },
    { type: 'delay', value: 200 },
  ],
};

test('flipper renderer emits normalized format', () => {
  const output = getRenderer('flipper').render(template);
  assert.match(output, /KEY GUI r/);
  assert.match(output, /STRING echo hello/);
});

test('ducky renderer emits normalized format', () => {
  const output = getRenderer('ducky').render(template);
  assert.match(output, /REM Ducky benign demo macro/);
  assert.match(output, /GUI r/);
});

test('renderer normalizes combo casing', () => {
  const output = getRenderer('flipper').render({ steps: [{ type: 'keys', value: 'ctrl ALT T' }] });
  assert.match(output, /KEY CTRL ALT t/);
});
