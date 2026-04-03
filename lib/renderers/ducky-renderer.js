import { renderSteps } from '../render-step.js';

export const duckyRenderer = {
  id: 'ducky',
  render(template, vars = {}) {
    const body = renderSteps(template.steps, 'ducky', vars);
    return ['REM Ducky benign demo macro', ...body].join('\n') + '\n';
  },
};
