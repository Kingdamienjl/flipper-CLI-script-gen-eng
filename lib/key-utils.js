import { SUPPORTED_KEYS, SUPPORTED_MODIFIERS } from './constants.js';

export function normalizeCombo(combo) {
  if (!combo || typeof combo !== 'string') throw new Error('Key combo must be a non-empty string');
  const parts = combo.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) throw new Error('Key combo cannot be empty');

  const normalized = parts.map((p) => {
    if (p.length === 1 && /[a-z]/i.test(p)) return p.toLowerCase();
    return p.toUpperCase();
  });

  for (const key of normalized) {
    const isModifier = SUPPORTED_MODIFIERS.includes(key);
    const isChar = key.length === 1 && /[a-z]/.test(key);
    const isKnown = SUPPORTED_KEYS.includes(key);
    if (!isModifier && !isChar && !isKnown) {
      throw new Error(`Unsupported key in combo: ${key}`);
    }
  }

  const modifiers = normalized.filter((k) => SUPPORTED_MODIFIERS.includes(k));
  const nonModifiers = normalized.filter((k) => !SUPPORTED_MODIFIERS.includes(k));
  if (nonModifiers.length === 0) throw new Error(`Key combo must include a non-modifier key: ${combo}`);
  if (nonModifiers.length > 1) throw new Error(`Key combo must include exactly one non-modifier key: ${combo}`);

  return [...modifiers, nonModifiers[0]].join(' ');
}

export function renderComboLine(prefix, combo) {
  return `${prefix} ${normalizeCombo(combo)}`;
}
