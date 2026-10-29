import { test } from 'node:test';
import assert from 'node:assert/strict';
import { absoluteUrl, getServerUrl } from './seo';

function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const saved = { SITE_URL: process.env.SITE_URL, NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL };
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test('the public address comes from SITE_URL (the variable .env.example and the deploy use)', () => {
  withEnv({ SITE_URL: 'https://brightlinkltd.com/', NEXT_PUBLIC_SERVER_URL: undefined }, () => {
    assert.equal(getServerUrl(), 'https://brightlinkltd.com');
    assert.equal(absoluteUrl('/about-us'), 'https://brightlinkltd.com/about-us');
    assert.equal(absoluteUrl('blog'), 'https://brightlinkltd.com/blog');
  });
});

test('SITE_URL wins over the older NEXT_PUBLIC_SERVER_URL, which still works on its own', () => {
  withEnv({ SITE_URL: 'https://a.example', NEXT_PUBLIC_SERVER_URL: 'https://b.example' }, () => assert.equal(getServerUrl(), 'https://a.example'));
  withEnv({ SITE_URL: undefined, NEXT_PUBLIC_SERVER_URL: 'https://b.example' }, () => assert.equal(getServerUrl(), 'https://b.example'));
  withEnv({ SITE_URL: undefined, NEXT_PUBLIC_SERVER_URL: undefined }, () => assert.equal(getServerUrl(), 'http://localhost:3000'));
});

test('full addresses are left as they are', () => {
  withEnv({ SITE_URL: 'https://brightlinkltd.com' }, () => assert.equal(absoluteUrl('https://media.example/a.webp'), 'https://media.example/a.webp'));
});
