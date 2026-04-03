import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { readJson, writeText } from './file-utils.js';
import { validateProject, validateProfile } from './schema-validator.js';
import { generateOne } from './generator.js';

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

export function generateFromProject(project, templates, profile = { defaults: {} }) {
  const outputs = [];
  for (const target of project.targets) {
    const template = templates.find((t) => t.id === target.templateId);
    if (!template) throw new Error(`Project target template not found: ${target.templateId}`);

    const mergedVars = { ...(profile.defaults || {}), ...(target.vars || {}) };
    const rendered = generateOne({
      template,
      format: target.format || 'flipper',
      vars: mergedVars,
      os: target.os,
    });

    const outputPath = path.resolve('payloads/generated', `${project.id}-${template.id}.${rendered.format}.txt`);
    writeText(outputPath, rendered.content);
    outputs.push({ ...rendered, outputPath });
  }
  return outputs;
}

export function packProject(project, outputs) {
  const exportName = `${project.id}-pack`;
  const exportDir = path.resolve('exports', exportName);
  const payloadRoot = path.resolve(exportDir, 'payloads');
  fs.mkdirSync(exportDir, { recursive: true });
  fs.mkdirSync(payloadRoot, { recursive: true });

  const artifacts = outputs.map((o) => {
    const basename = path.basename(o.outputPath);
    const formatDir = path.resolve(payloadRoot, o.format);
    fs.mkdirSync(formatDir, { recursive: true });

    // Flipper-friendly structure keeps per-format payload files grouped under payloads/<format>/.
    const targetPath = path.resolve(formatDir, basename);
    fs.copyFileSync(o.outputPath, targetPath);
    const sha256 = crypto.createHash('sha256').update(o.content).digest('hex');
    const sizeBytes = Buffer.byteLength(o.content, 'utf8');
    return {
      file: path.relative(exportDir, targetPath),
      sha256,
      sizeBytes,
      templateId: o.templateId,
      format: o.format,
    };
  });

  const manifest = {
    exportName,
    projectId: project.id,
    projectTitle: project.title,
    authorizedUseOnly: true,
    riskLevel: 'benign',
    createdAt: new Date().toISOString(),
    artifactCount: artifacts.length,
    artifacts,
  };
  const manifestPath = path.resolve(exportDir, 'export-manifest.json');
  writeText(manifestPath, JSON.stringify(manifest, null, 2));

  return { exportDir, manifestPath, manifest };
}
