#!/usr/bin/env node
import path from 'node:path';
import { loadTemplates, searchTemplates } from '../lib/template-loader.js';
import { parsePrompt } from '../lib/parser.js';
import { getRenderer } from '../lib/renderer-registry.js';
import { writeText, readJson } from '../lib/file-utils.js';
import { loadProjectByName, generateFromProject, packProject } from '../lib/project-service.js';
import { runStrongValidation } from '../lib/validation-command.js';

function arg(name) {
  const idx = process.argv.indexOf(name);
  if (idx < 0) return null;
  return process.argv[idx + 1] || true;
}

function has(name) {
  return process.argv.includes(name);
}

function printHelp() {
  console.log(`flipper-safe-gen V4\n\nOptions:\n  --list-templates\n  --search <query>\n  --preview <templateId>\n  --prompt <benign request>\n  --batch <projectFile>\n  --project <projectPresetName>\n  --validate\n  --pack <projectPresetName>`);
}

function previewTemplate(template, format = 'flipper') {
  const renderer = getRenderer(format);
  return renderer.render(template, {});
}

async function main() {
  const templates = loadTemplates();

  if (has('--list-templates')) {
    for (const t of templates) console.log(`${t.id} | ${t.title} | os=${t.supportedOs.join(',')} | tags=${t.tags.join(',')}`);
    return;
  }

  if (has('--search')) {
    const q = arg('--search');
    const result = searchTemplates(templates, String(q || ''));
    result.forEach((t) => console.log(`${t.id}: ${t.description}`));
    return;
  }

  if (has('--preview')) {
    const id = arg('--preview');
    const t = templates.find((x) => x.id === id);
    if (!t) throw new Error(`Template not found: ${id}`);
    console.log(previewTemplate(t));
    return;
  }

  if (has('--prompt')) {
    const p = String(arg('--prompt') || '');
    const parsed = parsePrompt(p);
    const t = templates.find((x) => x.id === parsed.templateId);
    if (!t) throw new Error(`Template not found for parsed prompt: ${parsed.templateId}`);
    const output = previewTemplate(t);
    const outPath = path.resolve('payloads/generated', `prompt-${t.id}.flipper.txt`);
    writeText(outPath, output);
    console.log(`Generated from prompt -> ${outPath}`);
    return;
  }

  if (has('--batch')) {
    const file = path.resolve(String(arg('--batch')));
    const project = readJson(file);
    const outputs = generateFromProject(project, templates);
    outputs.forEach((o) => console.log(`Generated ${o.outputPath}`));
    return;
  }

  if (has('--project')) {
    const projectName = String(arg('--project'));
    const project = loadProjectByName(projectName);
    const outputs = generateFromProject(project, templates);
    outputs.forEach((o) => console.log(`Generated ${o.outputPath}`));
    return;
  }

  if (has('--pack')) {
    const projectName = String(arg('--pack'));
    const project = loadProjectByName(projectName);
    const outputs = generateFromProject(project, templates);
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
