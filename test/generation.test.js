import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTemplates } from '../lib/template-loader.js';
import { generateOne, generateBatch } from '../lib/generator.js';

test('single generation succeeds for supported OS', () => {
  const template = loadTemplates().find((t) => t.id === 'windows-open-run-notepad');
  const out = generateOne({ template, format: 'flipper', os: 'windows' });
  assert.match(out.content, /notepad/);
});

test('single generation blocks unsupported OS', () => {
  const template = loadTemplates().find((t) => t.id === 'windows-open-run-notepad');
  assert.throws(() => generateOne({ template, format: 'flipper', os: 'linux' }));
});

test('batch generation renders multiple outputs', () => {
  const templates = loadTemplates();
  const outputs = generateBatch({
    templates,
    jobs: [
      { templateId: 'windows-open-run-notepad', format: 'flipper', os: 'windows' },
      { templateId: 'linux-terminal-echo-hello', format: 'ducky', os: 'linux' }
    ],
  });
  assert.equal(outputs.length, 2);
});

test('generation enforces required vars from manifest/template', () => {
  const template = {
    id: 'tmp-required',
    supportedOs: ['windows'],
    requiredVars: ['message'],
    manifest: { requiredVars: ['message'] },
    steps: [{ type: 'text', value: '{{message}}' }],
  };

  assert.throws(() => generateOne({ template, format: 'flipper', os: 'windows', vars: {} }));
});
