import path from 'node:path';
import { writeText } from './file-utils.js';
import { getRenderer } from './renderer-registry.js';
import { validateRequiredVars } from './schema-validator.js';
import { validateSafety } from './safety-validator.js';

export function generateOne({ template, format = 'flipper', vars = {}, os }) {
  if (os && !template.supportedOs.includes(os)) {
    throw new Error(`Template ${template.id} does not support OS ${os}`);
  }

  const requiredVars = [
    ...new Set([...(template.requiredVars || []), ...(template.manifest?.requiredVars || [])]),
  ];
  validateRequiredVars(requiredVars, vars, `template ${template.id}`);
  const renderer = getRenderer(format);
  const content = renderer.render(template, vars);

  if (!content.trim()) throw new Error(`Rendered output is empty for template ${template.id}`);
  validateSafety(content, `rendered output for ${template.id}`);

  const outputPath = path.resolve('payloads/generated', `${template.id}.${renderer.id}.txt`);
  writeText(outputPath, content);
  return { content, outputPath, format: renderer.id, templateId: template.id };
}

export function generateBatch({ templates, jobs }) {
  const outputs = [];
  for (const job of jobs) {
    const template = templates.find((t) => t.id === job.templateId);
    if (!template) throw new Error(`Batch template not found: ${job.templateId}`);
    outputs.push(generateOne({ template, format: job.format, vars: job.vars || {}, os: job.os }));
  }
  return outputs;
}
