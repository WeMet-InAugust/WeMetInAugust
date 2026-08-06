// Playwright script to navigate pages, try to start video playback, collect screenshots.
// Usage:
//   STAGING_URL="https://staging.example.com" node scripts/run-playback-test.js
//
// It will write screenshots to ./playback-screenshots/

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const base = process.env.STAGING_URL || process.argv[2] || 'http://localhost:3000';
  const outDir = path.resolve(process.cwd(), 'playback-screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // pages to test (adjust to your routes)
  const pages = [
    '/',                 // home / hero
    '/article',          // article/editorial
    '/gallery',          // art / photography
    '/travel'            // travel section
  ];

  // choose the browser you want to test (chromium recommended for HLS with hls.js)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }});
  const page = await context.newPage();

  for (const p of pages) {
    try {
      const url = new URL(p, base).toString();
      console.log('Visiting', url);
      await page.goto(url, { waitUntil: 'networkidle' });
      // wait a little for JS to initialize HLS players
      await page.waitForTimeout(2000);

      // If there is a <video> element, try to play it muted to capture a running frame
      const hasVideo = await page.$('video');
      if (hasVideo) {
        console.log('Found <video>, attempting playback (muted)...');
        try {
          await page.evaluate(() => {
            const v = document.querySelector('video');
            if (v) {
              v.muted = true;
              // some players expose play() promises
              const p = v.play();
              if (p && p.then) p.catch(() => {});
            }
          });
          await page.waitForTimeout(2500);
        } catch (e) {
          console.warn('Error starting video playback:', e);
        }
      } else {
        // If embed or iframe exists, just wait a bit for it to render
        const hasIframe = await page.$('iframe');
        if (hasIframe) {
          console.log('Found iframe/embed; waiting for it to load...');
          await page.waitForTimeout(2000);
        }
      }

      const safeName = p === '/' ? 'home' : p.replace(/[^\w-]/g, '_').replace(/^_+/, '');
      const outPath = path.join(outDir, `${safeName}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log('Saved screenshot:', outPath);
    } catch (err) {
      console.error('Error testing page', p, err);
    }
  }

  await browser.close();
  console.log('Playback screenshot run complete.');
})();
