// js/france-aoi.js
// France Aoi front-end prototype v4: client-side animated frames, smooth outfit transitions, reply cache

(function(){
  const SCALE = 4; // 16px -> 64px
  const PIXEL_SIZE = 16;
  const AVATAR_SIZE = PIXEL_SIZE * SCALE; // 64

  // Basic 16x16 pixel map (base) — numeric keys reused for color mapping
  const PIXEL_MAP = [
    [0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,0],
    [0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0],
    [0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0],
    [0,0,0,6,6,6,6,6,6,6,6,6,6,0,0,0],
    [0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0],
    [0,6,6,6,5,5,5,5,5,5,5,5,6,6,6,0],
    [0,6,6,5,5,5,2,2,2,2,5,5,5,6,6,0],
    [6,6,5,5,2,2,2,2,2,2,2,2,5,5,6,6],
    [6,6,5,5,2,2,3,2,2,3,2,2,5,5,6,6],
    [6,6,5,5,2,2,2,2,2,2,2,2,5,5,6,6],
    [0,6,6,5,5,5,5,5,5,5,5,5,6,6,6,0],
    [0,0,6,6,6,6,6,6,6,6,6,6,6,6,0,0],
    [0,0,0,6,6,6,7,7,7,7,6,6,6,0,0,0],
    [0,0,0,0,6,6,6,6,6,6,6,6,0,0,0,0],
    [0,0,0,0,0,6,6,6,6,6,6,0,0,0,0,0],
    [0,0,0,0,0,0,6,6,0,6,0,0,0,0,0,0]
  ];

  const COLORS = {
    0: 'rgba(0,0,0,0)',
    1: '#f1c27d',
    2: '#ffffff',
    3: '#2b6ea3',
    4: '#ffb7c5',
    5: '#e9d6c7',
    6: '#1fb0ff', // hair
    7: '#0047AB'  // shirt (will be overridden by outfit)
  };

  // utility: convert hex to rgb array
  function hexToRgb(hex){ const h = hex.replace('#',''); return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]; }
  function rgbToHex(r,g,b){ return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join(''); }
  function lerp(a,b,t){ return Math.round(a + (b-a)*t); }
  function lerpColor(aHex,bHex,t){ const a = hexToRgb(aHex); const b = hexToRgb(bHex); return rgbToHex(lerp(a[0],b[0],t), lerp(a[1],b[1],t), lerp(a[2],b[2],t)); }

  // Avatar animation state
  const avatarState = {
    outfitColor: '#0047AB',
    outfitTarget: '#0047AB',
    outfitAnimStart: 0,
    outfitAnimDur: 400,
    blinkUntil: 0,
    tiltUntil: 0,
    frame: 0
  };

  // reply cache (client-side) to speed up repeat replies
  const replyCache = new Map();

  // small set of outfits (64px primary colors)
  const OUTFITS = [
    { id: 'default', color: '#0047AB', label: 'Default' },
    { id: 'winter', color: '#8eb6ff', label: 'Winter Coat' },
    { id: 'spring', color: '#ffd1dc', label: 'Spring Cardigan' },
    { id: 'summer', color: '#ffdf7a', label: 'Summer Casual' },
    { id: 'autumn', color: '#c88c6a', label: 'Autumn Sweater' },
    { id: 'psg', color: '#0015B3', label: 'PSG Jersey' }
  ];

  // AUDIO: lightweight WebAudio (already in v3) - reused helpers
  const audioState = { muted: localStorage.getItem('aoi-muted') === '1' };
  let audioCtx = null;
  function ensureAudio(){ if(audioState.muted) return null; if(audioCtx) return audioCtx; try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }catch(e){ return null; } }
  function playTone(freq, type='sine', dur=0.12, gain=0.12){ const ctx = ensureAudio(); if(!ctx) return; const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime); g.gain.setValueAtTime(gain, ctx.currentTime); o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur); }
  function playChime(kind){ if(audioState.muted) return; const ctx = ensureAudio(); if(!ctx) return; if(kind === 'open'){ playTone(740,'sine',0.08,0.06); setTimeout(()=>playTone(1046,'sine',0.12,0.08),90); } else if(kind === 'close'){ playTone(440,'sine',0.12,0.08); } else if(kind === 'notify'){ playTone(880,'triangle',0.06,0.06); } else if(kind === 'typing'){ playTone(1400,'sine',0.02,0.02); } }
  function playBark(){ if(audioState.muted) return; const ctx = ensureAudio(); if(!ctx) return; const dur = 0.12; const bufferSize = ctx.sampleRate * dur; const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate); const data = buffer.getChannelData(0); for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * Math.exp(-i/(bufferSize/6)); } const src = ctx.createBufferSource(); const g = ctx.createGain(); src.buffer = buffer; g.gain.setValueAtTime(0.18, ctx.currentTime); src.connect(g); g.connect(ctx.destination); src.start(); }
  function toggleMute(on){ audioState.muted = on; localStorage.setItem('aoi-muted', on ? '1':'0'); if(!on) { try{ ensureAudio().resume(); }catch(e){} } }

  function createCanvas(w,h){ const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = (w) + 'px'; c.style.height = (h) + 'px'; return c; }

  function drawAvatarFrame(ctx, outfitColor, frame){
    // frame: 'neutral' | 'blink' | 'tilt' | 'smile' etc.
    ctx.clearRect(0,0,PIXEL_SIZE*SCALE,PIXEL_SIZE*SCALE);
    for(let y=0;y<PIXEL_SIZE;y++){
      for(let x=0;x<PIXEL_SIZE;x++){
        const v = PIXEL_MAP[y] && PIXEL_MAP[y][x] ? PIXEL_MAP[y][x] : 0;
        let col = COLORS[v];
        if(v===7) col = outfitColor || COLORS[7];
        // eyes/mouth tweaks per frame
        if(frame === 'blink' && y===8 && x>=6 && x<=9){ col = COLORS[5]; }
        if(frame === 'tilt'){
          // slight shading to simulate tilt (shift some hair pixels darker)
          if(v===6 && (x+y)%7===0) col = shade(col, -12);
        }
        if(col && col !== 'rgba(0,0,0,0)'){
          ctx.fillStyle = col;
          ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);
        }
      }
    }
    // optional small mouth for smile frame
    if(frame === 'smile'){
      ctx.fillStyle = '#000000'; ctx.fillRect(7*SCALE,11*SCALE,2*SCALE,1*SCALE); ctx.fillRect(9*SCALE,11*SCALE,2*SCALE,1*SCALE);
    }
  }

  function shade(hex, percent){ const rgb = hexToRgb(hex); const r = Math.max(0, Math.min(255, Math.round(rgb[0] + percent))); const g = Math.max(0, Math.min(255, Math.round(rgb[1] + percent))); const b = Math.max(0, Math.min(255, Math.round(rgb[2] + percent))); return rgbToHex(r,g,b); }

  // Animated outfit transition (lerp color)
  function animateOutfitTo(targetHex, duration=400){ avatarState.outfitAnimStart = performance.now(); avatarState.outfitStart = avatarState.outfitColor; avatarState.outfitTarget = targetHex; avatarState.outfitAnimDur = duration; }

  // local responder + server ask with cache
  async function askServerAoi(message){
    const key = String(message).trim(); if(replyCache.has(key)) return replyCache.get(key);
    try{
      const r = await fetch('/api/aoi/query', { method:'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ message: key }) });
      if(!r.ok) throw new Error('server'); const j = await r.json(); const reply = j.reply || clientFallbackRespond(key); replyCache.set(key, reply); return reply;
    }catch(e){ const r = clientFallbackRespond(key); replyCache.set(key, r); return r; }
  }

  // fallback responder (unchanged)
  function clientFallbackRespond(text){ const m = (text||'').toLowerCase(); if(/suicide|kill myself|end my life|hurt myself/.test(m)){ return "I'm sorry you're feeling this way. I can't help with instructions, but if you're at immediate risk please contact local emergency services. Consider reaching out to a trusted person or a crisis hotline in your country."; } if(m.includes('star')||m.includes('astron')) return 'Stars are like stories — both are ancient lights we learn to read.'; if(m.includes('art')) return 'Art is a conversation between maker and time.'; if(m.includes('history')||m.includes('war')||m.includes('atrocity')) return 'Content warning: this discusses historical violence — here is a factual, non-graphic summary. Please ask for details if you want them.'; if(m.includes('hello')||m.includes('hi')) return 'Hmph. Hello. Don\'t get used to it.'; if(m.includes('recommend')) return 'Try reading about Romanticism and its relationship to early astronomy — surprising connections.'; return "I'm not sure — could you say a bit more? I can discuss science, art, history, and culture."; }

  function formatTime(date){ return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
  function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Create and wire UI including outfit swatches
  function createAoiTab(){
    const tab = document.createElement('div'); tab.className = 'france-aoi-tab'; tab.setAttribute('role','button'); tab.setAttribute('aria-label','Open France Aoi'); tab.tabIndex = 0;
    const avatarCanvas = createCanvas(PIXEL_SIZE*SCALE, PIXEL_SIZE*SCALE);
    avatarCanvas.style.width = AVATAR_SIZE + 'px'; avatarCanvas.style.height = AVATAR_SIZE + 'px'; avatarCanvas.style.imageRendering = 'pixelated'; tab.appendChild(avatarCanvas);

    const scene = document.createElement('div'); scene.className = 'france-scene'; const sceneCanvas = createCanvas(200,150); scene.appendChild(sceneCanvas);

    const panel = document.createElement('div'); panel.className = 'france-aoi-panel hidden';
    panel.innerHTML = `
      <div class="header"><div style="flex:1"><h4 style="margin:0">France Aoi</h4><small class="muted">Tsundere guide</small></div><div id="aoi-swatches" style="display:flex;gap:6px;margin-right:8px"></div><div style="display:flex;gap:6px;align-items:center"><select id="aoi-personality"><option value="tsundere">Tsundere</option><option value="librarian">Librarian</option><option value="friendly">Friendly</option></select><button id="aoi-mute" aria-label="Mute">🔊</button><button id="aoi-close" aria-label="Close">×</button></div></div>
      <div class="content" id="aoi-content"></div>
      <div class="quick-replies" id="aoi-quick"></div>
      <div class="input-row"><input id="aoi-input" placeholder="Ask France Aoi..." aria-label="Ask France Aoi"/><button id="aoi-send">Say</button></div>
      <div class="typing muted" id="aoi-typing" style="display:none;padding:8px 12px;font-size:13px">France Aoi is thinking...</div>
    `;

    document.body.appendChild(tab); document.body.appendChild(scene); document.body.appendChild(panel);

    const ctx = avatarCanvas.getContext('2d');

    // initial draw
    drawAvatarFrame(ctx, avatarState.outfitColor, 'neutral');

    // set up swatches
    const swatches = panel.querySelector('#aoi-swatches'); OUTFITS.forEach(o=>{ const b = document.createElement('button'); b.className='swatch'; b.title = o.label; b.style.width='22px'; b.style.height='22px'; b.style.borderRadius='6px'; b.style.border='1px solid rgba(0,0,0,0.06)'; b.style.background=o.color; b.addEventListener('click', ()=>{ animateOutfitTo(o.color, 550); }); swatches.appendChild(b); });

    // avatar animation loop
    function avatarLoop(now){ // outfit transition
      if(avatarState.outfitAnimStart){ const t = Math.min(1, (now - avatarState.outfitAnimStart) / avatarState.outfitAnimDur); avatarState.outfitColor = lerpColor(avatarState.outfitStart, avatarState.outfitTarget, t); if(t>=1) avatarState.outfitAnimStart = 0; }
      // choose frame: blink if blinkUntil > now, else tilt until tiltUntil
      const frame = Date.now() < avatarState.blinkUntil ? 'blink' : (Date.now() < avatarState.tiltUntil ? 'tilt' : 'neutral');
      drawAvatarFrame(ctx, avatarState.outfitColor, frame);
      requestAnimationFrame(avatarLoop);
    }
    requestAnimationFrame(avatarLoop);

    // scene draw and barking earlier similar to v3
    const sctx = sceneCanvas.getContext('2d'); let lastBark=0;
    function drawScene(){ const hour=new Date().getHours(); const night = hour<7||hour>=19; const bg1=night?'#04102a':'#bfe7ff'; const bg2=night?'#001422':'#ffffff'; const g=sctx.createLinearGradient(0,0,0,150); g.addColorStop(0,bg1); g.addColorStop(1,bg2); sctx.fillStyle=g; sctx.fillRect(0,0,200,150); sctx.fillStyle='#3b2414'; sctx.fillRect(26,70,8,50); sctx.fillStyle='#12421a'; sctx.beginPath(); sctx.arc(30,58,36,0,Math.PI*2); sctx.fill(); const t=Date.now()/400; const px=140+Math.sin(t)*6; const py=110+Math.cos(t/1.5)*2; sctx.fillStyle='#c45a2a'; sctx.beginPath(); sctx.arc(px,py,6,0,Math.PI*2); sctx.fill(); if(Date.now()-lastBark>6000 && Math.random()<0.008){ playBark(); lastBark=Date.now(); } sctx.fillStyle='#fff'; sctx.fillRect(70,98,18,20); }
    setInterval(drawScene, 1000/15); drawScene();

    // drag logic (unchanged)
    let dragging=false; let startX=0,startY=0,ox=20,oy=80; const storeKey='aoi-tab-pos'; const saved=localStorage.getItem(storeKey); if(saved){ try{ const p=JSON.parse(saved); tab.style.left=p.x+'px'; tab.style.top=p.y+'px'; scene.style.left=(p.x)+'px'; scene.style.top=(p.y+110)+'px'; }catch(e){} }
    tab.addEventListener('pointerdown',(e)=>{ dragging=true; startX=e.clientX; startY=e.clientY; ox=parseInt(tab.style.left||20,10); oy=parseInt(tab.style.top||80,10); tab.setPointerCapture(e.pointerId); });
    window.addEventListener('pointermove',(e)=>{ if(!dragging) return; const nx=ox+(e.clientX-startX); const ny=oy+(e.clientY-startY); tab.style.left=nx+'px'; tab.style.top=ny+'px'; scene.style.left=nx+'px'; scene.style.top=(ny+110)+'px'; });
    window.addEventListener('pointerup',(e)=>{ if(!dragging) return; dragging=false; try{ localStorage.setItem(storeKey, JSON.stringify({ x: parseInt(tab.style.left,10), y: parseInt(tab.style.top,10) })); }catch(e){} });

    // toggle panel and audio
    const closeBtn = panel.querySelector('#aoi-close'); const muteBtn = panel.querySelector('#aoi-mute'); function setMuteButton(){ muteBtn.textContent = audioState.muted ? '🔇' : '🔊'; } setMuteButton(); muteBtn.addEventListener('click', ()=>{ toggleMute(!audioState.muted); setMuteButton(); });
    closeBtn.addEventListener('click', ()=>{ panel.classList.add('hidden'); playChime('close'); });
    tab.addEventListener('click',(e)=>{ const wasHidden = panel.classList.contains('hidden'); panel.classList.toggle('hidden'); if(wasHidden) { playChime('open'); } else { playChime('close'); } });

    // chat UI wiring
    const content = panel.querySelector('#aoi-content'); const input = panel.querySelector('#aoi-input'); const sendBtn = panel.querySelector('#aoi-send'); const typing = panel.querySelector('#aoi-typing'); const quick = panel.querySelector('#aoi-quick');
    const QUICK = ['Tell me about the moon','Recommend a book','Explain Romanticism','Tell me a short history fact']; QUICK.forEach(q=>{ const b=document.createElement('button'); b.textContent=q; b.className='quick-btn'; b.addEventListener('click',()=>{ input.value=q; sendBtn.click(); }); quick.appendChild(b); });

    function appendMessage(who,text){ const el=document.createElement('div'); el.className='msg '+who; const ts=document.createElement('div'); ts.className='ts'; ts.textContent=formatTime(new Date()); el.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`; el.appendChild(ts); content.appendChild(el); content.scrollTop = content.scrollHeight; }

    async function askAndReply(text){ typing.style.display='block'; playChime('typing'); // small blink while thinking
      avatarState.blinkUntil = Date.now() + 250;
      try{ const reply = await askServerAoi(text); typing.style.display='none'; appendMessage('aoi', reply); playChime('notify'); }catch(e){ typing.style.display='none'; appendMessage('aoi', "I'm sorry — something went wrong."); }
    }

    // initial greeting
    appendMessage('aoi', (localStorage.getItem('aoi-greet') || 'Hello. What do you want? (I mean, welcome...)'));

    sendBtn.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; appendMessage('user', v); input.value=''; askAndReply(v); });
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendBtn.click(); } });

    return { tab, panel, scene };
  }

  // outfit detection and auto-apply based on season (keeps behavior consistent)
  function currentOutfitColor(){ const season = (localStorage.getItem('season-override')) || detectSeason(); if(season==='winter') return '#8eb6ff'; if(season==='spring') return '#ffd1dc'; if(season==='summer') return '#ffdf7a'; if(season==='autumn') return '#c88c6a'; return '#0047AB'; }
  function detectSeason(){ const m=new Date().getMonth()+1; if(m>=12||m<=1) return 'winter'; if(m>=2&&m<=3) return 'winter'; if(m>=4&&m<=6) return 'spring'; if(m>=7&&m<=9) return 'summer'; return 'autumn'; }

  // Init: set initial outfit color from season and create tab
  document.addEventListener('DOMContentLoaded', ()=>{ try{ avatarState.outfitColor = currentOutfitColor(); avatarState.outfitTarget = avatarState.outfitColor; createAoiTab(); }catch(e){ console.error('France Aoi init error', e); } });
})();
