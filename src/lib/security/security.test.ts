import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clientIp } from './client-ip';
import { RateLimiter } from './rate-limit';
import { verifyTurnstile } from './turnstile';

test('RateLimiter: allows up to the limit, then refuses until the window resets', () => {
  let now = 0;
  const l = new RateLimiter(3, 1000, () => now);
  assert.deepEqual([l.take('a'), l.take('a'), l.take('a'), l.take('a')], [true, true, true, false]);
  assert.equal(l.take('b'), true, 'other keys are independent');
  now = 1000;
  assert.equal(l.take('a'), true, 'new window');
});

test('clientIp prefers Cloudflare, then X-Forwarded-For', () => {
  assert.equal(clientIp(new Headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' })), '1.1.1.1');
  assert.equal(clientIp(new Headers({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' })), '3.3.3.3');
  assert.equal(clientIp(new Headers()), 'unknown');
});

test('verifyTurnstile: disabled without keys, maps Cloudflare answers, survives outages', async () => {
  delete process.env.TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
  assert.equal(await verifyTurnstile('x', '1.1.1.1'), 'disabled');

  process.env.TURNSTILE_SITE_KEY = 'site';
  process.env.TURNSTILE_SECRET_KEY = 'secret';
  let sent = '';
  const answer = (success: boolean) =>
    (async (_url: string | URL | Request, init?: RequestInit) => {
      sent = String(init?.body);
      return Response.json({ success });
    }) as typeof fetch;
  assert.equal(await verifyTurnstile('tok', '1.1.1.1', answer(true)), 'ok');
  assert.match(sent, /secret=secret&response=tok&remoteip=1\.1\.1\.1/);
  assert.equal(await verifyTurnstile('tok', '1.1.1.1', answer(false)), 'failed');
  assert.equal(await verifyTurnstile('', '1.1.1.1', answer(true)), 'failed', 'missing token');
  const down = (async () => {
    throw new Error('offline');
  }) as typeof fetch;
  assert.equal(await verifyTurnstile('tok', '1.1.1.1', down), 'unavailable');
  delete process.env.TURNSTILE_SITE_KEY;
  delete process.env.TURNSTILE_SECRET_KEY;
});
