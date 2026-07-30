// js/topic-themes.js
// Apply topic-aware theme classes to <body> as the user scrolls through sections.
// Features:
// - Finds elements with data-theme="astronomy|history|art|geography|nautical"
// - Uses IntersectionObserver to set body class (theme-<name>) when a section is in view
// - Allows a manual override via buttons with data-theme-toggle
// - Persists manual override in localStorage
// - Integrates with .modern-minimal helper when data-minimal="true" is present on a section
// - Debounces rapid changes to avoid visual jank

(function(){
  'use strict';

  const THEME_PREFIX = 'theme-';
  const STORAGE_KEY = 'wemetinaugust.theme.override';
  const sections = Array.from(document.querySelectorAll('[data-theme]'));
  if(sections.length === 0) return; // nothing to do

  let manualOverride = localStorage.getItem(STORAGE_KEY) || null;
  if(manualOverride === 'null') manualOverride = null;

  function applyTheme(name, opts={}){
    document.body.classList.remove(...Array.from(document.body.classList).filter(c=>c.startsWith(THEME_PREFIX)));
    if(name){ document.body.classList.add(THEME_PREFIX + name); }
    // modern-minimal handling
    if(opts.minimal) document.body.classList.add('modern-minimal'); else document.body.classList.remove('modern-minimal');
  }

  // Apply manual override immediately if present
  if(manualOverride){ const [theme, minimal] = manualOverride.split('|'); applyTheme(theme, { minimal: minimal === '1' }); }

  // IntersectionObserver to watch sections and update theme when in view
  const ioOptions = { root: null, rootMargin: '0px', threshold: [0.35, 0.6] };
  let lastApplied = null; let ioDebounce = null;

  const io = new IntersectionObserver((entries)=>{
    // find the entry with highest intersectionRatio above threshold
    const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio - a.intersectionRatio);
    if(visible.length === 0) return;
    const primary = visible[0];
    const sec = primary.target.getAttribute('data-theme');
    const minimal = primary.target.getAttribute('data-minimal') === 'true';
    if(sec === lastApplied) return;
    // debounce quick scrolls
    if(ioDebounce) clearTimeout(ioDebounce);
    ioDebounce = setTimeout(()=>{ lastApplied = sec; if(!manualOverride) applyTheme(sec, { minimal }); }, 120);
  }, ioOptions);

  sections.forEach(s=> io.observe(s));

  // Add controls for manual override if there are any toggle elements
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  toggles.forEach(btn => {
    btn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const theme = btn.getAttribute('data-theme-toggle');
      const minimal = btn.getAttribute('data-minimal') === 'true';
      // If clicking same as current override -> clear override
      if(manualOverride && manualOverride.startsWith(theme)){
        manualOverride = null; localStorage.removeItem(STORAGE_KEY); applyTheme(null, {}); return;
      }
      manualOverride = theme + '|' + (minimal? '1':'0');
      localStorage.setItem(STORAGE_KEY, manualOverride);
      applyTheme(theme, { minimal });
    });
  });

  // Also provide a small keyboard shortcut: Shift+T cycles through themes (editorial use)
  const themeList = Array.from(new Set(sections.map(s=>s.getAttribute('data-theme'))));
  let cycleIndex = 0;
  document.addEventListener('keydown', (e)=>{
    if(!e.shiftKey || e.key.toLowerCase() !== 't') return;
    e.preventDefault();
    cycleIndex = (cycleIndex + 1) % themeList.length;
    const theme = themeList[cycleIndex]; manualOverride = theme+'|0'; localStorage.setItem(STORAGE_KEY, manualOverride); applyTheme(theme, { minimal: false });
  });

})();
