const templates = [
  { id: 'windows-open-run-notepad', tags: ['windows', 'run', 'notepad'], os: ['windows'], preview: 'KEY GUI r\nSTRING notepad\nKEY ENTER' },
  { id: 'windows-powershell-get-date', tags: ['windows', 'powershell'], os: ['windows'], preview: 'KEY GUI r\nSTRING powershell\nKEY ENTER\nSTRING Get-Date\nKEY ENTER' },
  { id: 'linux-terminal-echo-hello', tags: ['linux', 'terminal'], os: ['linux'], preview: 'KEY CTRL ALT t\nSTRING echo hello\nKEY ENTER' },
  { id: 'mac-spotlight-open-notes', tags: ['mac', 'spotlight'], os: ['mac'], preview: 'KEY GUI SPACE\nSTRING Notes\nKEY ENTER' },
];

const listEl = document.getElementById('templateList');
const previewEl = document.getElementById('preview');
const filterEl = document.getElementById('filter');
const promptEl = document.getElementById('promptInput');

function renderList(items) {
  listEl.innerHTML = '';
  items.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = `${t.id} [${t.os.join(',')}] #${t.tags.join(' #')}`;
    li.onclick = () => (previewEl.textContent = t.preview);
    listEl.appendChild(li);
  });
}

filterEl.addEventListener('input', () => {
  const q = filterEl.value.toLowerCase();
  renderList(templates.filter((t) => JSON.stringify(t).toLowerCase().includes(q)));
});

document.getElementById('applyPrompt').onclick = () => {
  const p = promptEl.value.toLowerCase();
  const match = templates.find((t) => p.includes(t.os[0]) || p.includes(t.id.split('-')[0]));
  previewEl.textContent = (match || templates[0]).preview;
};

document.getElementById('downloadBtn').onclick = () => {
  const blob = new Blob([previewEl.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'safe-preview.txt';
  a.click();
  URL.revokeObjectURL(url);
};

document.getElementById('exportBtn').onclick = () => {
  const stub = {
    authorizedUseOnly: true,
    riskLevel: 'benign',
    generatedAt: new Date().toISOString(),
  };
  previewEl.textContent = `${previewEl.textContent}\n\n${JSON.stringify(stub, null, 2)}`;
};

renderList(templates);
