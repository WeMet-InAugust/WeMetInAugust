/* ============================================================
   HERO GENERATION (enhanced)
   - Programmatically generates 96 vertical blue stripes (light -> dark)
   - Adds thin black separators between stripes
   - Renders 30+ scattered 16-bit style ?! symbols as SVG
   - Exposes helpers on window._we_met_hero for debugging and runtime tweaks
   - Keeps gentle interactions (click/scroll to enter)
   ============================================================ */
(function(){
  'use strict';

  const STRIPE_COUNT = 96; // generous number of blues as requested
  const SYMBOL_COUNT = 38;

  function hslBlue(i, total){
    // produce a pleasing range of blues from very light to deep
    const t = i / (total - 1);
    // hue around 210-225 (cobalt/cerulean space)
    const hue = Math.round(210 + (15 * (0.5 + Math.sin(t * Math.PI))));
    // saturation varied for richness
    const sat = Math.round(60 + (30 * (1 - Math.abs(0.5 - t) * 2)));
    // lightness moves light -> dark
    const light = Math.round(92 - (86 * Math.pow(t, 1.08))); // range approx 92 -> 6
    return `hsl(${hue}deg ${sat}% ${light}%)`;
  }

  function darkenHSL(hsl, amount){
    const m = hsl.match(/hsl\(([^\s]+)deg\s+([0-9]+)%\s+([0-9]+)%\)/i);
    if(!m) return hsl;
    const h = Number(m[1]);
    const s = Number(m[2]);
    let l = Number(m[3]);
    l = Math.max(0, l - amount);
    return `hsl(${h}deg ${s}% ${l}%)`;
  }

  function generateHeroStripes(){
    const container = document.getElementById('heroStripesContainer');
    if(!container) return;
    container.innerHTML = '';
    // Use flex children; widths will auto-distribute
    for(let i=0;i<STRIPE_COUNT;i++){
      const color = hslBlue(i, STRIPE_COUNT);
      const stripe = document.createElement('div');
      stripe.className = 'hero-stripe';
      stripe.style.background = `linear-gradient(180deg, ${color} 0%, ${darkenHSL(color,8)} 100%)`;
      // thin black separators as requested (slightly varying opacity for organic feel)
      stripe.style.borderRight = `1px solid rgba(0,0,0,${0.35 + Math.random()*0.25})`;
      // subtle animation phase offset for a wave effect
      stripe.style.animationDelay = (Math.random()*1.2 - 0.6) + 's';
      container.appendChild(stripe);
    }
  }

  // Build a 16-bit style pixel group for question/exclamation
  function buildPixelSymbol(symbolType){
    const xmlns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(xmlns,'svg');
    svg.setAttribute('width','48'); svg.setAttribute('height','48');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.classList.add('hero-symbol-svg');

    const g = document.createElementNS(xmlns,'g');
    const pixel = (x,y)=>{
      const r = document.createElementNS(xmlns,'rect');
      r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('width','1'); r.setAttribute('height','1');
      r.setAttribute('fill','#FFFFFF'); r.setAttribute('stroke','#000000'); r.setAttribute('stroke-width','0');
      return r;
    };

    // Basic pixel maps for ? and ! (small, intentionally chunky)
    if(symbolType.indexOf('?')!==-1){
      const q = [[6,2],[7,2],[8,2],[9,3],[9,4],[9,5],[8,6],[7,6],[6,6],[6,7],[6,8],[6,10],[6,11]];
      q.forEach(p=>g.appendChild(pixel(p[0],p[1])));
      // dot
      g.appendChild(pixel(6,13));
    }
    if(symbolType.indexOf('!')!==-1){
      const ex = [[14,2],[14,3],[14,4],[14,5],[14,6],[14,7],[14,8],[14,10]];
      ex.forEach(p=>g.appendChild(pixel(p[0],p[1])));
    }

    svg.appendChild(g);
    return svg;
  }

  function generatePixelatedSymbols(){
    const layer = document.getElementById('heroSymbolsLayer');
    if(!layer) return;
    layer.innerHTML = '';

    for(let i=0;i<SYMBOL_COUNT;i++){
      const type = (Math.random()>0.5)? '?!' : (Math.random()>0.6?'?':'!');
      const svg = buildPixelSymbol(type);

      // random placement with generous margins
      const left = Math.random()*82 + 6;
      const top = Math.random()*82 + 6;
      svg.style.position = 'absolute';
      svg.style.left = left + '%';
      svg.style.top = top + '%';
      svg.style.opacity = (0.35 + Math.random()*0.55).toFixed(2);
      const scale = (0.7 + Math.random()*1.8).toFixed(2);
      svg.style.transform = `scale(${scale}) rotate(${Math.floor(Math.random()*28-14)}deg)`;
      svg.style.pointerEvents = 'none';
      svg.classList.add('hero-symbol');

      layer.appendChild(svg);
    }
  }

  function initializeHeroInteractions(){
    const hero = document.getElementById('hero');
    if(!hero) return;

    const enter = ()=>{
      document.documentElement.classList.add('entered-site');
      const home = document.getElementById('home');
      if(home) home.scrollIntoView({behavior:'smooth'});
      const logo = document.querySelector('.hero-logo-container');
      if(logo) logo.classList.add('hero-logo-activated');
      hero.removeEventListener('click',enter);
      hero.removeEventListener('wheel',enter);
    };

    hero.addEventListener('click',enter);
    hero.addEventListener('wheel',enter,{passive:true});
  }

  function generatePixelatedLogo(){
    const logo = document.querySelector('.hero-logo-16bit');
    if(!logo) return;
    logo.style.filter = 'drop-shadow(0 6px 22px rgba(0,0,0,0.35))';
    logo.style.transition = 'transform 900ms cubic-bezier(.2,.8,.2,1)';
    setInterval(()=>{
      logo.style.transform = 'scale(1.04)';
      setTimeout(()=>logo.style.transform='scale(1)',620);
    },4200);
  }

  // safe init
  document.addEventListener('DOMContentLoaded', ()=>{
    try{
      generateHeroStripes();
      generatePixelatedSymbols();
      initializeHeroInteractions();
      generatePixelatedLogo();
    }catch(e){console.error('hero-gen init',e)}
  });

  // expose for runtime tweaks and debugging
  window._we_met_hero = window._we_met_hero || {};
  window._we_met_hero.generateHeroStripes = generateHeroStripes;
  window._we_met_hero.generatePixelatedSymbols = generatePixelatedSymbols;
  window._we_met_hero.buildPixelSymbol = buildPixelSymbol;

})();
