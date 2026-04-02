import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { readJson, writeText } from './file-utils.js';
import { validateProject, validateProfile } from './schema-validator.js';
import { validateSafety } from './safety-validator.js';
import { getRenderer } from './renderer-registry.js';

export function loadProjectByName(projectName) {
  const file = path.resolve('projects', `${projectName}.json`);
  const project = readJson(file);
  validateProject(project);
  return project;
}

export function loadProfileByName(profileName) {
  const file = path.resolve('profiles', `${profileName}.json`);
  const profile = readJson(file);
  validateProfile(profile);
  return profile;
}

export function generateFromProject(project, templates) {
  const outputs = [];
  for (const target of project.targets) {
    const template = templates.find((t) => t.id === target.templateId);
    if (!template) throw new Error(`Project target template not found: ${target.templateId}`);

    const renderer = getRenderer(target.format || 'flipper');
    const vars = target.vars || {};
    const content = renderer.render(template, vars);
    validateSafety(content, `rendered output for ${template.id}`);

    const outputPath = path.resolve('payloads/generated', `${project.id}-${template.id}.${renderer.id}.txt`);
    writeText(outputPath, content);

    outputs.push({ templateId: template.id, format: renderer.id, outputPath, content });
  }
  return outputs;
}

export function packProject(project, outputs) {
  const exportName = `${project.id}-pack`;
  const exportDir = path.resolve('exports', exportName);
  fs.mkdirSync(exportDir, { recursive: true });

  const artifacts = outputs.map((o) => {
    const basename = path.basename(o.outputPath);
    const targetPath = path.resolve(exportDir, basename);
    fs.copyFileSync(o.outputPath, targetPath);
    const sha256 = crypto.createHash('sha256').update(o.content).digest('hex');
    return { file: basename, sha256, templateId: o.templateId, format: o.format };
  });

  const manifest = {
    exportName,
    authorizedUseOnly: true,
    riskLevel: 'benign',
    createdAt: new Date().toISOString(),
    artifacts,
  };
  const manifestPath = path.resolve(exportDir, 'export-manifest.json');
  writeText(manifestPath, JSON.stringify(manifest, null, 2));

  return { exportDir, manifestPath, manifest };
}
