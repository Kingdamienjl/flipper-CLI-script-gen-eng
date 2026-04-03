import path from 'node:path';
import { listJsonFiles, readJson } from './file-utils.js';
import { validateBatch, validateManifest, validateProfile, validateProject, validateTemplate } from './schema-validator.js';
import { validateSafety } from './safety-validator.js';
import { loadTemplates } from './template-loader.js';

function validateExportManifest(manifest, file) {
  if (!manifest.authorizedUseOnly) throw new Error(`export manifest ${file} must set authorizedUseOnly=true`);
  if (manifest.riskLevel !== 'benign') throw new Error(`export manifest ${file} riskLevel must be benign`);
  if (!Array.isArray(manifest.artifacts)) throw new Error(`export manifest ${file} artifacts must be array`);
}

export function runStrongValidation() {
  const errors = [];
  let resolvedTemplates = [];

  for (const file of listJsonFiles(path.resolve('templates'))) {
    try {
      const data = readJson(file);
      validateTemplate(data);
      validateSafety(JSON.stringify(data), `template file ${file}`);
    } catch (e) {
      errors.push(e.message);
    }
  }

  for (const file of listJsonFiles(path.resolve('manifests/templates'))) {
    try {
      const data = readJson(file);
      validateManifest(data);
      validateSafety(JSON.stringify(data), `manifest file ${file}`);
    } catch (e) {
      errors.push(e.message);
    }
  }

  for (const file of listJsonFiles(path.resolve('manifests/exports'))) {
    try {
      const data = readJson(file);
      validateExportManifest(data, file);
    } catch (e) {
      errors.push(e.message);
    }
  }

  for (const file of listJsonFiles(path.resolve('profiles'))) {
    try {
      validateProfile(readJson(file));
    } catch (e) {
      errors.push(e.message);
    }
  }

  try {
    resolvedTemplates = loadTemplates();
  } catch (e) {
    errors.push(e.message);
  }

  for (const file of listJsonFiles(path.resolve('projects'))) {
    try {
      const data = readJson(file);
      if (Array.isArray(data.jobs)) {
        validateBatch(data);
        for (const job of data.jobs) {
          const template = resolvedTemplates.find((t) => t.id === job.templateId);
          if (!template) throw new Error(`batch job references missing template: ${job.templateId}`);
          if (job.os && !template.supportedOs.includes(job.os)) {
            throw new Error(`batch job template ${job.templateId} does not support os ${job.os}`);
          }
        }
        continue;
      }
      validateProject(data);
      validateSafety(JSON.stringify(data), `project file ${file}`);
      for (const target of data.targets) {
        const template = resolvedTemplates.find((t) => t.id === target.templateId);
        if (!template) throw new Error(`project target references missing template: ${target.templateId}`);
        if (target.os && !template.supportedOs.includes(target.os)) {
          throw new Error(`project target ${target.templateId} does not support os ${target.os}`);
        }
      }
    } catch (e) {
      errors.push(e.message);
    }
  }

  if (errors.length) throw new Error(`Strong validation failed:\n- ${errors.join('\n- ')}`);

  return 'Strong validation passed: all templates/manifests/profiles/projects are safe and consistent.';
}
