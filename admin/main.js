// admin/main.js
// Client-side admin UI logic: login, logout, chunked uploader (talks to protected server endpoints).

document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('login-section');
  const dashboard = document.getElementById('dashboard');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const passwordInput = document.getElementById('admin-password');
  const loginMsg = document.getElementById('login-msg');

  const fileInput = document.getElementById('file-input');
  const startUploadBtn = document.getElementById('start-upload');
  const uploadStatus = document.getElementById('upload-status');

  async function checkSession() {
    try {
      const res = await fetch('/admin/check', { credentials: 'include' });
      const j = await res.json();
      if (j.ok) showDashboard();
    } catch (e) { /* ignore */ }
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboard.classList.remove('hidden');
  }

  function showLogin() {
    loginSection.classList.remove('hidden');
    dashboard.classList.add('hidden');
  }

  loginBtn.addEventListener('click', async () => {
    const password = passwordInput.value || '';
    loginMsg.textContent = 'Signing in...';
    try {
      const r = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      });
      if (r.ok) {
        loginMsg.textContent = 'Welcome — unlocking dashboard.';
        passwordInput.value = '';
        showDashboard();
      } else {
        const j = await r.json().catch(()=>({}));
        loginMsg.textContent = (j && j.error) ? `Error: ${j.error}` : 'Sign-in failed';
      }
    } catch (err) {
      loginMsg.textContent = 'Network error';
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/admin/logout', { method: 'POST', credentials: 'include' });
    showLogin();
  });

  startUploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) { uploadStatus.textContent = 'Select a file first'; return; }
    uploadStatus.textContent = 'Preparing upload...';

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    const parts = Math.ceil(file.size / CHUNK_SIZE);

    for (let i = 0; i < parts; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);
      const form = new FormData();
      form.append('chunk', blob, file.name);
      form.append('uploadId', uploadId);
      form.append('part', String(i));
      form.append('fileName', file.name);
      uploadStatus.textContent = `Uploading part ${i+1}/${parts}...`;
      try {
        const r = await fetch('/api/uploads/chunk', { method: 'POST', body: form, credentials: 'include' });
        if (!r.ok) { uploadStatus.textContent = `Upload failed at part ${i+1}`; return; }
      } catch (err) { uploadStatus.textContent = 'Network error during upload'; return; }
    }

    uploadStatus.textContent = 'Finalizing...';
    try {
      const r2 = await fetch('/api/uploads/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ uploadId, fileName: file.name })
      });
      const j = await r2.json();
      if (r2.ok) {
        uploadStatus.textContent = `Processing started. Status URL: ${j.statusUrl}`;
      } else {
        uploadStatus.textContent = `Error: ${j.error || 'unknown'}`;
      }
    } catch (err) { uploadStatus.textContent = 'Network error finalizing upload'; }
  });

  // quick check on load
  checkSession();
});
