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
    supportedOs: [...new Set([...(parent.supportedOs || []), ...(child.supportedOs || [])])],
    steps: [...(parent.steps || []), ...(child.steps || [])],
    vars: { ...(parent.vars || {}), ...(child.vars || {}) },
  };
}

function composeTemplate(target, composed) {
  return {
    ...target,
    tags: [...new Set([...(target.tags || []), ...(composed.tags || [])])],
    supportedOs: [...new Set([...(target.supportedOs || []), ...(composed.supportedOs || [])])],
    steps: [...(target.steps || []), ...(composed.steps || [])],
    vars: { ...(target.vars || {}), ...(composed.vars || {}) },
  };
}

export function loadTemplates() {
  const templateFiles = listJsonFiles(TEMPLATE_DIR);
  const manifestFiles = listJsonFiles(MANIFEST_DIR);

  const templatesById = new Map(templateFiles.map((f) => {
    const t = readJson(f);
    validateTemplate(t);
    return [t.id, t];
  }));

  const manifestsByTemplateId = new Map(manifestFiles.map((f) => {
    const m = readJson(f);
    validateManifest(m);
    return [m.templateId, m];
  }));

  const resolved = [];
  for (const [id, template] of templatesById.entries()) {
    let finalTemplate = { ...template };
    if (template.extends) {
      const parent = templatesById.get(template.extends);
      if (!parent) throw new Error(`template ${id} extends missing parent ${template.extends}`);
      finalTemplate = mergeExtension(parent, template);
    }

    if (Array.isArray(template.compose)) {
      for (const composedId of template.compose) {
        const composed = templatesById.get(composedId);
        if (!composed) throw new Error(`template ${id} composes missing template ${composedId}`);
        finalTemplate = composeTemplate(finalTemplate, composed);
      }
    }

    const manifest = manifestsByTemplateId.get(id);
    if (!manifest) throw new Error(`missing manifest for template ${id}`);

    validateSafety(JSON.stringify({ ...finalTemplate, manifest }), `template ${id}`);
    resolved.push({ ...finalTemplate, manifest });
  }

  return resolved;
}

export function searchTemplates(templates, query) {
  if (!query) return templates;
  const q = query.toLowerCase();

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
