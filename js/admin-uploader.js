/* js/admin-uploader.js
   Front-end admin uploader (client-side only scaffold).
   Features:
   - Drag & drop and file input.
   - Client-side validation (type, size, duration check where possible).
   - Thumbnail generation (capture frame from video for preview) using <video> + canvas.
   - Chunked upload scaffold: splits file into chunks and POSTs to /api/uploads/chunk
     (server endpoints must be implemented separately; this is resumable-ready scaffold).
   - Accessible UI updates (aria-live, focus management), keyboard support.
   - After upload completion, expects server JSON with playback URLs and integrates them into the movie miniplayer UI.
*/
(function(){
  'use strict';

  const MAX_FILE_SIZE = 4 * 1024 * 1024 * 1024; // 4GB placeholder
  const ALLOWED_TYPES = ['video/mp4','video/webm','video/quicktime','audio/mpeg','audio/mp3'];
  const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB chunks

  function $(sel, root=document) { return root.querySelector(sel); }
  function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  // Build a minimal uploader UI when admin dashboard is present
  document.addEventListener('DOMContentLoaded', ()=>{
    const container = document.getElementById('adminUploaderRoot');
    if(!container) return; // nothing to do

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
              <button id="cancelUploadBtn">Cancel</button>
            </div>
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
    const cancelBtn = $('#cancelUploadBtn');

    let currentFile = null; let uploadController = null; let uploadId = null; let isUploading = false;

    function humanSize(n){ if(n<1024) return n+' B'; if(n<1024*1024) return (n/1024).toFixed(1)+' KB'; if(n<1024*1024*1024) return (n/1024/1024).toFixed(1)+' MB'; return (n/1024/1024/1024).toFixed(2)+' GB'; }

    function log(msg){ const p = document.createElement('div'); p.textContent = msg; logEl.appendChild(p); logEl.scrollTop = logEl.scrollHeight; }

    function resetPreview(){ preview.classList.add('hidden'); previewMedia.innerHTML=''; previewName.textContent=''; previewSize.textContent=''; progressBar.style.width='0%'; progress.setAttribute('aria-valuenow','0'); }

    function showFile(file){ currentFile = file; preview.classList.remove('hidden'); preview.setAttribute('aria-hidden','false'); previewName.textContent = file.name; previewSize.textContent = humanSize(file.size);
      // render a media preview where possible
      const type = file.type;
      previewMedia.innerHTML = '';
      if(type.startsWith('video/')){
        const vid = document.createElement('video'); vid.controls = false; vid.muted = true; vid.width = 240; vid.height = 135; vid.className = 'preview-video';
        vid.src = URL.createObjectURL(file);
        previewMedia.appendChild(vid);
        // attempt to capture a thumbnail frame once metadata loaded
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
    cancelBtn.addEventListener('click', ()=>{ if(uploadController){ uploadController.abort(); uploadController = null; log('Upload cancelled'); isUploading=false; } resetPreview(); });

    // chunked upload scaffold with integration to player tabs on completion
    async function startUpload(file){ isUploading = true; log('Starting upload: '+file.name); progressBar.style.width='0%'; progress.setAttribute('aria-valuenow','0');
      // generate a simple uploadId (server should return a persistent ID in real integration)
      uploadId = 'upload_' + Date.now() + '_' + Math.floor(Math.random()*10000);
      const total = file.size; let offset = 0; let part = 0; uploadController = new AbortController();

      try{
        while(offset < total){ const chunk = file.slice(offset, offset + CHUNK_SIZE); const form = new FormData(); form.append('uploadId', uploadId); form.append('part', String(part)); form.append('fileName', file.name); form.append('chunk', chunk);
          // example fetch endpoint - server should accept multipart chunk uploads
          const res = await fetch('/api/uploads/chunk', { method:'POST', body:form, signal: uploadController.signal });
          if(!res.ok) throw new Error('Upload chunk failed: '+res.status);
          offset += CHUNK_SIZE; part++; const pct = Math.min(100, Math.round((offset/total)*100)); progressBar.style.width = pct+'%'; progress.setAttribute('aria-valuenow', String(pct));
        }

        // finalize - expect JSON response with playback info or processing status
        const completeRes = await fetch('/api/uploads/complete', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ uploadId, fileName: file.name }) });
        if(!completeRes.ok) throw new Error('Finalize failed: '+completeRes.status);
        const payload = await completeRes.json();
        // payload expected shape examples:
        // { status: 'complete', mp4: '/media/abc.mp4', m3u8: '/media/abc.m3u8', captions: '/media/abc.vtt' }
        // or { status: 'processing', statusUrl: '/api/uploads/status/UPLOADID' }

        if(payload.status === 'complete'){
          log('Upload complete: '+file.name);
          progressBar.style.width = '100%'; progress.setAttribute('aria-valuenow','100');
          // integrate with movie miniplayer UI if present
          try{
            const tabsContainer = document.getElementById('sourceTabsContainer');
            if(tabsContainer){
              // create a new source tab prioritizing m3u8 if available
              const newBtn = document.createElement('button'); newBtn.className = 'source-tab'; newBtn.textContent = file.name;
              if(payload.m3u8) newBtn.dataset.sourceUrl = payload.m3u8; else if(payload.mp4) newBtn.dataset.sourceUrl = payload.mp4;
              if(payload.captions) newBtn.dataset.captions = payload.captions;
              tabsContainer.appendChild(newBtn);

              // simulate a click to initialize playback on the new source
              setTimeout(()=>{ newBtn.click(); }, 200);
            }
          }catch(e){ console.warn('Integrate with player failed', e); }
        } else if(payload.status === 'processing' && payload.statusUrl){
          log('Upload received; server is transcoding. Polling status...');
          // poll statusUrl until complete or timeout
          const poll = async (attempt=0)=>{
            try{
              const r = await fetch(payload.statusUrl); if(!r.ok) throw new Error('Status request failed: '+r.status); const s = await r.json();
              if(s.status === 'complete'){ log('Transcode complete'); if(s.m3u8 || s.mp4){ // integrate similarly
                const tabsContainer = document.getElementById('sourceTabsContainer');
                if(tabsContainer){ const newBtn = document.createElement('button'); newBtn.className='source-tab'; newBtn.textContent = file.name + ' (processed)'; if(s.m3u8) newBtn.dataset.sourceUrl = s.m3u8; else if(s.mp4) newBtn.dataset.sourceUrl = s.mp4; if(s.captions) newBtn.dataset.captions = s.captions; tabsContainer.appendChild(newBtn); setTimeout(()=>newBtn.click(),200); }
              } }
              else if(s.status === 'processing' && attempt < 20){ setTimeout(()=>poll(attempt+1), 3000); }
              else { log('Processing failed or timed out'); }
            }catch(err){ console.error(err); if(attempt < 20) setTimeout(()=>poll(attempt+1), 3000); else log('Status polling failed'); }
          };
          poll();
        } else { log('Unexpected server response: '+JSON.stringify(payload)); }

      }catch(err){ if(err.name === 'AbortError'){ log('Upload aborted'); } else { console.error(err); log('Upload failed: '+err.message); } }
      finally{ isUploading = false; uploadController = null; }
    }

  });

})();
