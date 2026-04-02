export const flipperRenderer = {
  id: 'flipper',
  render(template, vars = {}) {
    const lines = ['# Flipper benign demo macro'];
    for (const step of template.steps) {
      if (step.type === 'keys') lines.push(`KEY ${step.value}`);
      if (step.type === 'text') lines.push(`STRING ${interpolate(step.value, vars)}`);
      if (step.type === 'delay') lines.push(`DELAY ${step.value}`);
    }
    return `${lines.join('\n')}\n`;
  },
};

function interpolate(input, vars) {
  return String(input).replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}
