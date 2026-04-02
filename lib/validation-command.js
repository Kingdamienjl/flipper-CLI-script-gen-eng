import path from 'node:path';
import { listJsonFiles, readJson } from './file-utils.js';
import { validateManifest, validateProfile, validateProject, validateTemplate } from './schema-validator.js';
import { validateSafety } from './safety-validator.js';
import { loadTemplates } from './template-loader.js';

export function runStrongValidation() {
  const errors = [];

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

  for (const file of listJsonFiles(path.resolve('profiles'))) {
    try {
      validateProfile(readJson(file));
    } catch (e) {
      errors.push(e.message);
    }
  }

  for (const file of listJsonFiles(path.resolve('projects'))) {
    try {
      const data = readJson(file);
      validateProject(data);
      validateSafety(JSON.stringify(data), `project file ${file}`);
    } catch (e) {
      errors.push(e.message);
    }
  }

  try {
    loadTemplates();
  } catch (e) {
    errors.push(e.message);
  }

  if (errors.length) {
    throw new Error(`Strong validation failed:\n- ${errors.join('\n- ')}`);
  }

  return 'Strong validation passed: all templates/manifests/profiles/projects are safe and consistent.';
}
