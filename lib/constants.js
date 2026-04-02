export const SUPPORTED_OS = ['windows', 'linux', 'mac'];
export const RISK_LEVEL = 'benign';

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
