import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, passwordProblem, verifyPassword } from './password';
import { LoginThrottle, MAX_FAILURES, WINDOW_MS } from './throttle';

test('hashPassword/verifyPassword: right password passes, wrong one and broken hashes fail', async () => {
  const hash = await hashPassword('correct horse battery');
  assert.match(hash, /^scrypt\$16384\$8\$1\$/);
  assert.notEqual(hash, await hashPassword('correct horse battery'), 'salt makes every hash different');
  assert.equal(await verifyPassword('correct horse battery', hash), true);
  assert.equal(await verifyPassword('correct horse batterY', hash), false);
  assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
  assert.equal(await verifyPassword('anything', 'bcrypt$1$2$3$a$b'), false);
});

test('passwordProblem: length rules', () => {
  assert.ok(passwordProblem('short'));
  assert.equal(passwordProblem('long enough pass'), null);
  assert.ok(passwordProblem('x'.repeat(201)));
});

test('LoginThrottle: locks after MAX_FAILURES, unlocks after the window, resets on success', () => {
  let now = 1_000_000;
  const t = new LoginThrottle(() => now);
  const keys = ['email:a@b.rw', 'ip:1.2.3.4'];
  for (let i = 0; i < MAX_FAILURES - 1; i++) t.fail(keys);
  assert.equal(t.retryAfter(keys), 0, 'still allowed before the limit');
  t.fail(keys);
  assert.equal(t.retryAfter(keys), WINDOW_MS);
  assert.ok(t.retryAfter(['ip:1.2.3.4']) > 0, 'the IP is locked for other emails too');
  now += WINDOW_MS + 1;
  assert.equal(t.retryAfter(keys), 0, 'window passed');
  t.fail(keys);
  t.succeed(keys);
  assert.equal(t.retryAfter(keys), 0);
});
