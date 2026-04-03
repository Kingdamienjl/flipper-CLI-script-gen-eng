const BLOCKED_PATTERNS = [
  { key: 'hidden execution', re: /(hidden|invisible|silent)\s+(execution|run|process)/i },
  { key: 'download-and-execute', re: /(curl|wget|invoke-webrequest).*(\||;).*(sh|bash|powershell|cmd|python)/i },
  { key: 'credential capture', re: /(password|credential|keystroke|token).*(capture|dump|steal|harvest)/i },
  { key: 'persistence', re: /(startup folder|registry run key|cron\s+@reboot|launchagent|scheduled task)/i },
  { key: 'remote shells', re: /(reverse shell|nc\s+-e|bash\s+-i|powershell.*tcpclient|ssh\s+.*@)/i },
  { key: 'disabling security tools', re: /(disable|stop).*(defender|antivirus|firewall|edr|xdr)/i },
  { key: 'obfuscation', re: /(base64|obfuscat|fromcharcode|xor\s+encode|compressed payload)/i },
  { key: 'phishing', re: /(fake login|spoof|credential prompt)/i },
];

export function validateSafety(text, context = 'input') {
  const content = String(text ?? '');
  for (const rule of BLOCKED_PATTERNS) {
    if (rule.re.test(content)) {
      throw new Error(
        `Blocked unsafe ${context}: matched "${rule.key}" pattern. This tool only supports authorized benign demos.`
      );
    }
  }
}

export function safetyRules() {
  return BLOCKED_PATTERNS.map((r) => r.key);
}
