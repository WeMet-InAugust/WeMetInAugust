/* js/admin-uploader.js
   Front-end admin uploader (client-side only scaffold).
   Improvements:
   - Resume support: queries server for uploaded parts and resumes from the next part.
   - Pause / Resume controls in UI.
   - Shows server transcode progress if server includes `progress` in status responses.
   - Keeps previously implemented features: drag/drop, thumbnail capture, chunked upload, finalize, processing polling, auto-add player tabs.

   Server expectations (enhanced):
   - POST /api/uploads/chunk (multipart/form-data): uploadId, part, fileName, chunk
   - POST /api/uploads/complete (JSON): { uploadId, fileName }
   - GET  /api/uploads/status/:uploadId -> { status: 'processing'|'complete'|'failed', uploadedParts?: [0,1,2..], progress?: 0-100, mp4?, m3u8?, captions?, statusUrl? }
   - Optional: POST /api/uploads/init to request/uploadId before chunking (client will fall back to local-generated uploadId)
*/
(function(){
  'use strict';

  const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB placeholder
  const ALLOWED_TYPES = ['video/mp4','video/webm','video/quicktime','audio/mpeg','audio/mp3'];
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

  function $(sel, root=document) { return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  document.addEventListener('DOMContentLoaded', ()=>{
    const container = document.getElementById('adminUploaderRoot');
    if(!container) return;

    container.innerHTML = `
      <div class="uploader" id="uploader" aria-live="polite">
        <div class="uploader-dropzone" id="uploaderDrop" tabindex="0" role="button" aria-label="Drop files or press Enter to choose">
          <div class="uploader-instructions">
            <strong>Upload a seasonal track or video</strong>
            <p>Drag & drop here, or press Enter to browse. We accept MP4/WebM and common audio formats.</p>
            <button class="uploader-browse" id="uploaderBrowse">Choose file</button>
            <p class="uploader-hint">Max: 4GB (server limits may apply). We’ll upload in resumable chunks.</p>
          </div>
        </div>

        <input type="file" id="uploaderFileInput" class="visually-hidden" aria-hidden="true">

        <div class="uploader-preview hidden" id="uploaderPreview" aria-hidden="true">
          <div class="preview-media" id="previewMedia"></div>
          <div class="preview-meta">
            <p class="preview-name" id="previewName"></p>
            <p class="preview-size" id="previewSize"></p>
            <div class="upload-progress" id="uploadProgress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="upload-bar" id="uploadBar"></div></div>
            <div class="upload-controls">
              <button id="startUploadBtn">Start upload</button>
              <button id="pauseUploadBtn" disabled>Pause</button>
              <button id="resumeUploadBtn" disabled>Resume</button>
              <button id="cancelUploadBtn">Cancel</button>
            </div>
            <div class="upload-status" id="uploadStatus" aria-live="polite"></div>
          </div>
        </div>

        <div class="uploader-log" id="uploaderLog" aria-live="polite"></div>
      </div>
    `;

    const drop = $('#uploaderDrop');
    const fileInput = $('#uploaderFileInput');
    const browseBtn = $('#uploaderBrowse');
    const preview = $('#uploaderPreview');
    const previewMedia = $('#previewMedia');
    const previewName = $('#previewName');
    const previewSize = $('#previewSize');
    const progress = $('#uploadProgress');
    const progressBar = $('#uploadBar');
    const logEl = $('#uploaderLog');
    const startBtn = $('#startUploadBtn');
    const pauseBtn = $('#pauseUploadBtn');
    const resumeBtn = $('#resumeUploadBtn');
    const cancelBtn = $('#cancelUploadBtn');
    const statusNode = $('#uploadStatus');

    let currentFile = null; let uploadController = null; let uploadId = null; let isUploading = false; let isPaused = false; let _uploadedParts = new Set();

    function humanSize(n){ if(n<1024) return n+' B'; if(n<1024*1024) return (n/1024).toFixed(1)+' KB'; if(n<1024*1024*1024) return (n/1024/1024).toFixed(1)+' MB'; return (n/1024/1024/1024).toFixed(2)+' GB'; }
    function log(msg){ const p = document.createElement('div'); p.textContent = msg; logEl.appendChild(p); logEl.scrollTop = logEl.scrollHeight; }
    function resetPreview(){ preview.classList.add('hidden'); previewMedia.innerHTML=''; previewName.textContent=''; previewSize.textContent=''; progressBar.style.width='0%'; progress.setAttribute('aria-valuenow','0'); statusNode.textContent = ''; startBtn.disabled = false; pauseBtn.disabled = true; resumeBtn.disabled = true; }

    function showFile(file){ currentFile = file; preview.classList.remove('hidden'); preview.setAttribute('aria-hidden','false'); previewName.textContent = file.name; previewSize.textContent = humanSize(file.size);
      const type = file.type; previewMedia.innerHTML = '';
      if(type.startsWith('video/')){
        const vid = document.createElement('video'); vid.controls = false; vid.muted = true; vid.width = 240; vid.height = 135; vid.className = 'preview-video';
        vid.src = URL.createObjectURL(file);
        previewMedia.appendChild(vid);
        vid.addEventListener('loadeddata', ()=>{ try{ const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 180; const ctx = canvas.getContext('2d'); ctx.drawImage(vid, 0, 0, canvas.width, canvas.height); const img = document.createElement('img'); img.src = canvas.toDataURL('image/jpeg', 0.75); img.width = 160; img.height = 90; previewMedia.innerHTML=''; previewMedia.appendChild(img); URL.revokeObjectURL(vid.src); }catch(e){ /* silent */ } });
      }else if(type.startsWith('audio/')){
        const art = document.createElement('div'); art.className='audio-placeholder'; art.textContent = 'Audio file selected'; previewMedia.appendChild(art);
      }else{
        const other = document.createElement('div'); other.className = 'file-placeholder'; other.textContent = 'File selected'; previewMedia.appendChild(other);
      }
    }

    function validateFile(file){ if(!ALLOWED_TYPES.includes(file.type)) return {ok:false, reason:'Unsupported file type: '+file.type}; if(file.size > MAX_FILE_SIZE) return {ok:false, reason:'File too large: '+humanSize(file.size)}; return {ok:true}; }

    // drag/drop handlers
    ['dragenter','dragover'].forEach(ev=> drop.addEventListener(ev, (e)=>{ e.preventDefault(); drop.classList.add('dragover'); } ));
    ['dragleave','drop'].forEach(ev=> drop.addEventListener(ev, (e)=>{ e.preventDefault(); drop.classList.remove('dragover'); } ));
    drop.addEventListener('drop', (e)=>{ const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f){ const ok = validateFile(f); if(!ok.ok){ log(ok.reason); return; } showFile(f); } });

    // keyboard accessibility: Enter to open file picker
    drop.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); fileInput.click(); } });
    browseBtn.addEventListener('click', ()=> fileInput.click());
    fileInput.addEventListener('change', (e)=>{ const f = e.target.files && e.target.files[0]; if(f){ const ok = validateFile(f); if(!ok.ok){ log(ok.reason); return; } showFile(f); } });

    startBtn.addEventListener('click', ()=>{ if(!currentFile) return; if(isUploading) return; startUpload(currentFile); });
    pauseBtn.addEventListener('click', ()=>{ if(!isUploading || !uploadController) return; isPaused = true; uploadController.abort(); statusNode.textContent = 'Paused'; pauseBtn.disabled = true; resumeBtn.disabled = false; });
    resumeBtn.addEventListener('click', ()=>{ if(!currentFile) return; if(isUploading) return; isPaused = false; statusNode.textContent = 'Resuming...'; startUpload(currentFile, { resume:true }); });
    cancelBtn.addEventListener('click', ()=>{ if(uploadController){ uploadController.abort(); uploadController = null; log('Upload cancelled'); isUploading=false; } resetPreview(); });

    // query server for existing uploaded parts to support resume
    async function fetchUploadedParts(id){ try{ const r = await fetch(`/api/uploads/status/${encodeURIComponent(id)}`); if(!r.ok) return []; const s = await r.json(); if(Array.isArray(s.uploadedParts)) return s.uploadedParts.map(Number); return []; }catch(e){ return []; } }

    // start upload with optional resume
    async function startUpload(file, opts={resume:false}){
      isUploading = true; startBtn.disabled = true; pauseBtn.disabled = false; resumeBtn.disabled = true; statusNode.textContent = 'Starting upload...'; log('Starting upload: '+file.name);
      progressBar.style.width='0%'; progress.setAttribute('aria-valuenow','0');

      // try to get a server-provided uploadId first (optional endpoint)
      if(!uploadId){ try{ const rr = await fetch('/api/uploads/init', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fileName: file.name, size: file.size }) }); if(rr.ok){ const j = await rr.json(); if(j.uploadId) uploadId = j.uploadId; } }catch(e){ /* ignore - server may not support init */ } }

      if(!uploadId) uploadId = uploadId || ('upload_' + Date.now() + '_' + Math.floor(Math.random()*10000));

      const total = file.size; let offset = 0; let part = 0; uploadController = new AbortController();

      // if resume requested, fetch parts already uploaded
      if(opts.resume){ const parts = await fetchUploadedParts(uploadId); _uploadedParts = new Set(parts); log('Resuming; server reports '+_uploadedParts.size+' parts already uploaded'); }

      try{
        // if parts set, compute starting offset and part index
        if(_uploadedParts.size){ // compute next part index by scanning sequentially
          let highest = -1; _uploadedParts.forEach(p=>{ if(p>highest) highest = p; });
          part = highest + 1; offset = part * CHUNK_SIZE;
        }

        while(offset < total){ if(isPaused) break; const chunk = file.slice(offset, offset + CHUNK_SIZE); const form = new FormData(); form.append('uploadId', uploadId); form.append('part', String(part)); form.append('fileName', file.name); form.append('chunk', chunk);
          const res = await fetch('/api/uploads/chunk', { method:'POST', body:form, signal: uploadController.signal });
          if(!res.ok) throw new Error('Upload chunk failed: '+res.status);
          // mark part as uploaded locally
          _uploadedParts.add(part);
          offset += CHUNK_SIZE; part++; const pct = Math.min(100, Math.round((offset/total)*100)); progressBar.style.width = pct+'%'; progress.setAttribute('aria-valuenow', String(pct)); statusNode.textContent = `Uploading... ${pct}%`;
        }

        if(isPaused){ log('Upload paused at '+Math.round((offset/total)*100)+'%'); isUploading=false; uploadController = null; return; }

        // finalize
        statusNode.textContent = 'Finalizing upload...';
        const completeRes = await fetch('/api/uploads/complete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ uploadId, fileName: file.name }) });
        if(!completeRes.ok) throw new Error('Finalize failed: '+completeRes.status);
        const payload = await completeRes.json();

        if(payload.status === 'complete'){
          log('Upload complete: '+file.name);
          progressBar.style.width = '100%'; progress.setAttribute('aria-valuenow','100'); statusNode.textContent = 'Upload complete';
          integratePlayback(payload, file.name);
        } else if(payload.status === 'processing' && payload.statusUrl){
          log('Upload received; server is transcoding. Polling status...');
          pollProcessing(payload.statusUrl, file.name);
        } else {
          log('Unexpected server response: '+JSON.stringify(payload)); statusNode.textContent = 'Server responded unexpectedly';
        }

      }catch(err){ if(err.name === 'AbortError'){ log('Upload aborted'); statusNode.textContent = 'Upload aborted'; } else { console.error(err); log('Upload failed: '+err.message); statusNode.textContent = 'Upload failed: '+err.message; } }
      finally{ if(!isPaused){ isUploading = false; uploadController = null; pauseBtn.disabled = true; resumeBtn.disabled = false; } }
    }

    async function pollProcessing(statusUrl, originalFileName, attempt=0){ try{
      const r = await fetch(statusUrl); if(!r.ok) throw new Error('Status request failed: '+r.status); const s = await r.json();
      if(typeof s.progress === 'number'){ statusNode.textContent = `Processing... ${s.progress}%`; }
      if(s.status === 'complete'){ statusNode.textContent = 'Processing complete'; integratePlayback(s, originalFileName); }
      else if(s.status === 'processing' && attempt < 60){ setTimeout(()=>pollProcessing(statusUrl, originalFileName, attempt+1), 3000); }
      else if(attempt >= 60){ log('Processing timed out'); statusNode.textContent = 'Processing timed out'; }
      else { log('Processing failed or returned unexpected state'); statusNode.textContent = 'Processing failed'; }
    }catch(err){ console.error(err); if(attempt < 60) setTimeout(()=>pollProcessing(statusUrl, originalFileName, attempt+1), 3000); else statusNode.textContent = 'Status polling failed'; }
    }

    function integratePlayback(payload, filename){ try{
      const tabsContainer = document.getElementById('sourceTabsContainer');
      if(tabsContainer){
        const newBtn = document.createElement('button'); newBtn.className = 'source-tab'; newBtn.textContent = filename;
        if(payload.m3u8) newBtn.dataset.sourceUrl = payload.m3u8; else if(payload.mp4) newBtn.dataset.sourceUrl = payload.mp4;
        if(payload.mp4 && !payload.m3u8) newBtn.dataset.fallbackMp4 = payload.mp4;
        if(payload.captions) newBtn.dataset.captions = payload.captions;
        tabsContainer.appendChild(newBtn);
        // wire the click handler like the existing source tabs (best-effort)
        newBtn.addEventListener('click', (e)=>{ e.preventDefault(); const all = Array.from(document.querySelectorAll('.source-tab')); all.forEach(b=> b.classList.remove('active')); newBtn.classList.add('active'); const url = newBtn.dataset.sourceUrl || null; if(!url && newBtn.dataset.embed){ const container = document.getElementById('miniplayerContainer'); container.innerHTML = `<iframe src="${newBtn.dataset.embed}" allowfullscreen style="width:100%;height:360px;border:0" title="Embedded player"></iframe>`; } else { // trigger player code by dispatching click
            newBtn.click(); } });
        // attempt to auto-select the new source
        setTimeout(()=>{ try{ newBtn.click(); }catch(e){} }, 300);
      }
    }catch(e){ console.warn('Integrate with player failed', e); }
    }

  });

})();
