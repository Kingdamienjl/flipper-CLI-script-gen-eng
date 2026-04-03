import { renderSteps } from '../render-step.js';

export const flipperRenderer = {
  id: 'flipper',
  render(template, vars = {}) {
    const body = renderSteps(template.steps, 'flipper', vars);
    return ['# Flipper benign demo macro', ...body].join('\n') + '\n';
  },
};
