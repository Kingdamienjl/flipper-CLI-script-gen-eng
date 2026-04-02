import test from 'node:test';
import assert from 'node:assert/strict';
import { runStrongValidation } from '../lib/validation-command.js';
import { validateTemplate, validateManifest } from '../lib/schema-validator.js';

test('strong validation passes for benign repository content', () => {
  const result = runStrongValidation();
  assert.match(result, /passed/i);
});

test('validator blocks invalid step type', () => {
  assert.throws(() => validateTemplate({
    id: 'bad', title: 'bad', description: 'bad', tags: [], supportedOs: ['windows'], riskLevel: 'benign',
    steps: [{ type: 'oops', value: 'x' }],
  }));
});

test('manifest validator enforces benign risk', () => {
  assert.throws(() => validateManifest({
    templateId: 'x', title: 'x', description: 'x', tags: [], requiredVars: [], supportedOs: ['windows'], riskLevel: 'high',
  }));
});
