// js/france-aoi.js
// France Aoi front-end prototype v2: expanded personality, typing indicator, quick replies, timestamps

(function(){
  const SCALE = 4; // 16px -> 64px
  const PIXEL_SIZE = 16;
  const AVATAR_SIZE = PIXEL_SIZE * SCALE; // 64

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
    6: '#1fb0ff',
    7: '#0047AB'
  };

  function createCanvas(w,h){ const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = (w) + 'px'; c.style.height = (h) + 'px'; return c; }

  function drawAvatar(ctx, outfitColor, blink){
    ctx.clearRect(0,0,PIXEL_SIZE*SCALE,PIXEL_SIZE*SCALE);
    for(let y=0;y<PIXEL_SIZE;y++){
      for(let x=0;x<PIXEL_SIZE;x++){
        const v = PIXEL_MAP[y] && PIXEL_MAP[y][x] ? PIXEL_MAP[y][x] : 0;
        let col = COLORS[v];
        if(v===7) col = outfitColor || COLORS[7];
        if(blink && y===8 && x>=6 && x<=9) { col = COLORS[5]; }
        if(col && col !== 'rgba(0,0,0,0)'){
          ctx.fillStyle = col;
          ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);
        }
      }
    }
  }

  // Basic client-side fallback responder (safe, non-LLM)
  function clientFallbackRespond(text){
    const m = (text||'').toLowerCase();
    if(/suicide|kill myself|end my life|hurt myself/.test(m)){
      return "I'm sorry you're feeling this way. I can't help with instructions, but if you're at immediate risk please contact local emergency services. Consider reaching out to a trusted person or a crisis hotline in your country.";
    }
    if(m.includes('star')||m.includes('astron')) return 'Stars are like stories — both are ancient lights we learn to read.';
    if(m.includes('art')) return 'Art is a conversation between maker and time.';
    if(m.includes('history')||m.includes('war')||m.includes('atrocity')) return 'Content warning: this discusses historical violence — here is a factual, non-graphic summary. Please ask for details if you want them.';
    if(m.includes('hello')||m.includes('hi')) return 'Hmph. Hello. Don\'t get used to it.';
    if(m.includes('recommend')) return 'Try reading about Romanticism and its relationship to early astronomy — surprising connections.';
    return "I'm not sure — could you say a bit more? I can discuss science, art, history, and culture.";
  }

  async function askServerAoi(message){
    try{
      const r = await fetch('/api/aoi/query', { method: 'POST', headers: {'Content-Type':'application/json'}, credentials: 'include', body: JSON.stringify({ message }) });
      if(!r.ok) throw new Error('server');
      const j = await r.json();
      return j.reply || clientFallbackRespond(message);
    }catch(e){
      return clientFallbackRespond(message);
    }
  }

  function formatTime(date){ return date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }

  function createAoiTab(){
    const tab = document.createElement('div'); tab.className = 'france-aoi-tab'; tab.setAttribute('role','button'); tab.setAttribute('aria-label','Open France Aoi'); tab.tabIndex = 0;
    const avatarCanvas = createCanvas(PIXEL_SIZE*SCALE, PIXEL_SIZE*SCALE);
    avatarCanvas.style.width = AVATAR_SIZE + 'px'; avatarCanvas.style.height = AVATAR_SIZE + 'px'; avatarCanvas.style.imageRendering = 'pixelated';
    tab.appendChild(avatarCanvas);

    const scene = document.createElement('div'); scene.className = 'france-scene'; const sceneCanvas = createCanvas(160,120); scene.appendChild(sceneCanvas);

    const panel = document.createElement('div'); panel.className = 'france-aoi-panel hidden';
    panel.innerHTML = `
      <div class="header"><div style="flex:1"><h4 style="margin:0">France Aoi</h4><small class="muted">Tsundere guide</small></div><div style="display:flex;gap:6px;align-items:center"><select id="aoi-personality"><option value="tsundere">Tsundere</option><option value="librarian">Librarian</option><option value="friendly">Friendly</option></select><button id="aoi-close" aria-label="Close">×</button></div></div>
      <div class="content" id="aoi-content"></div>
      <div class="quick-replies" id="aoi-quick"></div>
      <div class="input-row"><input id="aoi-input" placeholder="Ask France Aoi..." aria-label="Ask France Aoi"/><button id="aoi-send">Say</button></div>
      <div class="typing muted" id="aoi-typing" style="display:none;padding:8px 12px;font-size:13px">France Aoi is thinking...</div>
    `;

    document.body.appendChild(tab);
    document.body.appendChild(scene);
    document.body.appendChild(panel);

    const ctx = avatarCanvas.getContext('2d');
    let blink = false;
    drawAvatar(ctx, currentOutfit(), blink);

    // blink animation
    setInterval(()=>{ blink=true; drawAvatar(ctx, currentOutfit(), blink); setTimeout(()=>{ blink=false; drawAvatar(ctx, currentOutfit(), blink); }, 220); }, 4500 + Math.random()*3000);

    // gentle bob
    let bob = 0; let bobDir = 1;
    setInterval(()=>{ bob += 0.2 * bobDir; if(Math.abs(bob) > 2) bobDir *= -1; tab.style.transform = `translateY(${bob}px)`; }, 100);

    // scene draw
    const sctx = sceneCanvas.getContext('2d');
    function drawScene(){ const hour = new Date().getHours(); const night = hour < 7 || hour >= 19; const bg1 = night ? '#04102a' : '#bfe7ff'; const bg2 = night ? '#001422' : '#ffffff'; const g = sctx.createLinearGradient(0,0,0,120); g.addColorStop(0,bg1); g.addColorStop(1,bg2); sctx.fillStyle = g; sctx.fillRect(0,0,160,120); sctx.fillStyle = '#3b2414'; sctx.fillRect(20,60,8,40); sctx.fillStyle = '#12421a'; sctx.beginPath(); sctx.arc(24,52,28,0,Math.PI*2); sctx.fill(); const t = Date.now()/400; const px = 110 + Math.sin(t)*6, py = 86 + Math.cos(t/1.5)*2; sctx.fillStyle = '#c45a2a'; sctx.beginPath(); sctx.arc(px,py,6,0,Math.PI*2); sctx.fill(); sctx.fillStyle = '#fff'; sctx.fillRect(60,78,14,18); }
    setInterval(drawScene, 1000/15); drawScene();

    // drag logic
    let dragging = false; let startX=0,startY=0, ox=16, oy=16; const storeKey = 'aoi-tab-pos'; const saved = localStorage.getItem(storeKey);
    if(saved){ try{ const p = JSON.parse(saved); tab.style.left = p.x + 'px'; tab.style.top = p.y + 'px'; scene.style.left = (p.x) + 'px'; scene.style.top = (p.y + 80) + 'px'; }catch(e){} }

    tab.addEventListener('pointerdown', (e)=>{ dragging = true; startX = e.clientX; startY = e.clientY; ox = parseInt(tab.style.left||16,10); oy = parseInt(tab.style.top||16,10); tab.setPointerCapture(e.pointerId); });
    window.addEventListener('pointermove',(e)=>{ if(!dragging) return; const nx = ox + (e.clientX - startX); const ny = oy + (e.clientY - startY); tab.style.left = nx + 'px'; tab.style.top = ny + 'px'; scene.style.left = nx + 'px'; scene.style.top = (ny + 80) + 'px'; });
    window.addEventListener('pointerup',(e)=>{ if(!dragging) return; dragging=false; try{ localStorage.setItem(storeKey, JSON.stringify({ x: parseInt(tab.style.left,10), y: parseInt(tab.style.top,10) })); }catch(e){} });

    // toggle panel
    const closeBtn = panel.querySelector('#aoi-close'); closeBtn.addEventListener('click', ()=>panel.classList.add('hidden'));
    tab.addEventListener('click',(e)=>{ panel.classList.toggle('hidden'); });

    // chat UI
    const content = panel.querySelector('#aoi-content'); const input = panel.querySelector('#aoi-input'); const sendBtn = panel.querySelector('#aoi-send'); const typing = panel.querySelector('#aoi-typing'); const quick = panel.querySelector('#aoi-quick'); const personaSelect = panel.querySelector('#aoi-personality');

    // curated tsundere-friendly scripts (expanded to 20-ish)
    const SCRIPTS = [
      'Hello. What do you want? (I mean, welcome...)',
      'Want a reading suggestion? I can recommend something thoughtful.',
      'Ask me about astronomy, art, philosophy, or history.',
      'I can make a simple study guide for a topic you choose.',
      'Shall we explore a connection between science and art?',
      'The phases of the moon mark time in a poetic way.',
      'Romanticism reacted to the Industrial Revolution with emotional intensity.',
      'Dark ages is a misleading term; complexity persisted even then.',
      'Science and art both ask us to look, listen, and compare.',
      'A good question can be more illuminating than a long answer.',
      'Museums preserve conversation across generations.',
      'If you like music, I can suggest a seasonal playlist.',
      'The night sky is a map of our curiosity.',
      'Need a short reading list? I can prepare one on the fly.',
      'I prefer tea, but I won\'t stop you from choosing coffee.',
      'When studying history, ask about causes, not just dates.',
      'Ethics matters: ask not only what happened, but why it mattered.',
      'Small experiments can lead to surprising discoveries.',
      'Architecture is frozen music, some say; it organizes human movement.',
      'If you want a gentle story, I can tell one about summer evenings.'
    ];

    // populate quick replies
    const QUICK = ['Tell me about the moon','Recommend a book','Explain Romanticism','Tell me a short history fact'];
    QUICK.forEach(q=>{ const b = document.createElement('button'); b.textContent = q; b.className='quick-btn'; b.addEventListener('click', ()=>{ input.value = q; sendBtn.click(); }); quick.appendChild(b); });

    function appendMessage(who, text){ const el = document.createElement('div'); el.className = 'msg '+who; const ts = document.createElement('div'); ts.className='ts'; ts.textContent = formatTime(new Date()); el.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`; el.appendChild(ts); content.appendChild(el); content.scrollTop = content.scrollHeight; }

    function escapeHtml(s){ return (s+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

    // server-backed ask with typing indicator
    async function askAndReply(text){ typing.style.display='block'; try{ const reply = await askServerAoi(text); typing.style.display='none'; appendMessage('aoi', reply); }catch(e){ typing.style.display='none'; appendMessage('aoi', "I'm sorry — something went wrong."); }
    }

    // initial greeting
    appendMessage('aoi', SCRIPTS[Math.floor(Math.random()*SCRIPTS.length)]);

    sendBtn.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; appendMessage('user', v); input.value=''; askAndReply(v); });
    input.addEventListener('keydown',(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendBtn.click(); } });

    // personality select effect (client-only flavor changes)
    personaSelect.addEventListener('change', ()=>{ localStorage.setItem('aoi-personality', personaSelect.value); const tone = personaSelect.value; // minor effect on quick replies
      if(tone==='tsundere') quick.querySelectorAll('button').forEach(b=>b.style.opacity='1');
      else quick.querySelectorAll('button').forEach(b=>b.style.opacity='0.9');
    });

    return { tab, panel, scene };
  }

  // outfit helper
  function currentOutfit(){ const season = (localStorage.getItem('season-override')) || detectSeason(); if(season==='winter') return '#8eb6ff'; if(season==='spring') return '#ffd1dc'; if(season==='summer') return '#ffdf7a'; if(season==='autumn') return '#c88c6a'; return '#0047AB'; }
  function detectSeason(){ const m = new Date().getMonth()+1; if(m>=12||m<=1) return 'winter'; if(m>=2 && m<=3) return 'winter'; if(m>=4 && m<=6) return 'spring'; if(m>=7 && m<=9) return 'summer'; return 'autumn'; }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{ try{ createAoiTab(); }catch(e){ console.error('France Aoi init error', e); } });
})();
