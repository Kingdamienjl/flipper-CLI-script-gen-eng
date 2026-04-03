import path from 'node:path';
import { listJsonFiles, readJson } from './file-utils.js';
import { validateManifest, validateTemplate } from './schema-validator.js';
import { validateSafety } from './safety-validator.js';

const TEMPLATE_DIR = path.resolve('templates');
const MANIFEST_DIR = path.resolve('manifests/templates');

function mergeExtension(parent, child) {
  return {
    ...parent,
    ...child,
    tags: [...new Set([...(parent.tags || []), ...(child.tags || [])])],
    supportedOs: child.supportedOs || parent.supportedOs || [],
    steps: [...(parent.steps || []), ...(child.steps || [])],
    vars: { ...(parent.vars || {}), ...(child.vars || {}) },
    requiredVars: [...new Set([...(parent.requiredVars || []), ...(child.requiredVars || [])])],
  };
}

function composeTemplate(target, composed) {
  return {
    ...target,
    tags: [...new Set([...(target.tags || []), ...(composed.tags || [])])],
    supportedOs: target.supportedOs || [],
    steps: [...(target.steps || []), ...(composed.steps || [])],
    vars: { ...(target.vars || {}), ...(composed.vars || {}) },
    requiredVars: [...new Set([...(target.requiredVars || []), ...(composed.requiredVars || [])])],
  };
}

function resolveTemplate(id, templatesById, stack = new Set()) {
  if (stack.has(id)) {
    throw new Error(`Circular inheritance/composition detected: ${[...stack, id].join(' -> ')}`);
  }

  const template = templatesById.get(id);
  if (!template) throw new Error(`Unknown template referenced: ${id}`);

  stack.add(id);
  let resolved = { ...template };

  if (template.extends) {
    const parent = resolveTemplate(template.extends, templatesById, stack);
    resolved = mergeExtension(parent, resolved);
  }

  if (Array.isArray(template.compose)) {
    for (const composedId of template.compose) {
      const composed = resolveTemplate(composedId, templatesById, stack);
      resolved = composeTemplate(resolved, composed);
    }
  }

  stack.delete(id);
  return resolved;
}

function assertNoDuplicateId(map, id, kind) {
  if (map.has(id)) {
    throw new Error(`Duplicate ${kind} id detected: ${id}`);
  }
}

function validateTemplateManifestAlignment(template, manifest) {
  for (const os of template.supportedOs) {
    if (!manifest.supportedOs.includes(os)) {
      throw new Error(`manifest for ${template.id} missing supported OS from template: ${os}`);
    }
  }
  for (const requiredVar of template.requiredVars || []) {
    if (!manifest.requiredVars.includes(requiredVar)) {
      throw new Error(`manifest for ${template.id} missing requiredVar: ${requiredVar}`);
    }
  }
}

export function loadTemplates() {
  const templateFiles = listJsonFiles(TEMPLATE_DIR);
  const manifestFiles = listJsonFiles(MANIFEST_DIR);

  const templatesById = new Map();
  for (const file of templateFiles) {
    const template = readJson(file);
    validateTemplate(template);
    assertNoDuplicateId(templatesById, template.id, 'template');
    templatesById.set(template.id, template);
  }

  const manifestsByTemplateId = new Map();
  for (const file of manifestFiles) {
    const manifest = readJson(file);
    validateManifest(manifest);
    assertNoDuplicateId(manifestsByTemplateId, manifest.templateId, 'manifest template');
    manifestsByTemplateId.set(manifest.templateId, manifest);
  }

  const resolvedById = new Map();
  const resolved = [];
  for (const id of templatesById.keys()) {
    const finalTemplate = resolvedById.get(id) || resolveTemplate(id, templatesById);
    resolvedById.set(id, finalTemplate);
    const manifest = manifestsByTemplateId.get(id);
    if (!manifest) throw new Error(`missing manifest for template ${id}`);

    validateTemplateManifestAlignment(finalTemplate, manifest);
    validateSafety(JSON.stringify({ ...finalTemplate, manifest }), `template ${id}`);
    resolved.push({ ...finalTemplate, manifest });
  }

  return resolved;
}

export function searchTemplates(templates, query) {
  if (!query) return templates;
  const q = query.toLowerCase().trim();

  if (q.startsWith('os:')) {
    const os = q.slice(3);
    return templates.filter((t) => t.supportedOs.includes(os));
  }
  if (q.startsWith('tag:')) {
    const tag = q.slice(4);
    return templates.filter((t) => t.tags.map((x) => x.toLowerCase()).includes(tag));
  }

  return templates.filter((t) => [t.id, t.title, t.description, ...(t.tags || [])].join(' ').toLowerCase().includes(q));
}
