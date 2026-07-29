// hero-gen.js
// Generates the hero landing vertical stripes (80+ blues), black separators,
// pixelated ?! symbols, and handles the initial cinematic transition.

(function(){
  const STRIPE_COUNT = 80; // number of vertical stripes to render
  const SYMBOL_COUNT = 36; // number of scattered pixel ?! symbols
  const containerId = 'heroStripesContainer';
  const symbolsLayerId = 'heroSymbolsLayer';

  // A rich curated list of blue shades (light -> dark). 80 entries or recycled
  const BLUES = [
    '#EAF6FF','#E1F3FF','#D6F0FF','#CCEDFF','#C2EAFF','#B8E7FF','#ADE3FF','#A3E0FF',
    '#99DDFF','#8FD9FF','#85D6FF','#7BD3FF','#71CFFF','#67CBFF','#5DC8FF','#53C4FF',
    '#49C0FF','#3FBFFF','#36B7FF','#2DAEFF','#26A5FF','#1E9CFF','#178EFF','#127FFF',
    '#0D71FF','#0A62E6','#0954CC','#0846B3','#06389A','#042C82','#032170','#02175F',
    '#00104F','#00113F','#00102f','#001021','#001016','#00100E','#00100A','#001006',
    '#00205A','#002B7F','#003399','#003EAF','#0047C2','#0050D5','#005AE8','#0063FB',
    '#0047AB','#003F9A','#003488','#002B77','#002465','#001F54','#001943','#001232',
    '#191970','#12224A','#0E1B3A','#0A1530','#071025','#060E1F','#050B18','#04070F',
    '#4F86F7','#4A7AF0','#4570E8','#4066E0','#3B5CDA','#3552D2','#3048CA','#2A3F C2'.replace(' ',''),
    '#007BA7','#006F99','#006383','#00566E','#004A5A','#003E47','#003335','#002A26',
    '#1E3A8A','#233C9A','#283EAA','#2D40BA','#3242CA','#3744DA','#3C46EA','#4138F0'
  ];

  // Fallback: if BLUES length < STRIPE_COUNT, interpolate by repeating with slight darken
  function getBlueForIndex(i){
    if(BLUES.length >= STRIPE_COUNT) return BLUES[i % BLUES.length];
    // simple repeat with darken factor
    const base = BLUES[i % BLUES.length];
    return shadeColor(base, -Math.floor(i / BLUES.length)*2);
  }

  // Shade hex color by percent (-100..100)
  function shadeColor(hex, percent){
    // hex -> int
    const f = parseInt(hex.slice(1),16),
          t = percent<0?0:255,
          p = Math.abs(percent)/100,
          R = f>>16,
          G = f>>8&0x00FF,
          B = f&0x0000FF;
    const r = Math.round((t-R)*p)+R;
    const g = Math.round((t-G)*p)+G;
    const b = Math.round((t-B)*p)+B;
    return `#${(r<<16 | g<<8 | b).toString(16).padStart(6,'0')}`;
  }

  // Build stripes responsively
  function generateHeroStripes(){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    // Use fragment for performance
    const frag = document.createDocumentFragment();

    for(let i=0;i<STRIPE_COUNT;i++){
      const stripe = document.createElement('div');
      stripe.className = 'hero-stripe';
      // width as percentage
      stripe.style.width = `calc(100% / ${STRIPE_COUNT})`;
      stripe.style.background = getBlueForIndex(i);
      // black thin separator on left
      stripe.style.boxSizing = 'border-box';
      stripe.style.borderLeft = (i===0)?'none':'1px solid rgba(0,0,0,0.85)';
      // small parallax depth value
      stripe.dataset.depth = (i / STRIPE_COUNT).toFixed(3);
      frag.appendChild(stripe);
    }

    container.appendChild(frag);
    // Add subtle mousemove parallax
    addStripeParallax(container);
  }

  function addStripeParallax(container){
    let lastX = 0, lastY = 0;
    container.addEventListener('mousemove', function(e){
      const rect = container.getBoundingClientRect();
      const cx = (e.clientX - rect.left)/rect.width - 0.5;
      const cy = (e.clientY - rect.top)/rect.height - 0.5;
      // apply transform to container based on small fraction
      container.style.transform = `translate3d(${cx*6}px, ${cy*4}px, 0)`;
      // also offset stripes individually for subtle parallax via CSS var
      const stripes = container.children;
      for(let i=0;i<stripes.length;i++){
        const depth = parseFloat(stripes[i].dataset.depth || 0);
        const tx = cx * depth * -12;
        stripes[i].style.transform = `translateX(${tx}px)`;
      }
    });
    // reset on leave
    container.addEventListener('mouseleave',()=>{container.style.transform='';
      Array.from(container.children).forEach(s=>s.style.transform='');
    });
  }

  // Create pixelated ?! symbols as inline SVGs scattered across the hero
  function generatePixelatedSymbols(){
    const layer = document.getElementById(symbolsLayerId);
    if(!layer) return;
    layer.innerHTML = '';
    const frag = document.createDocumentFragment();

    for(let i=0;i<SYMBOL_COUNT;i++){
      const svg = createPixelSymbolSVG(i);
      frag.appendChild(svg);
    }
    layer.appendChild(frag);
  }

  function createPixelSymbolSVG(index){
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns,'svg');
    svg.setAttribute('width','48');
    svg.setAttribute('height','48');
    svg.setAttribute('viewBox','0 0 16 16');
    svg.classList.add('hero-pixel-symbol');

    // Randomly choose '?' or '!' or combined '?!'
    const symbolType = (Math.random()>0.6)?'?!':(Math.random()>0.5)?'?':'!';

    // create simple pixelated path using rects
    const g = document.createElementNS(xmlns,'g');
    g.setAttribute('fill','#ffffff');
    g.setAttribute('stroke','#000000');
    g.setAttribute('stroke-width','0.25');

    // draw a tiny 16x16 grid pixels for simple shapes
    // we'll draw rough shapes for '?' and '!'
    if(symbolType.indexOf('?')!==-1){
      // question mark pixels
      const qPixels = [
        [6,2],[7,2],[8,2],[9,3],[9,4],[8,5],[7,5],[6,6],[6,7],[7,8],[8,8],[8,9]
      ];
      qPixels.forEach(p=>{
        const r = document.createElementNS(xmlns,'rect');
        r.setAttribute('x',p[0]); r.setAttribute('y',p[1]); r.setAttribute('width','1'); r.setAttribute('height','1');
        g.appendChild(r);
      });
      // dot
      const rdot = document.createElementNS(xmlns,'rect'); rdot.setAttribute('x','8'); rdot.setAttribute('y','12'); rdot.setAttribute('width','1'); rdot.setAttribute('height','1');
      g.appendChild(rdot);
    }
    if(symbolType.indexOf('!')!==-1){
      const px = [[12,2],[12,3],[12,4],[12,5],[12,6],[12,8]];
      px.forEach(p=>{const r=document.createElementNS(xmlns,'rect');r.setAttribute('x',p[0]);r.setAttribute('y',p[1]);r.setAttribute('width','1');r.setAttribute('height','1');g.appendChild(r);});
    }

    svg.appendChild(g);

    // random placement & rotation & opacity
    const left = Math.random()*82 + '%';
    const top = Math.random()*78 + '%';
    svg.style.position='absolute';
    svg.style.left = left;
    svg.style.top = top;
    svg.style.opacity = (0.45 + Math.random()*0.5).toFixed(2);
    svg.style.transform = `scale(${0.8 + Math.random()*1.6}) rotate(${Math.floor(Math.random()*20-10)}deg)`;
    svg.style.pointerEvents = 'none';

    return svg;
  }

  // Clicking or scrolling from the hero triggers a cinematic transition into the site
  function initializeHeroInteractions(){
    const hero = document.getElementById('hero');
    if(!hero) return;

    const enter = ()=>{
      document.documentElement.classList.add('entered-site');
      // smooth scroll to #home
      const home = document.getElementById('home');
      if(home){
        home.scrollIntoView({behavior:'smooth'});
      }
      // small glow on logo
      const logo = document.querySelector('.hero-logo-container');
      if(logo){logo.classList.add('hero-logo-activated');}
      // remove one-time listeners
      hero.removeEventListener('click',enter);
      hero.removeEventListener('wheel',enter);
    };

    hero.addEventListener('click',enter);
    hero.addEventListener('wheel',enter,{passive:true});
  }

  function generatePixelatedLogo(){
    // Ensure the existing inline SVG has a 'pixel' style and animate it subtly
    const logo = document.querySelector('.hero-logo-16bit');
    if(!logo) return;
    logo.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))';
    logo.style.transition = 'transform 900ms cubic-bezier(.2,.8,.2,1)';
    // gentle pulse
    setInterval(()=>{
      logo.style.transform = 'scale(1.03)';
      setTimeout(()=>logo.style.transform='scale(1)',600);
    },3800);
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function(){
    try{
      generateHeroStripes();
      generatePixelatedSymbols();
      initializeHeroInteractions();
      generatePixelatedLogo();
    }catch(e){console.error('hero-gen init error',e)}
  });

  // Expose for debugging
  window._we_met_hero = { generateHeroStripes, generatePixelatedSymbols };
})();
