import { SCHEMAS, SUPPORTED_OS, RISK_LEVEL } from './constants.js';

function assertRequired(schemaName, obj) {
  const missing = SCHEMAS[schemaName].required.filter((k) => !(k in obj));
  if (missing.length) throw new Error(`${schemaName} missing required fields: ${missing.join(', ')}`);
}

export function validateManifest(manifest) {
  assertRequired('manifest', manifest);
  if (manifest.riskLevel !== RISK_LEVEL) throw new Error('manifest riskLevel must be benign');
  for (const os of manifest.supportedOs) {
    if (!SUPPORTED_OS.includes(os)) throw new Error(`unsupported OS in manifest: ${os}`);
  }
}

export function validateTemplate(template) {
  assertRequired('template', template);
  if (template.riskLevel !== RISK_LEVEL) throw new Error('template riskLevel must be benign');
  if (!Array.isArray(template.steps) || template.steps.length === 0) {
    throw new Error('template must include at least one step');
  }
}

export function validateProfile(profile) {
  assertRequired('profile', profile);
}

export function validateProject(project) {
  assertRequired('project', project);
  if (!Array.isArray(project.targets) || project.targets.length === 0) {
    throw new Error('project targets must be a non-empty array');
  }
}
