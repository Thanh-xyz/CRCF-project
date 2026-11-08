// Opt-in real Elgg experiment. NOT RUN until the Docker lab is healthy.
// The login and profile selectors target the SEED UI and fail if it differs.
// Endpoint and request fields are captured from a real legitimate Save operation.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
if (process.env.RUN_ELGG_LIVE !== '1' || !process.env.ALICE_PASSWORD) {
  console.log('NOT RUN: set RUN_ELGG_LIVE=1 and ALICE_PASSWORD for the isolated lab.');
  process.exit(0);
}
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || require.resolve('playwright'));
const target = 'http://elgg.csrf.localhost:8080';
const attacker = 'http://attacker.csrf.localhost:8000';
const mode = value => execFileSync('python3',['lab/scripts/labctl.py','mode',value],{stdio:'pipe'});
const browser = await chromium.launch({headless:true,
  ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
const context = await browser.newContext({viewport:{width:1440,height:1000}});
const page = await context.newPage();
const results = [];
const baseline = 'Alice — hồ sơ ban đầu của Nhóm 6';
const expected = 'CSRF attack by 23001939';
const record = (id, details) => results.push({id,status:'PASS',...details});
const screenshot = name => page.screenshot({path:`evidence/screenshots/${name}.png`,fullPage:true});
let captured;
async function editBaseline() {
  await page.goto(target + '/profile/alice');
  await page.getByRole('link',{name:/edit profile/i}).first().click();
  const textarea = page.locator('textarea[name="description"]');
  await textarea.waitFor();
  // This is a legitimate same-origin edit, using Elgg's own editor and Save.
  await textarea.evaluate((element, text) => {
    const editor = globalThis.CKEDITOR?.instances?.[element.id];
    if (editor) { editor.setData(text); editor.updateElement(); }
    else { element.value = text; element.dispatchEvent(new Event('input',{bubbles:true})); }
  },baseline);
  const form = textarea.locator('xpath=ancestor::form');
  const requestPromise = page.waitForRequest(request => request.method()==='POST' && new URL(request.url()).origin===target);
  await form.getByRole('button',{name:/save/i}).click();
  const request = await requestPromise;
  assert.match(request.headers()['content-type'],/application\/x-www-form-urlencoded/);
  const payload = new URLSearchParams(request.postData());
  assert.equal(payload.has('description'),true);
  assert.equal(payload.has('__elgg_token'),true);
  captured = {url:request.url(),fields:[...payload].filter(([key])=>!['__elgg_token','__elgg_ts'].includes(key))};
  await page.goto(target + '/profile/alice');
  await page.getByText(baseline,{exact:false}).first().waitFor();
}
async function attack(origin, fetchMode) {
  await page.goto(origin);
  await page.locator('#endpoint').fill(captured.url);
  await page.locator('#fields').fill(JSON.stringify(captured.fields));
  await page.locator('#mode').selectOption(fetchMode);
  await page.locator('#observed').check();
  const sent = page.waitForRequest(r=>r.method()==='POST' && r.url()===captured.url);
  await page.getByRole('button',{name:'Gửi tới Elgg',exact:true}).click();
  await sent;
  await page.waitForFunction(()=>!document.getElementById('send').disabled);
  return page.locator('#status').innerText();
}
async function profileContains(text) {
  await page.goto(target + '/profile/alice');
  return (await page.locator('body').innerText()).includes(text);
}
try {
  await fs.mkdir('evidence/screenshots',{recursive:true});
  await fs.mkdir('evidence/logs',{recursive:true});
  mode('protected');
  await page.goto(target + '/login');
  await page.locator('input[name="username"]').fill('alice');
  await page.locator('input[name="password"]').fill(process.env.ALICE_PASSWORD);
  await page.getByRole('button',{name:/log in|login/i}).click();
  await editBaseline();
  record('TC-01',{observed:'Legitimate UI Save updated About me.'});
  await screenshot('TC-01-baseline');
  // Capture contains public fields only; tokens never leave browser memory.
  await fs.writeFile('evidence/logs/observed-request.json',JSON.stringify({
    capturedAt:new Date().toISOString(),browserVersion:browser.version(),
    url:captured.url,method:'POST',contentType:'application/x-www-form-urlencoded',
    publicFields:captured.fields,csrfFieldNames:['__elgg_token','__elgg_ts'],
    note:'Token/cookie values intentionally omitted; version command required separately.'
  },null,2));
  const protectedStatus = await attack(attacker,'no-cors');
  assert.equal(await profileContains(baseline),true);
  assert.equal(await profileContains(expected),false);
  record('TC-04',{observed:'Token protection enabled; profile retained baseline.',browserStatus:protectedStatus});
  await screenshot('TC-04-protected');
  mode('vulnerable');
  const crossSiteStatus = await attack('http://127.0.0.1:8000','no-cors');
  assert.equal(await profileContains(baseline),true);
  record('TC-03-cross-site',{observed:'Cross-site POST caused no profile change.',browserStatus:crossSiteStatus,
    limitation:'Inspect Network cookie exclusion reason to attribute specifically to SameSite.'});
  const crossOriginStatus = await attack(attacker,'cors');
  assert.equal(await profileContains(expected),true);
  record('TC-03-same-site',{observed:'Cross-origin/same-site POST changed Elgg despite unreadable response.',browserStatus:crossOriginStatus});
  record('TC-05',{observed:'Deliberately disabled token check allowed actual profile change.'});
  record('TC-06',{observed:expected});
  await screenshot('TC-06-profile-after');
} catch (error) {
  results.push({id:'run',status:'FAIL',error:error.message});
  process.exitCode=1;
} finally {
  try { mode('protected'); } catch { results.push({id:'restore-mode',status:'FAIL',error:'Restore protected mode manually.'});process.exitCode=1; }
  await fs.writeFile('evidence/logs/browser-elgg.json',JSON.stringify({date:new Date().toISOString(),results},null,2));
  await browser.close();
}
