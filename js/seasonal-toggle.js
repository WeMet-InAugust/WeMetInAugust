/* seasonal-toggle.js
   Adds a manual seasonal menu and automatic detection fallback.
   - Tied to #seasonalMenuBtn in index.html
   - Saves preference to localStorage under 'wmi_season_override'
   - Applies body class names matching existing seasonal.css (e.g., season-winter, season-spring)
*/
(function(){
  'use strict';

  const SEASONS = [
    { id: 'autumn', label: 'Autumn — Study & Warmth' },
    { id: 'winter-frost', label: 'Winter Frost — Quiet Skies' },
    { id: 'christmas-season', label: 'Christmas — Holiday Wing' },
    { id: 'winter-romance', label: "Winter Romance — February" },
    { id: 'spring', label: 'Spring — Renewal' },
    { id: 'summer', label: 'Summer — Wonder' },
    { id: 'summer-late', label: 'Late Summer — Golden Evenings' }
  ];

  function detectSeasonAuto(){
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Thanksgiving calculation: 4th Thursday in Nov
    const nov = new Date(now.getFullYear(),10,1);
    const firstThu =  ( (11 - nov.getDay()) % 7 ) + 1; // day of month of first Thursday
    const thanksgiving = firstThu + 21; // 4th Thursday

    if (month === 10 && day < thanksgiving) return 'autumn';
    if ((month === 10 && day >= thanksgiving) || month === 11) return 'christmas-season';
    if (month === 0) return 'winter-frost';
    if (month === 1) return 'winter-romance';
    if (month >= 2 && month < 5) return 'spring';
    if (month >=5 && month <=7) return (month===7 && day>15)? 'summer-late' : 'summer';
    return 'autumn';
  }

  function applySeason(seasonId){
    // remove any existing season- classes
    document.body.classList.forEach(cls=>{
      if(cls.indexOf('season-')===0) document.body.classList.remove(cls);
    });
    if(!seasonId) seasonId = detectSeasonAuto();
    document.body.classList.add('season-'+seasonId);
  }

  function createMenu(){
    const menu = document.createElement('div');
    menu.id = 'seasonalMenu';
    menu.style.position = 'absolute';
    menu.style.top = '48px';
    menu.style.right = '12px';
    menu.style.minWidth = '220px';
    menu.style.background = 'rgba(255,255,255,0.98)';
    menu.style.border = '1px solid rgba(0,0,0,0.08)';
    menu.style.borderRadius = '8px';
    menu.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
    menu.style.padding = '8px';
    menu.style.zIndex = 1200;
    menu.style.display = 'none';

    const title = document.createElement('div');
    title.textContent = 'Seasonal Atmospheres';
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';
    menu.appendChild(title);

    SEASONS.forEach(s=>{
      const btn = document.createElement('button');
      btn.textContent = s.label;
      btn.dataset.season = s.id;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.margin = '6px 0';
      btn.style.padding = '8px 10px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.background = 'linear-gradient(90deg, rgba(0,71,171,0.06), rgba(0,71,171,0.02))';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click',()=>{
        const id = btn.dataset.season;
        localStorage.setItem('wmi_season_override', id);
        applySeason(id);
        menu.style.display='none';
      });
      menu.appendChild(btn);
    });

    const autoBtn = document.createElement('button');
    autoBtn.textContent = 'Automatic (by date)';
    autoBtn.style.display = 'block';
    autoBtn.style.width = '100%';
    autoBtn.style.marginTop = '8px';
    autoBtn.style.padding = '8px 10px';
    autoBtn.style.border = 'none';
    autoBtn.style.borderRadius = '6px';
    autoBtn.style.background = 'rgba(0,0,0,0.04)';
    autoBtn.style.cursor = 'pointer';
    autoBtn.addEventListener('click',()=>{
      localStorage.removeItem('wmi_season_override');
      applySeason();
      menu.style.display='none';
    });
    menu.appendChild(autoBtn);

    document.body.appendChild(menu);
    return menu;
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const btn = document.getElementById('seasonalMenuBtn');
    if(!btn) return;
    const menu = createMenu();

    // show/hide toggle
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      menu.style.display = (menu.style.display==='none')? 'block' : 'none';
    });

    // click outside to close
    document.addEventListener('click', ()=>{ if(menu) menu.style.display='none'; });

    // apply initial season from override or auto
    const override = localStorage.getItem('wmi_season_override');
    if(override) applySeason(override); else applySeason();
  });

})();
