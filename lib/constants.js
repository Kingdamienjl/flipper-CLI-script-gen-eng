export const SUPPORTED_OS = ['windows', 'linux', 'mac'];
export const RISK_LEVEL = 'benign';
export const STEP_TYPES = ['keys', 'text', 'delay'];

export const SUPPORTED_MODIFIERS = ['CTRL', 'ALT', 'SHIFT', 'GUI'];
export const SUPPORTED_KEYS = [
  ...SUPPORTED_MODIFIERS,
  'ENTER',
  'SPACE',
  'TAB',
  'ESC',
  'UP',
  'DOWN',
  'LEFT',
  'RIGHT',
  'r',
  't',
];

export const SCHEMAS = {
  template: {
    required: ['id', 'title', 'description', 'tags', 'supportedOs', 'riskLevel', 'steps'],
  },
  manifest: {
    required: ['templateId', 'title', 'description', 'tags', 'requiredVars', 'supportedOs', 'riskLevel'],
  },
  profile: {
    required: ['id', 'defaults'],
  },
  project: {
    required: ['id', 'title', 'targets'],
  },
};
