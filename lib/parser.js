import { validateSafety } from './safety-validator.js';

const INTENT_HELP = [
  'open run dialog and launch a harmless local app (e.g., notepad)',
  'open terminal and run a harmless command (e.g., echo hello or Get-Date)',
  'open spotlight and launch a harmless app (e.g., Notes)',
  'type a harmless canned string',
].join('; ');

function includesAny(text, values) {
  return values.some((v) => text.includes(v));
}

function includesAll(text, values) {
  return values.every((v) => text.includes(v));
}

function parseRunApp(text) {
  const hasRunIntent = includesAny(text, ['run dialog', 'open run', 'win+r', 'windows run']);
  const hasLaunchIntent = includesAny(text, ['open', 'launch', 'start']);
  if (!hasRunIntent || !hasLaunchIntent) return null;

  if (includesAny(text, ['notepad', 'text editor'])) {
    return { templateId: 'windows-open-run-notepad', vars: {} };
  }

  return null;
}

function parseTerminalCommand(text) {
  const hasTerminal = includesAny(text, ['terminal', 'powershell', 'shell']);
  const hasOpenVerb = includesAny(text, ['open', 'launch', 'start']);
  const hasRunVerb = includesAny(text, ['run', 'type', 'execute']);
  if (!hasTerminal || (!hasOpenVerb && !hasRunVerb)) return null;

  if (includesAll(text, ['windows', 'powershell']) && includesAny(text, ['get-date', 'date'])) {
    return { templateId: 'windows-powershell-get-date', vars: {} };
  }

  if (includesAny(text, ['linux', 'ubuntu']) && includesAny(text, ['echo hello', 'echo'])) {
    return { templateId: 'linux-terminal-echo-hello', vars: {} };
  }

  return null;
}

function parseSpotlight(text) {
  const hasSpotlight = includesAny(text, ['spotlight', 'cmd space', 'command space']);
  const hasLaunchIntent = includesAny(text, ['open', 'launch', 'start']);
  if (!hasSpotlight || !hasLaunchIntent) return null;

  if (includesAny(text, ['notes'])) {
    return { templateId: 'mac-spotlight-open-notes', vars: {} };
  }

  return null;
}

function parseCannedString(text) {
  if (!includesAny(text, ['type', 'write', 'canned string', 'harmless string'])) return null;
  if (includesAny(text, ['authorized lab demo', 'hello'])) {
    return { templateId: 'common-type-demo-text', vars: {} };
  }
  return null;
}

export function parsePrompt(prompt) {
  const normalized = String(prompt || '').toLowerCase().trim();
  if (!normalized) throw new Error(`Unsupported prompt: empty input. Supported benign intents: ${INTENT_HELP}.`);

  validateSafety(normalized, 'prompt');

  const parsers = [parseRunApp, parseTerminalCommand, parseSpotlight, parseCannedString];
  for (const parseIntent of parsers) {
    const result = parseIntent(normalized);
    if (result) return result;
  }

  throw new Error(`Unsupported prompt: could not match a clearly safe intent. Supported benign intents: ${INTENT_HELP}.`);
}
