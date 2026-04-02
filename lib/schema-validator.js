import { SCHEMAS, SUPPORTED_OS, RISK_LEVEL, STEP_TYPES } from './constants.js';
import { normalizeCombo } from './key-utils.js';

function assertRequired(schemaName, obj) {
  const missing = SCHEMAS[schemaName].required.filter((k) => !(k in obj));
  if (missing.length) throw new Error(`${schemaName} missing required fields: ${missing.join(', ')}`);
}

function ensureArray(name, value) {
  if (!Array.isArray(value)) throw new Error(`${name} must be an array`);
}

function validateSupportedOs(list, context) {
  ensureArray(`${context}.supportedOs`, list);
  if (!list.length) throw new Error(`${context}.supportedOs cannot be empty`);
  for (const os of list) {
    if (!SUPPORTED_OS.includes(os)) throw new Error(`unsupported OS in ${context}: ${os}`);
  }
}

function validateSteps(steps, context) {
  ensureArray(`${context}.steps`, steps);
  if (!steps.length) throw new Error(`${context} must include at least one step`);

  steps.forEach((step, idx) => {
    if (!STEP_TYPES.includes(step.type)) throw new Error(`${context} step ${idx} has unsupported type ${step.type}`);

    if (step.type === 'keys') {
      normalizeCombo(step.value);
    }

    if (step.type === 'text') {
      if (typeof step.value !== 'string' || !step.value.trim()) {
        throw new Error(`${context} step ${idx} text value must be non-empty string`);
      }
    }

    if (step.type === 'delay') {
      if (!Number.isInteger(step.value) || step.value < 0 || step.value > 60000) {
        throw new Error(`${context} step ${idx} delay must be integer 0-60000`);
      }
    }
  });
}

export function validateManifest(manifest) {
  assertRequired('manifest', manifest);
  if (manifest.riskLevel !== RISK_LEVEL) throw new Error('manifest riskLevel must be benign');
  validateSupportedOs(manifest.supportedOs, `manifest ${manifest.templateId}`);
  ensureArray('manifest.requiredVars', manifest.requiredVars);
}

export function validateTemplate(template) {
  assertRequired('template', template);
  if (template.riskLevel !== RISK_LEVEL) throw new Error('template riskLevel must be benign');
  validateSupportedOs(template.supportedOs, `template ${template.id}`);
  validateSteps(template.steps, `template ${template.id}`);
  if (template.requiredVars && !Array.isArray(template.requiredVars)) {
    throw new Error(`template ${template.id} requiredVars must be an array when provided`);
  }
}

export function validateProfile(profile) {
  assertRequired('profile', profile);
  if (typeof profile.defaults !== 'object' || profile.defaults === null || Array.isArray(profile.defaults)) {
    throw new Error(`profile ${profile.id} defaults must be an object`);
  }
}

export function validateProject(project) {
  assertRequired('project', project);
  ensureArray('project.targets', project.targets);
  if (!project.targets.length) throw new Error('project targets must be a non-empty array');

  for (const target of project.targets) {
    if (!target.templateId) throw new Error('project target missing templateId');
    if (target.format && !['flipper', 'ducky'].includes(target.format)) {
      throw new Error(`unsupported project target format: ${target.format}`);
    }
  }
}

export function validateRequiredVars(requiredVars, vars, context) {
  for (const key of requiredVars || []) {
    if (!Object.hasOwn(vars || {}, key) || String(vars[key]).trim() === '') {
      throw new Error(`${context} missing required var: ${key}`);
    }
  }
}

export function validateBatch(batch) {
  if (!Array.isArray(batch.jobs) || batch.jobs.length === 0) {
    throw new Error('batch.jobs must be a non-empty array');
  }
  for (const job of batch.jobs) {
    if (!job.templateId) throw new Error('batch job missing templateId');
    if (job.format && !['flipper', 'ducky'].includes(job.format)) {
      throw new Error(`unsupported batch format: ${job.format}`);
    }
  }
}
