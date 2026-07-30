// js/perf-accessibility.js
// Small accessibility & performance helpers
// - Adds a skip-to-main link (inserted early) for keyboard users
// - Defers non-critical heavy assets until after first meaningful paint
// - Adds a small focus-visible polyfill to keep focus rings elegant

(function(){
  'use strict';

  // Insert skip link at the very top of the document body
  function addSkipLink(){
    const skip = document.createElement('a');
    skip.href = '#home';
    skip.className = 'skip-to-main';
    skip.textContent = 'Skip to main content';
    skip.style.cssText = 'position:absolute;left:-999px;top:auto;width:1px;height:1px;overflow:hidden;z-index:1000;';
    document.addEventListener('keydown', function esc(e){
      // When tabbing (Shift+Tab) show the link visually for keyboard users
      if(e.key === 'Tab'){
        skip.style.position = 'fixed'; skip.style.left = '12px'; skip.style.top = '12px'; skip.style.width = 'auto'; skip.style.height = 'auto'; skip.style.background = 'rgba(255,255,255,0.96)'; skip.style.color = '#062b5a'; skip.style.padding = '8px 10px'; skip.style.borderRadius = '6px'; skip.style.boxShadow = '0 6px 20px rgba(6,12,30,0.08)';
        document.removeEventListener('keydown', esc);
      }
    }, { once: true });
    document.body.appendChild(skip);
  }

  // Defer heavy non-critical assets (images with data-defer attribute)
  function deferAssets(){
    if('requestIdleCallback' in window){
      requestIdleCallback(()=>{ Array.from(document.querySelectorAll('img[data-defer]')).forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-defer'); }); }, { timeout: 2000 });
    } else {
      setTimeout(()=>{ Array.from(document.querySelectorAll('img[data-defer]')).forEach(img => { img.src = img.dataset.src; img.removeAttribute('data-defer'); }); }, 1200);
    }
  }

  // Focus-visible polyfill: only show focus styles when keyboard navigation is used
  (function keyboardFocus(){
    let hadKeyboardEvent = false;
    const body = document.documentElement;
    function onKeyDown(e){ if(e.key === 'Tab' || e.key === 'Shift'){ hadKeyboardEvent = true; body.classList.add('user-is-tabbing'); } }
    function onPointerDown(){ hadKeyboardEvent = false; body.classList.remove('user-is-tabbing'); }
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('mousedown', onPointerDown, true);
    document.addEventListener('touchstart', onPointerDown, true);
  })();

  // Run tasks
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>{ addSkipLink(); deferAssets(); }); else { addSkipLink(); deferAssets(); }

})();
