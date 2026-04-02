import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTemplates } from '../lib/template-loader.js';
import { loadProjectByName, generateFromProject, packProject, loadProfileByName } from '../lib/project-service.js';

test('project pack export writes checksum manifest', () => {
  const templates = loadTemplates();
  const project = loadProjectByName('demo-windows-project');
  const profile = loadProfileByName(project.profile);
  const outputs = generateFromProject(project, templates, profile);
  const packed = packProject(project, outputs);
  assert.equal(packed.manifest.riskLevel, 'benign');
  assert.ok(packed.manifest.artifacts.every((a) => a.sha256 && a.sha256.length === 64));
});
