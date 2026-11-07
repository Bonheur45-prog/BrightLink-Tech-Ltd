import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { limiter } from '@/lib/security/rate-limit';
import { clientIp } from '@/lib/security/client-ip';

/*
 * The unsubscribe link in every newsletter email: /api/unsubscribe?t=<the subscriber's private key>.
 * Opening it shows a confirm button (link checkers in email apps open links on their own, so a visit alone
 * never unsubscribes). Pressing it — or the one-click "Unsubscribe" button Gmail/Outlook show — removes the
 * subscription. The subscriber stays in CMS → Subscribers as "removed".
 */

export const dynamic = 'force-dynamic';

type Lang = 'en' | 'fr' | 'rw';
// TODO(review): the Kinyarwanda wording was written by the developer; have a native speaker check it.
const T: Record<Lang, { title: string; ask: (e: string) => string; button: string; done: (e: string) => string; again: string; bad: string; home: string }> = {
  en: {
    title: 'Unsubscribe',
    ask: (e) => `Stop sending new articles to <strong>${e}</strong>?`,
    button: 'Yes, unsubscribe me',
    done: (e) => `Done. <strong>${e}</strong> will not receive our emails any more.`,
    again: 'Changed your mind? You can subscribe again on our website at any time.',
    bad: 'This unsubscribe link is not valid. If you keep receiving emails, reply to one of them and we will remove you.',
    home: 'Go to the website',
  },
  fr: {
    title: 'Se désabonner',
    ask: (e) => `Ne plus envoyer les nouveaux articles à <strong>${e}</strong> ?`,
    button: 'Oui, me désabonner',
    done: (e) => `C’est fait. <strong>${e}</strong> ne recevra plus nos e-mails.`,
    again: 'Vous avez changé d’avis ? Vous pouvez vous réabonner sur notre site à tout moment.',
    bad: 'Ce lien de désabonnement n’est pas valide. Si vous recevez encore nos e-mails, répondez à l’un d’eux et nous vous retirerons.',
    home: 'Aller sur le site',
  },
  rw: {
    title: 'Kwikura ku rutonde',
    ask: (e) => `Guhagarika kohereza inkuru nshya kuri <strong>${e}</strong>?`,
    button: 'Yego, nkura ku rutonde',
    done: (e) => `Byakozwe. <strong>${e}</strong> ntizongera kwakira email zacu.`,
    again: 'Wahinduye igitekerezo? Ushobora kongera kwiyandikisha ku rubuga rwacu igihe icyo ari cyo cyose.',
    bad: 'Iyi link ntabwo ikora. Niba ukomeje kwakira email, subiza imwe muri zo tukagukura ku rutonde.',
    home: 'Jya ku rubuga',
  },
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const TOKEN = /^[A-Za-z0-9_-]{10,64}$/;

function page(lang: Lang, body: string, status = 200) {
  const t = T[lang];
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t.title)} — BrightLink</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4efe9;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#2b1d14}
.card{max-width:28rem;margin:1rem;padding:2rem;background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(43,29,20,.08)}
img{width:150px;height:auto;margin-bottom:1.5rem}h1{font-size:1.4rem;margin:0 0 .75rem}p{line-height:1.6;color:#4a3b30}
button{margin-top:.5rem;padding:.8rem 1.4rem;border:0;border-radius:10px;background:#ff8e00;color:#2b1d14;font-weight:700;font-size:1rem;cursor:pointer}
a{color:#c96f00}</style></head><body><main class="card"><img src="/images/brand/brightlink-logo.png" alt="BrightLink"><h1>${esc(t.title)}</h1>${body}<p><a href="/">${esc(t.home)}</a></p></main></body></html>`;
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
}

async function find(token: string | null) {
  if (!token || !TOKEN.test(token)) return null;
  return prisma.subscriber.findUnique({ where: { token }, select: { id: true, email: true, locale: true, active: true } });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t');
  const s = await find(token);
  if (!s) return page('en', `<p>${esc(T.en.bad)}</p>`, 404);
  const lang = s.locale as Lang;
  const t = T[lang];
  if (!s.active) return page(lang, `<p>${t.done(esc(s.email))}</p><p>${esc(t.again)}</p>`);
  return page(lang, `<p>${t.ask(esc(s.email))}</p><form method="post" action="/api/unsubscribe?t=${encodeURIComponent(token!)}"><button type="submit">${esc(t.button)}</button></form>`);
}

/** The confirm button above, and the one-click unsubscribe of email apps (RFC 8058). */
export async function POST(req: NextRequest) {
  if (!limiter('unsubscribe', 30, 10 * 60 * 1000).take(clientIp(req.headers))) return new NextResponse('Too many requests', { status: 429 });
  const token = req.nextUrl.searchParams.get('t');
  const s = await find(token);
  if (!s) return page('en', `<p>${esc(T.en.bad)}</p>`, 404);
  if (s.active) {
    await prisma.subscriber.update({ where: { id: s.id }, data: { active: false } });
    await prisma.auditLog.create({ data: { action: 'subscriber.unsubscribe', entityType: 'subscriber', entityId: s.id, meta: { via: 'email link' } } });
  }
  const t = T[s.locale as Lang];
  return page(s.locale as Lang, `<p>${t.done(esc(s.email))}</p><p>${esc(t.again)}</p>`);
}
