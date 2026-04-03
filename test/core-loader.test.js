import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadTemplates } from '../lib/template-loader.js';

test('loader blocks circular inheritance', () => {
  const aPath = path.resolve('templates', 'tmp-circular-a.json');
  const bPath = path.resolve('templates', 'tmp-circular-b.json');
  const amPath = path.resolve('manifests/templates', 'tmp-circular-a.json');
  const bmPath = path.resolve('manifests/templates', 'tmp-circular-b.json');

  const base = {
    title: 'tmp',
    description: 'tmp',
    tags: ['tmp'],
    supportedOs: ['windows'],
    riskLevel: 'benign',
    steps: [{ type: 'keys', value: 'GUI r' }],
    requiredVars: [],
  };

  fs.writeFileSync(aPath, JSON.stringify({ ...base, id: 'tmp-circular-a', extends: 'tmp-circular-b' }, null, 2));
  fs.writeFileSync(bPath, JSON.stringify({ ...base, id: 'tmp-circular-b', extends: 'tmp-circular-a' }, null, 2));
  fs.writeFileSync(amPath, JSON.stringify({ templateId: 'tmp-circular-a', title: 'a', description: 'a', tags: ['tmp'], requiredVars: [], supportedOs: ['windows'], riskLevel: 'benign' }, null, 2));
  fs.writeFileSync(bmPath, JSON.stringify({ templateId: 'tmp-circular-b', title: 'b', description: 'b', tags: ['tmp'], requiredVars: [], supportedOs: ['windows'], riskLevel: 'benign' }, null, 2));

  try {
    assert.throws(() => loadTemplates(), /Circular inheritance\/composition detected/);
  } finally {
    [aPath, bPath, amPath, bmPath].forEach((f) => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  }
});
