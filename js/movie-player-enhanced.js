// js/movie-player-enhanced.js
// Enhanced movie miniplayer controls and source preference logic.
// - Prefers self-hosted HLS (.m3u8) when MediaSource & hls.js is available
// - Falls back to MP4 via HTML5 <video>
// - Falls back to embed URL (data-embed) if no direct sources
// - Loads hls.js on demand from CDN when needed
// - Adds accessible keyboard controls and captions support (if tracks provided)

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

  let videoEl = null; let hls = null; let currentSource = null;

  function supportsMSE(){ return !!(window.MediaSource && window.MediaSource.isTypeSupported); }
  function loadScript(src){ return new Promise((resolve,reject)=>{ const s=document.createElement('script'); s.src=src; s.onload=()=>resolve(); s.onerror=()=>reject(new Error('Script load failed: '+src)); document.head.appendChild(s); }); }

  async function attachSource(sourceUrl){
    // cleanup previous
    if(hls){ try{ hls.destroy(); }catch(e){} hls=null; }
    if(videoEl){ videoEl.pause(); container.innerHTML=''; videoEl=null; }

    if(!sourceUrl){ // embed fallback
      const embed = currentSource && currentSource.dataset.embed;
      if(embed){ container.innerHTML = `<iframe src="${embed}" allowfullscreen style="width:100%;height:360px;border:0" title="Embedded player"></iframe>`; }
      return;
    }

    // create video element
    videoEl = document.createElement('video'); videoEl.controls = false; videoEl.width = 640; videoEl.height = 360; videoEl.setAttribute('playsinline',''); videoEl.style.width='100%'; videoEl.style.height='auto'; videoEl.crossOrigin = 'anonymous';

    // captions placeholder handling (server can add <track> elements via templates)

    container.innerHTML = ''; container.appendChild(videoEl);

    // HLS preference
    const isM3U8 = sourceUrl.endsWith('.m3u8');
    if(isM3U8 && supportsMSE()){
      // try to load hls.js dynamically
      if(window.Hls){ hls = new window.Hls(); hls.loadSource(sourceUrl); hls.attachMedia(videoEl); }
      else {
        try{
          await loadScript('https://cdn.jsdelivr.net/npm/hls.js@1');
          if(window.Hls){ hls = new window.Hls(); hls.loadSource(sourceUrl); hls.attachMedia(videoEl); }
        }catch(err){ console.warn('hls.js failed to load, falling back to native or MP4'); videoEl.src = sourceUrl; }
      }
    }else{
      // plain MP4 or browser-native HLS
      videoEl.src = sourceUrl;
    }

    // attach simple controls
    videoEl.addEventListener('timeupdate', ()=>{
      if(!videoEl || !progressBar) return;
      const pct = (videoEl.currentTime / Math.max(1, videoEl.duration)) * 100; progressBar.style.width = pct+'%';
    });

    videoEl.addEventListener('play', ()=>{ playBtn.textContent = '❚❚'; playBtn.setAttribute('aria-pressed','true'); });
    videoEl.addEventListener('pause', ()=>{ playBtn.textContent = '▶'; playBtn.setAttribute('aria-pressed','false'); });

    playBtn.onclick = ()=>{ if(!videoEl) return; if(videoEl.paused) videoEl.play().catch(()=>{}); else videoEl.pause(); };
    muteBtn.onclick = ()=>{ if(!videoEl) return; videoEl.muted = !videoEl.muted; muteBtn.textContent = videoEl.muted ? '🔇' : '🔊'; };
    fullscreenBtn.onclick = ()=>{ if(!videoEl) return; if(document.fullscreenElement) document.exitFullscreen(); else container.requestFullscreen().catch(()=>{}); };

    // keyboard accessibility
    miniplayer.addEventListener('keydown', (e)=>{
      if(e.key === ' ' || e.code === 'Space'){ e.preventDefault(); if(videoEl.paused) videoEl.play().catch(()=>{}); else videoEl.pause(); }
      if(e.key === 'm'){ videoEl.muted = !videoEl.muted; muteBtn.textContent = videoEl.muted ? '🔇' : '🔊'; }
    });

    // autoplay muted preview behavior
    videoEl.muted = true; videoEl.autoplay = false; videoEl.preload = 'metadata';

  }

  // Source tab switching
  sourceTabs.forEach(btn=> btn.addEventListener('click', async (e)=>{
    e.preventDefault();
    sourceTabs.forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    currentSource = btn;
    const url = btn.dataset.sourceUrl || null;
    if(!url && btn.dataset.embed) { attachSource(null); return; }
    await attachSource(url);
  }));

  // initialize with the active tab
  const active = document.querySelector('.source-tab.active'); if(active){ currentSource = active; const url = active.dataset.sourceUrl || null; attachSource(url); }

})();
