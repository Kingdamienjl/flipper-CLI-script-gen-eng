import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadTemplates } from '../lib/template-loader.js';
import { loadProjectByName, generateFromProject, packProject, loadProfileByName } from '../lib/project-service.js';

test('project pack export writes checksum manifest', () => {
  const templates = loadTemplates();
  const project = loadProjectByName('demo-windows-project');
  const profile = loadProfileByName(project.profile);
  const outputs = generateFromProject(project, templates, profile);
  const packed = packProject(project, outputs);
  assert.equal(packed.manifest.riskLevel, 'benign');
  assert.equal(packed.manifest.projectId, project.id);
  assert.ok(Number.isInteger(packed.manifest.artifactCount));
  assert.ok(packed.manifest.artifacts.every((a) => a.sha256 && a.sha256.length === 64));
  assert.ok(packed.manifest.artifacts.every((a) => a.file.startsWith('payloads/')));
  assert.ok(fs.existsSync(`${packed.exportDir}/payloads/flipper`) || fs.existsSync(`${packed.exportDir}/payloads/ducky`));
});
