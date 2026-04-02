import { validateSafety } from './safety-validator.js';

const benignPatterns = [
  {
    templateId: 'windows-open-run-notepad',
    re: /(windows|win).*(open|launch).*(notepad|run dialog)/i,
  },
  {
    templateId: 'windows-powershell-get-date',
    re: /(windows|win).*(powershell).*(get-date|date)/i,
  },
  {
    templateId: 'linux-terminal-echo-hello',
    re: /(linux).*(terminal).*(echo\s+hello|hello)/i,
  },
  {
    templateId: 'mac-spotlight-open-notes',
    re: /(mac|macos|osx).*(spotlight).*(notes|open notes)/i,
  },
];

export function parsePrompt(prompt) {
  validateSafety(prompt, 'prompt');
  for (const p of benignPatterns) {
    if (p.re.test(prompt)) {
      return { templateId: p.templateId, vars: {} };
    }
  }
  throw new Error('Unable to match prompt to a supported benign intent. Try a known harmless demo request.');
}
