import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTemplates, searchTemplates } from '../lib/template-loader.js';
import { parsePrompt } from '../lib/parser.js';
import { generateOne } from '../lib/generator.js';
import { packProject, generateFromProject } from '../lib/project-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/templates') {
    const templates = loadTemplates();
    const q = url.searchParams.get('q') || '';
    return sendJson(res, 200, searchTemplates(templates, q).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      tags: t.tags,
      supportedOs: t.supportedOs,
    })));
  }

  if (req.method === 'POST' && url.pathname === '/api/preview') {
    try {
      const templates = loadTemplates();
      const body = JSON.parse(await readBody(req));
      let templateId = body.templateId;
      if (body.prompt) {
        templateId = parsePrompt(body.prompt).templateId;
      }
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');
      const rendered = generateOne({ template, format: body.format || 'flipper', vars: body.vars || {}, os: body.os });
      return sendJson(res, 200, rendered);
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/export') {
    try {
      const templates = loadTemplates();
      const body = JSON.parse(await readBody(req));
      let templateId = body.templateId;
      if (body.prompt) {
        templateId = parsePrompt(body.prompt).templateId;
      }
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const project = {
        id: `web-export-${Date.now()}`,
        title: 'Web UI single export',
        targets: [{
          templateId: template.id,
          format: body.format || 'flipper',
          os: body.os,
          vars: body.vars || {},
        }],
      };
      const outputs = generateFromProject(project, templates, { defaults: {} });
      const packed = packProject(project, outputs);
      return sendJson(res, 200, {
        exportDir: packed.exportDir,
        manifestPath: packed.manifestPath,
        manifest: packed.manifest,
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message });
    }
  }

  if (req.method === 'GET' && (url.pathname === '/' || url.pathname.startsWith('/web/'))) {
    const relPath = url.pathname === '/' ? 'index.html' : url.pathname.replace('/web/', '');
    const target = path.resolve(__dirname, relPath);
    if (!target.startsWith(__dirname) || !fs.existsSync(target)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const type = target.endsWith('.css') ? 'text/css' : target.endsWith('.js') ? 'application/javascript' : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    res.end(fs.readFileSync(target));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const port = Number(process.env.PORT || 4173);
server.listen(port, () => {
  console.log(`Safe web UI listening on http://localhost:${port}`);
});
