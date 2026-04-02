import { renderComboLine } from './key-utils.js';

export function renderSteps(steps, format, vars = {}) {
  return steps.map((step) => {
    if (step.type === 'keys') {
      return format === 'ducky' ? renderComboLine('', step.value).trim() : renderComboLine('KEY', step.value);
    }
    if (step.type === 'text') {
      return `STRING ${interpolate(step.value, vars)}`;
    }
    if (step.type === 'delay') {
      return `DELAY ${step.value}`;
    }
    throw new Error(`Unsupported step type during render: ${step.type}`);
  });
}

function interpolate(input, vars) {
  return String(input).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
