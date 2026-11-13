import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildBody, assertLocalTarget, requestOptions } from '../attacker/request.mjs';

test('payload replaces only description and preserves Unicode, duplicate and access fields', () => {
  const fields = [['guid', '56'], ['name', 'Alice & Nhóm 6'], ['description', 'old'],
                  ['accesslevel[description]', '2'], ['tag', 'a'], ['tag', 'b']];
  const body = buildBody({studentId:'23001939', fields});
  const decoded = new URLSearchParams(body.toString());
  assert.equal(decoded.get('description'), 'CSRF attack by 23001939');
  assert.equal(decoded.get('name'), 'Alice & Nhóm 6');
  assert.equal(decoded.get('accesslevel[description]'), '2');
  assert.deepEqual(decoded.getAll('tag'), ['a', 'b']);
  assert.equal(fields[2][1], 'old');
});
test('no secrets can be entered in attacker fields', () => {
  for (const key of ['__elgg_token', '__elgg_ts', 'Cookie', 'password', 'Authorization']) {
    assert.throws(() => buildBody({studentId:'23001939', fields:[['description',''],[key,'x']]}));
  }
});
test('reject malformed identities, field shapes and ambiguous description', () => {
  for (const config of [
    {studentId:'2300',fields:[['description','']]},
    {studentId:'23001939',fields:[['guid','56']]},
    {studentId:'23001939',fields:[['description',''],['description','']]},
    {studentId:'23001939',fields:[['description',56]]},
  ]) assert.throws(() => buildBody(config));
});
test('target confined to local lab, no URL credentials or query leakage', () => {
  assert.equal(assertLocalTarget('http://elgg.csrf.localhost:8080/action/profile/edit').hostname,'elgg.csrf.localhost');
  for (const url of ['https://real.example/action','http://localhost.evil.test/', 'http://user:pass@localhost/', 'http://localhost/?token=x']) {
    assert.throws(() => assertLocalTarget(url));
  }
});
test('Fetch uses safelisted encoding and the browser owns credentials', () => {
  const body = new URLSearchParams({description:'hello'});
  const options = requestOptions(body,'no-cors');
  assert.equal(options.credentials,'include');
  assert.equal(options.method,'POST');
  assert.equal(options.body,body);
  assert.equal(options.headers,undefined);
});
test('attacker has no prohibited request mechanisms or embedded session material', () => {
  const html = readFileSync(new URL('../attacker/index.html',import.meta.url),'utf8');
  const js = readFileSync(new URL('../attacker/app.js',import.meta.url),'utf8');
  assert.doesNotMatch(html,/<form\b|onsubmit\s*=/i);
  assert.doesNotMatch(js,/XMLHttpRequest|\.submit\s*\(|document\.cookie|localStorage|sessionStorage/);
  assert.match(js,/fetch\(/);
});
