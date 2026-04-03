const listEl = document.getElementById('templateList');
const previewEl = document.getElementById('preview');
const errorsEl = document.getElementById('errors');
const detailsEl = document.getElementById('templateDetails');

async function fetchTemplates(query = '') {
  const res = await fetch(`/api/templates?q=${encodeURIComponent(query)}`);
  const items = await res.json();
  listEl.innerHTML = '';
  items.forEach((t) => {
    const li = document.createElement('li');
    li.textContent = `${t.id} [${t.supportedOs.join(',')}] #${t.tags.join(' #')}`;
    li.onclick = () => {
      document.getElementById('templateId').value = t.id;
      detailsEl.textContent = JSON.stringify(t, null, 2);
    };
    listEl.appendChild(li);
  });
}

document.getElementById('filter').addEventListener('input', (e) => fetchTemplates(e.target.value));

document.getElementById('previewBtn').onclick = async () => {
  errorsEl.textContent = '';
  previewEl.textContent = '';
  try {
    const varsText = document.getElementById('varsInput').value.trim();
    const vars = varsText ? JSON.parse(varsText) : {};
    const payload = {
      prompt: document.getElementById('promptInput').value.trim(),
      templateId: document.getElementById('templateId').value.trim(),
      format: document.getElementById('formatSelect').value,
      os: document.getElementById('osSelect').value || undefined,
      vars,
    };
    if (!payload.prompt && !payload.templateId) {
      throw new Error('Provide either a benign prompt or a template id.');
    }

    const res = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');

    previewEl.textContent = data.content;
  } catch (err) {
    errorsEl.textContent = err.message;
  }
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
  (async () => {
    errorsEl.textContent = '';
    try {
      const varsText = document.getElementById('varsInput').value.trim();
      const vars = varsText ? JSON.parse(varsText) : {};
      const payload = {
        prompt: document.getElementById('promptInput').value.trim(),
        templateId: document.getElementById('templateId').value.trim(),
        format: document.getElementById('formatSelect').value,
        os: document.getElementById('osSelect').value || undefined,
        vars,
      };
      if (!payload.prompt && !payload.templateId) {
        throw new Error('Provide either a benign prompt or a template id before export.');
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');

      previewEl.textContent = `${previewEl.textContent}\n\nExport manifest:\n${JSON.stringify(data.manifest, null, 2)}`;
    } catch (err) {
      errorsEl.textContent = err.message;
    }
  })();
};

fetchTemplates();
