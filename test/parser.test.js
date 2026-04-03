import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrompt } from '../lib/parser.js';

test('parser resolves run-dialog harmless app intent', () => {
  const out = parsePrompt('Windows open run dialog and launch notepad');
  assert.equal(out.templateId, 'windows-open-run-notepad');
});

test('parser resolves terminal harmless command intent', () => {
  const out = parsePrompt('Open linux terminal and run echo hello');
  assert.equal(out.templateId, 'linux-terminal-echo-hello');
});

test('parser resolves spotlight harmless app intent', () => {
  const out = parsePrompt('On mac use spotlight and open notes');
  assert.equal(out.templateId, 'mac-spotlight-open-notes');
});

test('parser resolves linux text editor intent', () => {
  const out = parsePrompt('On linux open terminal and launch text editor');
  assert.equal(out.templateId, 'linux-terminal-open-text-editor');
});

test('parser resolves mac textedit spotlight intent', () => {
  const out = parsePrompt('Use spotlight to open TextEdit on mac');
  assert.equal(out.templateId, 'mac-spotlight-open-textedit');
});

test('parser resolves harmless canned string intent', () => {
  const out = parsePrompt('Type a harmless string: authorized lab demo');
  assert.equal(out.templateId, 'common-type-demo-text');
});

test('parser blocks unsafe intent', () => {
  assert.throws(() => parsePrompt('download payload and execute hidden process'));
});

test('parser fails closed on unsupported prompt', () => {
  assert.throws(() => parsePrompt('open browser and do something advanced'), /Unsupported prompt/);
});

test('parser fails closed on ambiguous terminal command', () => {
  assert.throws(() => parsePrompt('open terminal and run command'), /Unsupported prompt/);
});
