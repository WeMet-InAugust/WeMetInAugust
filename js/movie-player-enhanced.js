// js/movie-player-enhanced.js
// Enhanced movie miniplayer controls and source preference logic with robustness improvements.
// - Prefers self-hosted HLS (.m3u8) when MediaSource & hls.js is available
// - Falls back to MP4 via HTML5 <video>
// - Falls back to embed URL (data-embed) if no direct sources
// - Loads hls.js on demand from CDN when needed
// - Adds accessible keyboard controls and captions support (auto-attaches <track> when provided)
// - Adds basic error UI, retry/backoff, seek-on-progress, a lightweight health/status indicator
// - Adds a "Try alternate source" control and captions toggle

(function(){
  'use strict';

  const miniplayer = document.getElementById('movieMiniplayer');
  if(!miniplayer) return;
  const container = document.getElementById('miniplayerContainer');
  const playBtn = document.getElementById('miniplayerPlayPause');
  const muteBtn = document.getElementById('miniplayerMute');
  const fullscreenBtn = document.getElementById('miniplayerFullscreen');
  const progressBar = document.getElementById('miniplayerProgressBar');
  const sourceTabs = Array.from(document.querySelectorAll('.source-tab'));

  // create a small status node for messages
  let statusNode = document.getElementById('miniplayerStatus');
  if(!statusNode){ statusNode = document.createElement('div'); statusNode.id = 'miniplayerStatus'; statusNode.style.fontSize='0.9rem'; statusNode.style.color='rgba(6,12,30,0.6)'; statusNode.style.marginTop='8px'; container.parentNode.insertBefore(statusNode, container.nextSibling); }

  // add alternate source & caption toggles area
  let controlsArea = document.getElementById('miniplayerExtraControls');
  if(!controlsArea){ controlsArea = document.createElement('div'); controlsArea.id = 'miniplayerExtraControls'; controlsArea.style.display = 'flex'; controlsArea.style.gap = '8px'; controlsArea.style.marginTop = '6px'; container.parentNode.insertBefore(controlsArea, statusNode.nextSibling); }

  let tryAltBtn = document.getElementById('tryAlternateSourceBtn');
  let openSourceBtn = document.getElementById('openSourceBtn');
  let captionsToggleBtn = document.getElementById('captionsToggleBtn');
  if(!tryAltBtn){ tryAltBtn = document.createElement('button'); tryAltBtn.id = 'tryAlternateSourceBtn'; tryAltBtn.className = 'miniplayer-btn'; tryAltBtn.textContent = 'Try alternate source'; tryAltBtn.title = 'Cycle to the next available source'; controlsArea.appendChild(tryAltBtn); }
  if(!openSourceBtn){ openSourceBtn = document.createElement('button'); openSourceBtn.id = 'openSourceBtn'; openSourceBtn.className = 'miniplayer-btn'; openSourceBtn.textContent = 'Open source'; openSourceBtn.title = 'Open current source in a new tab'; controlsArea.appendChild(openSourceBtn); }
  if(!captionsToggleBtn){ captionsToggleBtn = document.createElement('button'); captionsToggleBtn.id = 'captionsToggleBtn'; captionsToggleBtn.className = 'miniplayer-btn'; captionsToggleBtn.textContent = 'Captions'; captionsToggleBtn.title = 'Toggle captions'; controlsArea.appendChild(captionsToggleBtn); }

  let videoEl = null; let hls = null; let currentSource = null; let retryCount = 0;
  const MAX_RETRIES = 3;

  function supportsMSE(){ return !!(window.MediaSource && window.MediaSource.isTypeSupported); }
  function loadScript(src, timeout=6000){ return new Promise((resolve,reject)=>{
    const s=document.createElement('script'); s.src=src; s.async=true;
    let tid = setTimeout(()=>{ s.onerror = null; s.onload = null; reject(new Error('Script load timeout: '+src)); }, timeout);
    s.onload=()=>{ clearTimeout(tid); resolve(); };
    s.onerror=()=>{ clearTimeout(tid); reject(new Error('Script load failed: '+src)); };
    document.head.appendChild(s);
  }); }

  function setStatus(text, isError=false){ statusNode.textContent = text || ''; statusNode.style.color = isError ? '#a33' : 'rgba(6,12,30,0.6)'; }

  async function attachSource(sourceUrl, opts={forceRetry:false}){
    // cleanup previous
    if(hls){ try{ hls.destroy(); }catch(e){} hls=null; }
    if(videoEl){ try{ videoEl.pause(); }catch(e){} container.innerHTML=''; videoEl=null; }
    retryCount = opts.forceRetry ? retryCount : 0;

    if(!sourceUrl){ // embed fallback
      const embed = currentSource && currentSource.dataset.embed;
      if(embed){ container.innerHTML = `<iframe src="${embed}" allowfullscreen style="width:100%;height:360px;border:0" title="Embedded player"></iframe>`; setStatus('Using embedded player'); }
      else setStatus('No playable source found', true);
      return;
    }

    setStatus('Preparing playback...');

    // create video element
    videoEl = document.createElement('video');
    videoEl.controls = false;
    videoEl.width = 640; videoEl.height = 360;
    videoEl.setAttribute('playsinline','');
    videoEl.style.width='100%'; videoEl.style.height='auto';
    videoEl.crossOrigin = 'anonymous';

    // attach captions if the data attribute provides it
    const captionsUrl = currentSource && currentSource.dataset.captions;
    if(captionsUrl){ const t = document.createElement('track'); t.kind='subtitles'; t.srclang='en'; t.label='English'; t.src=captionsUrl; t.default = false; videoEl.appendChild(t); }

    container.innerHTML = ''; container.appendChild(videoEl);

    // robust loading with HLS preference and fallback
    const isM3U8 = typeof sourceUrl === 'string' && sourceUrl.endsWith('.m3u8');
    try{
      if(isM3U8 && supportsMSE()){
        setStatus('Loading HLS (MSE) support...');
        if(window.Hls){ hls = new window.Hls(); hls.loadSource(sourceUrl); hls.attachMedia(videoEl); }
        else {
          try{
            await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1');
            if(window.Hls){ hls = new window.Hls(); hls.loadSource(sourceUrl); hls.attachMedia(videoEl); }
            else { throw new Error('hls.js not available after load'); }
          }catch(err){ console.warn(err); setStatus('HLS support failed, falling back', true); videoEl.src = sourceUrl; }
        }
      } else {
        // direct MP4 or native HLS on Safari
        videoEl.src = sourceUrl;
      }
    }catch(err){
      console.error('attachSource error', err);
      // attempt retry/backoff
      if(retryCount < MAX_RETRIES){ retryCount++; setStatus('Playback failed, retrying ('+retryCount+'/'+MAX_RETRIES+')...', true); await new Promise(r=>setTimeout(r, 800 * retryCount)); return attachSource(sourceUrl, { forceRetry: true }); }
      setStatus('Playback failed. Try another source or check server headers (CORS/MIME).', true);
      return;
    }

    // attach controls & events
    videoEl.addEventListener('loadedmetadata', ()=>{ setStatus('Ready — press play'); });
    videoEl.addEventListener('canplay', ()=>{ setStatus('Can play'); });

    videoEl.addEventListener('timeupdate', ()=>{
      if(!videoEl || !progressBar) return;
      const pct = (videoEl.currentTime / Math.max(1, videoEl.duration)) * 100;
      progressBar.style.width = pct+'%';
    });

    videoEl.addEventListener('play', ()=>{ playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-pressed','true'); setStatus('Playing'); });
    videoEl.addEventListener('pause', ()=>{ playBtn.textContent = '▶'; playBtn.setAttribute('aria-pressed','false'); setStatus('Paused'); });
    videoEl.addEventListener('ended', ()=>{ setStatus('Ended'); });

    videoEl.addEventListener('error', ()=>{
      console.error('Video element error', videoEl.error);
      setStatus('Playback error: trying fallback...', true);
      // try fallback to MP4 if HLS failed
      if(isM3U8 && !sourceUrl.endsWith('.mp4')){
        const mp4Fallback = currentSource && currentSource.dataset.fallbackMp4;
        if(mp4Fallback){ setTimeout(()=> attachSource(mp4Fallback), 300); }
      }
    });

    // controls
    playBtn.onclick = ()=>{ if(!videoEl) return; if(videoEl.paused) videoEl.play().catch(e=>{ console.warn(e); setStatus('Play failed: '+(e.message||e), true); }); else videoEl.pause(); };
    muteBtn.onclick = ()=>{ if(!videoEl) return; videoEl.muted = !videoEl.muted; muteBtn.textContent = videoEl.muted ? '🔇' : '🔊'; };
    fullscreenBtn.onclick = ()=>{ if(!videoEl) return; if(document.fullscreenElement) document.exitFullscreen(); else container.requestFullscreen().catch(()=>{}); };

    // progress click-to-seek
    const progressWrap = progressBar.parentElement;
    if(progressWrap && !progressWrap._seekAttached){
      progressWrap.addEventListener('click', (ev)=>{
        if(!videoEl || !videoEl.duration) return;
        const rect = progressWrap.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        videoEl.currentTime = x * videoEl.duration;
      });
      progressWrap._seekAttached = true;
    }

    // keyboard accessibility
    miniplayer.tabIndex = 0; // ensure focusable
    miniplayer.addEventListener('keydown', (e)=>{
      if(!videoEl) return;
      if(e.key === ' ' || e.code === 'Space'){ e.preventDefault(); if(videoEl.paused) videoEl.play().catch(()=>{}); else videoEl.pause(); }
      if(e.key === 'm'){ videoEl.muted = !videoEl.muted; muteBtn.textContent = videoEl.muted ? '🔇' : '🔊'; }
      if(e.key === 'ArrowRight'){ videoEl.currentTime = Math.min(videoEl.duration, videoEl.currentTime + 5); }
      if(e.key === 'ArrowLeft'){ videoEl.currentTime = Math.max(0, videoEl.currentTime - 5); }
    });

    // captions toggle wiring
    captionsToggleBtn.onclick = ()=>{
      if(!videoEl) return;
      const tracks = videoEl.textTracks || [];
      if(tracks.length === 0){ setStatus('No captions available for this source', true); return; }
      // toggle the first track (common case)
      const t = tracks[0];
      if(t.mode === 'show'){
        t.mode = 'disabled'; captionsToggleBtn.style.opacity = '0.6'; setStatus('Captions off');
      } else { t.mode = 'show'; captionsToggleBtn.style.opacity = '1.0'; setStatus('Captions on'); }
    };

    // autoplay muted preview behavior: don't force autoplay but allow quick preview
    videoEl.muted = true; videoEl.autoplay = false; videoEl.preload = 'metadata';

  }

  // helper: cycle to next available source tab
  function tryAlternateSource(){
    if(!currentSource){ setStatus('No current source to alternate from', true); return; }
    const all = Array.from(document.querySelectorAll('.source-tab'));
    if(all.length < 2){ setStatus('No alternate sources available', true); return; }
    const idx = all.indexOf(currentSource);
    const next = all[(idx + 1) % all.length];
    if(next){ next.click(); setStatus('Switched to alternate source: '+(next.dataset.sourceUrl || next.dataset.embed || 'embed'), false); }
  }

  // helper: open current source in new tab
  function openCurrentSource(){ if(!currentSource) return; const url = currentSource.dataset.sourceUrl || currentSource.dataset.embed || null; if(!url){ setStatus('No URL to open for this source', true); return; } window.open(url, '_blank'); }

  tryAltBtn.addEventListener('click', tryAlternateSource);
  openSourceBtn.addEventListener('click', openCurrentSource);

  // Source tab switching with status and fallback hints
  sourceTabs.forEach(btn=> btn.addEventListener('click', async (e)=>{
    e.preventDefault();
    sourceTabs.forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    currentSource = btn;
    retryCount = 0;
    const url = btn.dataset.sourceUrl || null;
    if(!url && btn.dataset.embed) { attachSource(null); return; }
    setStatus('Switching source...');
    await attachSource(url);
  }));

  // initialize with the active tab
  const active = document.querySelector('.source-tab.active');
  if(active){ currentSource = active; const url = active.dataset.sourceUrl || null; attachSource(url); }

  // lightweight health check exposed for debugging
  window.__miniplayerHealth = function(){
    return {
      hls: !!hls,
      video: !!videoEl,
      src: currentSource && (currentSource.dataset.sourceUrl || currentSource.dataset.embed || null),
      retries: retryCount
    };
  };

})();
