import { validateSafety } from './safety-validator.js';

const intents = [
  {
    id: 'windows-open-run-notepad',
    mustInclude: ['windows'],
    anyInclude: ['notepad', 'run dialog', 'run'],
  },
  {
    id: 'windows-powershell-get-date',
    mustInclude: ['windows', 'powershell'],
    anyInclude: ['get-date', 'date'],
  },
  {
    id: 'linux-terminal-echo-hello',
    mustInclude: ['linux', 'terminal'],
    anyInclude: ['echo hello', 'hello'],
  },
  {
    id: 'mac-spotlight-open-notes',
    mustInclude: ['mac'],
    anyInclude: ['spotlight', 'notes'],
  },
];

export function parsePrompt(prompt) {
  const normalized = String(prompt || '').toLowerCase().trim();
  if (!normalized) throw new Error('Prompt is required and must describe a benign intent.');

  validateSafety(normalized, 'prompt');

  for (const intent of intents) {
    const mustPass = intent.mustInclude.every((w) => normalized.includes(w));
    const anyPass = intent.anyInclude.some((w) => normalized.includes(w));
    if (mustPass && anyPass) {
      return { templateId: intent.id, vars: {} };
    }
  }

  throw new Error('Prompt not supported. Only benign intents (notepad/calculator/editor, echo hello, Get-Date, spotlight Notes) are allowed.');
}
