import test from 'node:test';
import assert from 'node:assert/strict';
import { runStrongValidation } from '../lib/validation-command.js';

test('strong validation passes for benign repository content', () => {
  const result = runStrongValidation();
  assert.match(result, /passed/i);
});
