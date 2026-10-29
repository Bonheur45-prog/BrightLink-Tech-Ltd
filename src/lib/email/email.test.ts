import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leadEmail, smtpConfig } from './lead-email';

const lead = {
  id: 'clx0000000001',
  name: 'Aline <script>',
  email: 'aline@example.com',
  phone: '+250 788 000 000',
  service: 'Website Design',
  message: 'Hello\n\nWe need a site <b>soon</b> & cheap.',
  source: 'Contact page — contact form',
  locale: 'fr',
  createdAt: new Date('2026-10-29T08:00:00Z'),
};

test('the team email carries every detail, links to the message in the CMS and replies to the sender', () => {
  const m = leadEmail(lead, { siteUrl: 'https://brightlinkltd.com/', companyName: 'BrightLink Technologies' });
  assert.equal(m.subject, 'New message from Aline <script> — Website Design');
  assert.match(m.text, /Phone: \+250 788 000 000/);
  assert.match(m.text, /Language: fr/);
  assert.match(m.text, /https:\/\/brightlinkltd\.com\/admin\/messages\/clx0000000001/);
  assert.match(m.text, /We need a site <b>soon<\/b> & cheap\./); // plain text stays as typed
  assert.equal(m.replyTo, 'Aline script <aline@example.com>');
});

test('what the visitor typed cannot become HTML or extra mail headers', () => {
  const m = leadEmail({ ...lead, name: 'Eve\r\nBcc: victim@example.com', service: '' }, { siteUrl: 'https://x.rw', companyName: 'X' });
  assert.ok(!/[\r\n]/.test(m.subject), 'subject is one line');
  assert.ok(!/[\r\n]/.test(m.replyTo), 'reply-to is one line');
  const h = leadEmail(lead, { siteUrl: 'https://x.rw', companyName: 'X' }).html;
  assert.ok(!h.includes('<script>'));
  assert.ok(h.includes('Aline &lt;script&gt;'));
  assert.ok(h.includes('&lt;b&gt;soon&lt;/b&gt; &amp; cheap'));
});

test('empty fields are left out', () => {
  const m = leadEmail({ ...lead, phone: '', service: '' }, { siteUrl: 'https://x.rw', companyName: 'X' });
  assert.ok(!m.text.includes('Phone:'));
  assert.equal(m.subject, 'New message from Aline <script>');
});

test('SMTP is "not set up" until host, user and password are all there', () => {
  assert.equal(smtpConfig({}), null);
  assert.equal(smtpConfig({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.c' }), null);
  assert.deepEqual(smtpConfig({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.c', SMTP_PASS: 'x', SMTP_PORT: '587' }), {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: 'a@b.c', pass: 'x' },
    from: 'a@b.c',
  });
  assert.equal(smtpConfig({ SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p' })?.secure, true); // default port 465 = TLS
  assert.equal(smtpConfig({ SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASS: 'p', EMAIL_FROM: 'Site <info@x.rw>' })?.from, 'Site <info@x.rw>');
});
