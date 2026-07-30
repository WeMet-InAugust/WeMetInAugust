// js/france-aoi-idle.js
// DPR-aware France Aoi corner idle: samples a vector sprite atlas (SVG) for crisp frames.
// - Loads atlas SVGs (regular + @2x) as Image objects (SVG scales crisply) and draws to canvas
// - Uses an offscreen canvas for compositing when available
// - Respects document.visibilityState and prefers-reduced-motion
// - Throttles frame rate for performance

(function(){
  'use strict';

  const CANVAS_ID = 'seasonalIdleCanvas';
  const ATLAS_PATH = '/images/atlas/apple-tree.svg';
  const ATLAS_PATH_2X = '/images/atlas/apple-tree@2x.svg';
  const DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
  const TARGET_FPS = 24; // low, cinematic
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  const canvas = document.getElementById(CANVAS_ID);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let offscreen = null;
  if(window.OffscreenCanvas){ try{ offscreen = new OffscreenCanvas(canvas.width, canvas.height); }catch(e){ offscreen = null; } }

  const img = new Image();
  const img2 = new Image();
  let atlasLoaded = false;

  function choosePath(){ return (DPR > 1.4) ? ATLAS_PATH_2X : ATLAS_PATH; }

  img.onload = ()=>{ atlasLoaded = true; }; img.onerror = ()=>{ atlasLoaded = false; };
  img.src = choosePath();

  // Fallback to 2x if DPR suggests and resource exists
  img2.onload = ()=>{}; img2.onerror = ()=>{}; img2.src = ATLAS_PATH_2X;

  let lastFrame = 0; let rafId = null; let paused = false;

  function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

  function draw(timestamp){
    if(paused) return;
    if(!atlasLoaded) { rafId = requestAnimationFrame(draw); return; }
    if(timestamp - lastFrame < FRAME_INTERVAL){ rafId = requestAnimationFrame(draw); return; }
    lastFrame = timestamp;

    const drawCtx = offscreen ? offscreen.getContext('2d') : ctx;
    if(drawCtx){
      // clear compositing surface
      drawCtx.clearRect(0,0,canvas.width,canvas.height);
      // decorative background halo
      drawCtx.save();
      drawCtx.globalAlpha = 0.88;
      drawCtx.fillStyle = 'rgba(255,255,255,0.02)';
      drawCtx.fillRect(0,0,canvas.width,canvas.height);
      drawCtx.restore();

      // sample the atlas (SVG) and draw a subtle oscillation for life
      const t = Date.now() / 1000;
      const oscillate = Math.sin(t * 0.8) * 2; // px
      const sx = 0; const sy = 0; const sw = img.width; const sh = img.height;
      const dw = canvas.width; const dh = canvas.height;

      // center the atlas within the canvas
      const dx = Math.round((canvas.width - dw) / 2 + oscillate);
      const dy = Math.round((canvas.height - dh) / 2 + oscillate/2);

      try{
        drawCtx.save();
        drawCtx.globalCompositeOperation = 'source-over';
        drawCtx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        drawCtx.restore();
      }catch(e){ /* drawImage can fail if resource not ready */ }

      // If offscreen was used, transfer to onscreen
      if(offscreen){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(offscreen, 0, 0); }
    }

    rafId = requestAnimationFrame(draw);
  }

  function visibilityChange(){ if(document.hidden){ paused = true; if(rafId) cancelAnimationFrame(rafId); } else { paused = false; rafId = requestAnimationFrame(draw); } }
  function reducedMotionCheck(){ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  if(reducedMotionCheck()){ // reduce to a single still frame
    img.onload = ()=>{ try{ ctx.drawImage(img, 0, 0, canvas.width, canvas.height); }catch(e){} };
  } else {
    document.addEventListener('visibilitychange', visibilityChange);
    rafId = requestAnimationFrame(draw);
  }

})();
