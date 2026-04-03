#!/usr/bin/env node
import path from 'node:path';
import { loadTemplates, searchTemplates } from '../lib/template-loader.js';
import { parsePrompt } from '../lib/parser.js';
import { writeText, readJson } from '../lib/file-utils.js';
import { loadProfileByName, loadProjectByName, generateFromProject, packProject } from '../lib/project-service.js';
import { runStrongValidation } from '../lib/validation-command.js';
import { generateBatch, generateOne } from '../lib/generator.js';

function arg(name) {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return null;
  return process.argv[idx + 1] || true;
}

function has(name) {
  return process.argv.includes(name);
}

function parseVars(input) {
  if (!input) return {};
  try {
    return JSON.parse(String(input));
  } catch {
    throw new Error('--vars must be a valid JSON object');
  }
}

function printHelp() {
  console.log(`flipper-safe-gen V4

Options:
  --list-templates
  --search <query>
  --search-text <text> [--search-os <os>] [--search-tag <tag[,tag2...]>]
  --preview <templateId> [--format flipper|ducky] [--os windows|linux|mac] [--vars '{"k":"v"}']
  --prompt <benign request> [--format flipper|ducky] [--os windows|linux|mac]
  --batch <batchFile>
  --project <projectPresetName>
  --validate
  --pack <projectPresetName>`);
}

function getTemplate(templates, id) {
  const t = templates.find((x) => x.id === id);
  if (!t) throw new Error(`Template not found: ${id}`);
  return t;
}

async function main() {
  const templates = loadTemplates();

  if (has('--list-templates')) {
    for (const t of templates) {
      console.log(`${t.id} | ${t.title} | os=${t.supportedOs.join(',')} | tags=${t.tags.join(',')}`);
    }
    return;
  }

  if (has('--search')) {
    const q = arg('--search');
    const result = searchTemplates(templates, String(q || ''));
    result.forEach((t) => console.log(`${t.id}: ${t.description}`));
    return;
  }

  if (has('--search-text') || has('--search-os') || has('--search-tag')) {
    const text = has('--search-text') ? String(arg('--search-text') || '') : '';
    const os = has('--search-os') ? String(arg('--search-os') || '') : '';
    const tags = has('--search-tag')
      ? String(arg('--search-tag') || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
      : [];

    const result = searchTemplates(templates, { text, os, tags });
    result.forEach((t) => console.log(`${t.id}: ${t.description}`));
    return;
  }

  if (has('--preview')) {
    const template = getTemplate(templates, String(arg('--preview')));
    const format = String(arg('--format') || 'flipper');
    const os = arg('--os') ? String(arg('--os')) : undefined;
    const vars = parseVars(arg('--vars'));
    const rendered = generateOne({ template, format, vars, os });
    console.log(rendered.content);
    return;
  }

  if (has('--prompt')) {
    const format = String(arg('--format') || 'flipper');
    const os = arg('--os') ? String(arg('--os')) : undefined;
    const p = String(arg('--prompt') || '');
    const parsed = parsePrompt(p);
    const template = getTemplate(templates, parsed.templateId);
    const rendered = generateOne({ template, format, vars: parsed.vars, os });
    const outPath = path.resolve('payloads/generated', `prompt-${template.id}.${format}.txt`);
    writeText(outPath, rendered.content);
    console.log(`Generated from prompt -> ${outPath}`);
    return;
  }

  if (has('--batch')) {
    const file = path.resolve(String(arg('--batch')));
    const batch = readJson(file);
    if (!Array.isArray(batch.jobs)) throw new Error('Batch file must contain jobs array');
    const outputs = generateBatch({ templates, jobs: batch.jobs });
    outputs.forEach((o) => console.log(`Generated ${o.outputPath}`));
    return;
  }

  if (has('--project')) {
    const projectName = String(arg('--project'));
    const project = loadProjectByName(projectName);
    const profile = project.profile ? loadProfileByName(project.profile) : { defaults: {} };
    const outputs = generateFromProject(project, templates, profile);
    outputs.forEach((o) => console.log(`Generated ${o.outputPath}`));
    return;
  }

  if (has('--pack')) {
    const projectName = String(arg('--pack'));
    const project = loadProjectByName(projectName);
    const profile = project.profile ? loadProfileByName(project.profile) : { defaults: {} };
    const outputs = generateFromProject(project, templates, profile);
    const pack = packProject(project, outputs);
    console.log(`Packed at ${pack.exportDir}`);
    return;
  }

  if (has('--validate')) {
    console.log(runStrongValidation());
    return;
  }

  printHelp();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
