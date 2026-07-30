/* js/france-aoi-idle.js
   France Aoi corner idle canvas animation.
   - Draws a stylized apple tree and seasonal accents (blossoms, leaves, apples, snow, lights).
   - Uses requestAnimationFrame with throttling for low-frame-mode on small viewports.
   - Uses OffscreenCanvas when available for smoother rendering.
   - Pauses when document.hidden or canvas is not visible (IntersectionObserver / Visibility API).
   - Reacts to body seasonal classes (season-autumn, season-winter-frost, season-christmas-season, season-winter-romance, season-spring, season-summer, season-summer-late).
   - Designed to be lightweight and to degrade gracefully.
*/
(function(){
  'use strict';

  const CANVAS_ID = 'seasonalIdleCanvas';
  const MAX_FPS = 30;                       // normal mode
  const LOW_FPS = 12;                       // low-frame mode for tiny screens
  const APPEARANCE = {
    treeColor: '#264653',
    trunkColor: '#6b4a2a',
    appleRed: '#d33d3d',
    blossomPink: '#FFB6C1',
    leafGreen: '#2e8b57',
    snowColor: '#F8FAFF',
    lightGold: '#FFD966'
  };

  function getSeason(){
    const body = document.body;
    const seasons = ['autumn','winter-frost','christmas-season','winter-romance','spring','summer','summer-late'];
    for(const s of seasons){ if(body.classList.contains('season-'+s)) return s; }
    // fallback to seasonal-toggle detection if present
    if(window.detectSeasonAuto) return window.detectSeasonAuto();
    return 'summer';
  }

  function setupCanvas(){
    const canvas = document.getElementById(CANVAS_ID);
    if(!canvas) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = canvas.getAttribute('width') + 'px';
    canvas.style.height = canvas.getAttribute('height') + 'px';
    canvas.width = parseInt(canvas.getAttribute('width')) * dpr;
    canvas.height = parseInt(canvas.getAttribute('height')) * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { canvas, ctx, dpr };
  }

  function createOffscreen(width, height){
    if(typeof OffscreenCanvas !== 'undefined'){
      return new OffscreenCanvas(width, height);
    }
    const c = document.createElement('canvas');
    c.width = width; c.height = height; return c;
  }

  function easeInOut(t){ return t<0.5? 2*t*t : -1 + (4-2*t)*t; }

  function drawTreeBase(ctx, w, h){
    // trunk
    const trunkW = w*0.12; const trunkH = h*0.28;
    ctx.fillStyle = APPEARANCE.trunkColor;
    ctx.beginPath();
    const tx = w*0.5 - trunkW/2; const ty = h - trunkH - 6;
    roundRect(ctx, tx, ty, trunkW, trunkH, 6);
    ctx.fill();

    // canopy - layered circles
    const cx = w*0.5; const cy = h*0.46; const radius = Math.min(w,h)*0.28;
    const layers = 3;
    for(let i=0;i<layers;i++){
      const r = radius - i*10;
      const offsetX = (i-1)*8;
      ctx.beginPath();
      gradientCircle(ctx, cx+offsetX, cy + i*6, r, APPEARANCE.treeColor, shade(APPEARANCE.treeColor, (i+1)*6));
      ctx.fill();
    }
  }

  function gradientCircle(ctx,x,y,r,colorA,colorB){
    const g = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.1, x, y, r);
    g.addColorStop(0, colorA); g.addColorStop(1, colorB);
    ctx.fillStyle = g; ctx.arc(x,y,r,0,Math.PI*2);
  }

  function roundRect(ctx,x,y,w,h,r){ ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); }

  function shade(hex, percent){
    // simple shade: percent positive -> lighter
    const num = parseInt(hex.replace('#',''),16);
    const r = (num>>16) + Math.round((255 - (num>>16)) * (percent/100));
    const g = ((num>>8)&0x00FF) + Math.round((255 - ((num>>8)&0x00FF)) * (percent/100));
    const b = (num&0x0000FF) + Math.round((255 - (num&0x0000FF)) * (percent/100));
    return '#'+((1<<24) + (clampInt(r,0,255)<<16) + (clampInt(g,0,255)<<8) + clampInt(b,0,255)).toString(16).slice(1);
  }

  function clampInt(v,a,b){ return Math.max(a, Math.min(b, Math.round(v))); }

  function drawApples(ctx, w, h, apples, t){
    for(const a of apples){
      ctx.beginPath(); ctx.fillStyle = a.color; ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 6;
      ctx.arc(a.x*w, a.y*h, a.r, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
    }
  }

  function drawBlossoms(ctx, w, h, petals, t){
    ctx.fillStyle = APPEARANCE.blossomPink;
    for(const p of petals){ ctx.beginPath(); ctx.ellipse(p.x*w, p.y*h, p.r, p.r*0.6, p.rot, 0, Math.PI*2); ctx.fill(); }
  }

  function drawLeaves(ctx,w,h,leaves){ ctx.fillStyle = APPEARANCE.leafGreen; for(const l of leaves){ ctx.beginPath(); ctx.ellipse(l.x*w,l.y*h,l.r,l.r*0.6, l.rot,0,Math.PI*2); ctx.fill(); }}

  function drawSnow(ctx,w,h,snow){ ctx.fillStyle = APPEARANCE.snowColor; for(const s of snow){ ctx.beginPath(); ctx.arc(s.x*w, s.y*h, s.r,0,Math.PI*2); ctx.fill(); }}

  function drawLights(ctx,w,h,lights){ for(const L of lights){ ctx.beginPath(); ctx.fillStyle = L.color; ctx.globalAlpha = L.alpha; ctx.arc(L.x*w, L.y*h, L.r,0,Math.PI*2); ctx.fill(); } ctx.globalAlpha = 1; }

  // create drifting particles and seasonal decorations
  function makeApples(count){ const arr=[]; for(let i=0;i<count;i++){ arr.push({ x: 0.4 + Math.random()*0.2, y: 0.4 + Math.random()*0.28, r: 4 + Math.random()*3, color: APPEARANCE.appleRed }); } return arr; }
  function makePetals(count){ const arr=[]; for(let i=0;i<count;i++){ arr.push({ x: 0.35 + Math.random()*0.3, y: 0.35 + Math.random()*0.3, r: 2 + Math.random()*2, rot: Math.random()*Math.PI*2 }); } return arr; }
  function makeLeaves(count){ const arr=[]; for(let i=0;i<count;i++){ arr.push({ x: 0.32 + Math.random()*0.36, y: 0.36 + Math.random()*0.3, r: 3 + Math.random()*3, rot: Math.random()*Math.PI*2 }); } return arr; }
  function makeSnow(count){ const arr=[]; for(let i=0;i<count;i++){ arr.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random()*2, vy: 0.2 + Math.random()*0.6 }); } return arr; }
  function makeLights(count){ const cols = [APPEARANCE.lightGold, '#FF6B6B', '#8AE6C1', '#A1CFF0']; const arr=[]; for(let i=0;i<count;i++){ arr.push({ x: 0.3 + Math.random()*0.4, y: 0.35 + Math.random()*0.28, r: 1.6 + Math.random()*1.6, color: cols[i%cols.length], alpha: 0.6 + Math.random()*0.4 }); } return arr; }

  // animation runner
  document.addEventListener('DOMContentLoaded', ()=>{
    const el = document.getElementById(CANVAS_ID);
    if(!el) return; const { canvas, ctx } = (function(){ const c = setupCanvas(); if(!c) return {}; return { canvas: c.canvas, ctx: c.ctx }; })();
    if(!canvas || !ctx) return;

    let season = getSeason();
    let apples = makeApples(6);
    let petals = makePetals(10);
    let leaves = makeLeaves(12);
    let snow = makeSnow(28);
    let lights = makeLights(6);

    // visibility handling
    let visible = true;
    document.addEventListener('visibilitychange', ()=>{ visible = document.visibilityState === 'visible'; });

    // intersection observer: pause if canvas not visible
    let ioPaused = false;
    try{
      const io = new IntersectionObserver((entries)=>{ entries.forEach(en=>{ ioPaused = !en.isIntersecting; }); }, { root: null, threshold: 0.05 });
      io.observe(canvas);
    }catch(e){ /* ignore */ }

    // watch for season changes on body
    const bodyObserver = new MutationObserver(()=>{ const s = getSeason(); if(s!==season){ season=s; /* regenerate decorations */ apples = makeApples(6); petals = makePetals(12); leaves = makeLeaves(12); snow = makeSnow(28); lights = makeLights(6); } });
    bodyObserver.observe(document.body, { attributes:true, attributeFilter:['class'] });

    let lastTime = 0; let fpsInterval = 1000 / (window.matchMedia('(max-width:480px)').matches? LOW_FPS : MAX_FPS);

    function step(timestamp){
      if(!visible || ioPaused){ lastTime = timestamp; requestAnimationFrame(step); return; }
      const elapsed = timestamp - lastTime;
      if(elapsed > fpsInterval){
        lastTime = timestamp - (elapsed % fpsInterval);
        renderFrame(ctx, canvas, season, apples, petals, leaves, snow, lights, timestamp/1000);
      }
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  });

  function renderFrame(ctx, canvas, season, apples, petals, leaves, snow, lights, t){
    const w = parseInt(canvas.style.width) || canvas.width/ (window.devicePixelRatio||1);
    const h = parseInt(canvas.style.height) || canvas.height/ (window.devicePixelRatio||1);
    // clear
    ctx.clearRect(0,0,w,h);

    // background vignette subtle
    const vg = ctx.createLinearGradient(0,0,0,h);
    vg.addColorStop(0, 'rgba(255,255,255,0.02)'); vg.addColorStop(1, 'rgba(0,0,0,0.02)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,w,h);

    // draw tree base
    drawTreeBase(ctx,w,h);

    // seasonal decorations
    if(season === 'spring'){
      // blossoms gently pulse
      for(const p of petals){ p.y -= 0.0006; p.x += Math.sin(t + p.x*10)*0.0006; if(p.y<0.26) p.y = 0.6 + Math.random()*0.12; }
      drawBlossoms(ctx,w,h,petals,t);
    }else if(season === 'summer' || season === 'summer-late'){
      // leaves and a few apples
      for(const l of leaves){ l.y += Math.sin(t + l.x*10)*0.0004; }
      drawLeaves(ctx,w,h,leaves);
      drawApples(ctx,w,h,apples,t);
    }else if(season === 'autumn'){
      // falling apples and leaves
      for(const a of apples){ a.y += 0.002 + Math.sin(t + a.x*20)*0.0008; a.x += Math.sin(t*0.4 + a.y*10)*0.0009; if(a.y>0.95){ a.y = 0.46 + Math.random()*0.18; a.x = 0.4 + Math.random()*0.2; } }
      for(const l of leaves){ l.y += 0.004 + Math.random()*0.003; l.x += Math.cos(t + l.x*10)*0.001; if(l.y>1.05){ l.y = 0.36 + Math.random()*0.24; l.x = 0.32 + Math.random()*0.36; } }
      drawLeaves(ctx,w,h,leaves);
      drawApples(ctx,w,h,apples,t);
    }else if(season === 'winter-frost' || season === 'winter-romance' || season === 'christmas-season'){
      // snow or lights
      for(const s of snow){ s.y += s.vy * 0.8; s.x += Math.sin(t*0.4 + s.y*10)*0.0008; if(s.y>1.05){ s.y = -0.05; s.x = Math.random(); } }
      drawSnow(ctx,w,h,snow);
      if(season === 'christmas-season') drawLights(ctx,w,h,lights);
    }else{
      // default small movement
      for(const l of leaves){ l.y += Math.sin(t + l.x*10)*0.0003; }
      drawLeaves(ctx,w,h,leaves);
      drawApples(ctx,w,h,apples,t);
    }

    // small seasonal overlay accent using CSS var if available
    const computed = getComputedStyle(document.documentElement);
    const accent = computed.getPropertyValue('--primary-accent').trim() || APPEARANCE.appleRed;
    // tiny glow
    ctx.beginPath(); ctx.fillStyle = accent; ctx.globalAlpha = 0.06; ctx.fillRect(w*0.06, h*0.06, w*0.88, h*0.88); ctx.globalAlpha = 1;
  }

})();
