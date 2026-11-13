// Standalone local Chrome check, used when the integrated Browser tool is unavailable.
// npm install --no-save playwright (or set PLAYWRIGHT_MODULE to an installed module).
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || require.resolve('playwright'));
const browser = await chromium.launch({ headless:true,
  ...(process.env.CHROME_PATH ? { executablePath:process.env.CHROME_PATH } : {}) });
const page = await browser.newPage({viewport:{width:1440,height:1200}});
const failures = [];
page.on('pageerror', error => failures.push(error.message));
try {
  await page.goto('http://127.0.0.1:8000/');
  await page.getByRole('button',{name:'Thử echo (TC-02)'}).click();
  await page.waitForFunction(() => document.getElementById('status').textContent.includes('Echo only'));
  const status = await page.locator('#status').innerText();
  assert.match(status,/CSRF attack by 23001939/);
  assert.equal(failures.length,0,JSON.stringify(failures));
  await fs.mkdir('evidence/screenshots',{recursive:true});
  await fs.mkdir('evidence/logs',{recursive:true});
  await page.screenshot({path:'evidence/screenshots/TC-02-echo.png',fullPage:true});
  await page.locator('#status').screenshot({path:'evidence/screenshots/TC-02-decoded-body.png'});
  await fs.writeFile('evidence/logs/browser-echo.json',JSON.stringify({
    date:new Date().toISOString(),browser:browser.version(),test:'TC-02',status:'PASS',
    origin:new URL(page.url()).origin,observed:status,
    limitation:'Only the echo endpoint was tested. No Elgg result is asserted.'
  },null,2));
  console.log('PASS TC-02: Chrome executed Fetch and the echo server decoded the expected body.');
} finally { await browser.close(); }
