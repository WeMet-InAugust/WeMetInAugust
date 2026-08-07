// js/france-aoi.js
// France Aoi front-end prototype: pixel-avatar tab (16x16 scaled), draggable, idle scene, chat panel

(function(){
  const SCALE = 4; // base pixels scaled to SIZE (16*4 = 64px)
  const PIXEL_SIZE = 16;
  const AVATAR_SIZE = PIXEL_SIZE * SCALE; // 64

  // simple 16x16 pixel map for a blue-haired avatar (very stylized)
  // 0 = transparent, other numbers map to colors below
  const PIXEL_MAP = [
    // 16 rows of 16 values
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
    1: '#f1c27d', // skin
    2: '#ffffff', // eyes/white
    3: '#2b6ea3', // iris lighter
    4: '#ffb7c5', // cheek blush (not used)
    5: '#e9d6c7', // face light
    6: '#1fb0ff', // hair bright blue
    7: '#0047AB'  // shirt default (cobalt)
  };

  function createCanvas(w,h){ const c = document.createElement('canvas'); c.width = w; c.height = h; c.style.width = (w) + 'px'; c.style.height = (h) + 'px'; return c; }

  function drawAvatar(ctx, outfitColor, blink){
    // ctx is canvas context 2d scaled to PIXEL_SIZE*SCALE
    ctx.clearRect(0,0,PIXEL_SIZE*SCALE,PIXEL_SIZE*SCALE);
    for(let y=0;y<PIXEL_SIZE;y++){
      for(let x=0;x<PIXEL_SIZE;x++){
        const v = PIXEL_MAP[y] && PIXEL_MAP[y][x] ? PIXEL_MAP[y][x] : 0;
        let col = COLORS[v];
        if(v===7) col = outfitColor || COLORS[7];
        // eyes: simulate blink
        if(blink && ( (y===8 && (x===6||x===9)) || (y===8 && (x>=6 && x<=9)) )){
          // draw closed eye as a darker skin line
          if(x>=6 && x<=9 && y===8) { col = COLORS[5]; }
        }
        if(col && col !== 'rgba(0,0,0,0)'){
          ctx.fillStyle = col;
          ctx.fillRect(x*SCALE, y*SCALE, SCALE, SCALE);
        }
      }
    }
  }

  function createAoiTab(){
    const tab = document.createElement('div'); tab.className = 'france-aoi-tab'; tab.setAttribute('role','button'); tab.setAttribute('aria-label','Open France Aoi'); tab.tabIndex = 0;
    const avatarCanvas = createCanvas(PIXEL_SIZE*SCALE, PIXEL_SIZE*SCALE);
    avatarCanvas.style.width = AVATAR_SIZE + 'px'; avatarCanvas.style.height = AVATAR_SIZE + 'px'; avatarCanvas.style.imageRendering = 'pixelated';
    tab.appendChild(avatarCanvas);

    const scene = document.createElement('div'); scene.className = 'france-scene'; const sceneCanvas = createCanvas(160,120); scene.appendChild(sceneCanvas);

    const panel = document.createElement('div'); panel.className = 'france-aoi-panel hidden';
    panel.innerHTML = `
      <div class="header"><h4>France Aoi</h4><small class="muted">Tsundere guide</small></div>
      <div class="content" id="aoi-content"></div>
      <div class="input-row"><input id="aoi-input" placeholder="Ask France Aoi..."/><button id="aoi-send">Say</button></div>
    `;

    document.body.appendChild(tab);
    document.body.appendChild(scene);
    document.body.appendChild(panel);

    const ctx = avatarCanvas.getContext('2d');
    let blink = false;
    drawAvatar(ctx, '#0047AB', blink);

    // simple idle animation: blink every few seconds and gentle bob
    setInterval(()=>{
      blink = true; drawAvatar(ctx, currentOutfit(), blink);
      setTimeout(()=>{ blink=false; drawAvatar(ctx, currentOutfit(), blink); }, 200);
    }, 4500 + Math.random()*3000);

    let bob = 0;
    let bobDir = 1;
    setInterval(()=>{
      bob += 0.2 * bobDir; if(Math.abs(bob) > 2) bobDir *= -1; tab.style.transform = `translateY(${bob}px)`; }, 100);

    // draw simple scene and poodle
    const sctx = sceneCanvas.getContext('2d');
    function drawScene(){
      const hour = new Date().getHours();
      const night = hour < 7 || hour >= 19;
      // background
      const bg1 = night ? '#04102a' : '#bfe7ff';
      const bg2 = night ? '#001422' : '#ffffff';
      const g = sctx.createLinearGradient(0,0,0,120); g.addColorStop(0,bg1); g.addColorStop(1,bg2); sctx.fillStyle = g; sctx.fillRect(0,0,160,120);
      // apple tree simple trunk
      sctx.fillStyle = '#3b2414'; sctx.fillRect(20,60,8,40);
      sctx.fillStyle = '#12421a'; sctx.beginPath(); sctx.arc(24,52,28,0,Math.PI*2); sctx.fill();
      // poodle (simple circle) animate
      const t = Date.now()/400;
      const px = 110 + Math.sin(t)*6; const py = 86 + Math.cos(t/1.5)*2;
      sctx.fillStyle = '#c45a2a'; sctx.beginPath(); sctx.arc(px,py,6,0,Math.PI*2); sctx.fill();
      // Aoi sitting (tiny)
      sctx.fillStyle = '#fff'; sctx.fillRect(60,78,14,18);
    }
    setInterval(drawScene, 1000/15); drawScene();

    // drag logic for tab
    let dragging = false; let startX=0,startY=0, ox=16, oy=16;
    const storeKey = 'aoi-tab-pos';
    const saved = localStorage.getItem(storeKey);
    if(saved){ try{ const p = JSON.parse(saved); tab.style.left = p.x + 'px'; tab.style.top = p.y + 'px'; scene.style.left = (p.x) + 'px'; scene.style.top = (p.y + 80) + 'px'; }catch(e){} }

    tab.addEventListener('pointerdown', (e)=>{
      dragging = true; startX = e.clientX; startY = e.clientY; ox = parseInt(tab.style.left||16,10); oy = parseInt(tab.style.top||16,10);
      tab.setPointerCapture(e.pointerId);
    });
    window.addEventListener('pointermove',(e)=>{
      if(!dragging) return; const nx = ox + (e.clientX - startX); const ny = oy + (e.clientY - startY); tab.style.left = nx + 'px'; tab.style.top = ny + 'px'; scene.style.left = nx + 'px'; scene.style.top = (ny + 80) + 'px';
    });
    window.addEventListener('pointerup',(e)=>{ if(!dragging) return; dragging=false; try{ localStorage.setItem(storeKey, JSON.stringify({ x: parseInt(tab.style.left,10), y: parseInt(tab.style.top,10) })); }catch(e){} });

    // toggle panel on click (but not when dragging)
    let clickStart = 0; tab.addEventListener('click',(e)=>{
      // simple toggle
      if(panel.classList.contains('hidden')){ panel.classList.remove('hidden'); } else panel.classList.add('hidden');
    });

    // chat logic
    const content = panel.querySelector('#aoi-content');
    const input = panel.querySelector('#aoi-input'); const sendBtn = panel.querySelector('#aoi-send');
    const personality = localStorage.getItem('aoi-personality') || 'tsundere';
    const starterScripts = [
      'Hello. What do you want? (I mean, welcome...)',
      'Want a reading suggestion? I can recommend something thoughtful.',
      'Ask me about astronomy, art, philosophy, or history.',
      'I can make a simple study guide for a topic you choose.',
      'Shall we explore a connection between science and art?'
    ];
    function appendMessage(who, text){ const el = document.createElement('div'); el.className = 'msg '+who; el.textContent = text; content.appendChild(el); content.scrollTop = content.scrollHeight; }
    appendMessage('aoi', starterScripts[Math.floor(Math.random()*starterScripts.length)]);

    function respondTo(text){ text = text.toLowerCase(); if(text.includes('star')||text.includes('astron')) return 'Stars are like stories — both are ancient lights we learn to read.'; if(text.includes('art')) return 'Art is a conversation between maker and time.'; if(text.includes('hello')||text.includes('hi')) return 'Hmph. Hello. Don\'t get used to it.'; if(text.includes('recommend')) return 'Try reading about Romanticism and its relationship to early astronomy — surprising connections.'; return "I\'ll think about that. Tell me more."; }

    sendBtn.addEventListener('click', ()=>{ const v = input.value.trim(); if(!v) return; appendMessage('user', v); const r = respondTo(v); setTimeout(()=>appendMessage('aoi', r), 600 + Math.random()*700); input.value=''; });

    // expose some simple API
    return { tab, panel, scene };
  }

  // outfit helper
  function currentOutfit(){ const season = (localStorage.getItem('season-override')) || detectSeason(); if(season==='winter') return '#8eb6ff'; if(season==='spring') return '#ffd1dc'; if(season==='summer') return '#ffdf7a'; if(season==='autumn') return '#c88c6a'; return '#0047AB'; }
  function detectSeason(){ const m = new Date().getMonth()+1; if(m>=12||m<=1) return 'winter'; if(m>=2 && m<=3) return 'winter'; if(m>=4 && m<=6) return 'spring'; if(m>=7 && m<=9) return 'summer'; return 'autumn'; }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{ try{ createAoiTab(); }catch(e){ console.error('France Aoi init error', e); } });
})();
