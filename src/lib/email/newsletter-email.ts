// The email sent to subscribers when a new article goes live. Pure (tested in email.test.ts).
// Written in the subscriber's language when the article is translated into it.

export type NewsletterLocale = 'en' | 'fr' | 'rw';

// TODO(review): the Kinyarwanda wording was written by the developer; have a native speaker check it.
const T: Record<NewsletterLocale, { kicker: string; read: string; why: string; unsubscribe: string; minutes: (n: number) => string }> = {
  en: {
    kicker: 'New on the blog',
    read: 'Read the article',
    why: 'You receive this because you subscribed to updates on',
    unsubscribe: 'Unsubscribe',
    minutes: (n) => `${n} min read`,
  },
  fr: {
    kicker: 'Nouveau sur le blog',
    read: 'Lire l’article',
    why: 'Vous recevez cet e-mail car vous vous êtes abonné(e) aux nouvelles de',
    unsubscribe: 'Se désabonner',
    minutes: (n) => `${n} min de lecture`,
  },
  rw: {
    kicker: 'Inkuru nshya kuri blog',
    read: 'Soma inkuru',
    why: 'Wakiriye ubu butumwa kuko wiyandikishije kwakira amakuru ya',
    unsubscribe: 'Kwikura ku rutonde',
    minutes: (n) => `Iminota ${n} yo gusoma`,
  },
};

export type NewsletterArticle = {
  title: string;
  excerpt: string;
  url: string; // absolute, in the subscriber's language
  imageUrl: string | null; // absolute
  category: string;
  readingMinutes: number;
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export function newsletterEmail(
  article: NewsletterArticle,
  opts: { locale: NewsletterLocale; companyName: string; siteUrl: string; logoUrl: string; unsubscribeUrl: string },
) {
  const t = T[opts.locale] ?? T.en;
  const site = opts.siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const subject = oneLine(article.title).slice(0, 200);
  const meta = [article.category, t.minutes(Math.max(1, article.readingMinutes))].filter(Boolean).join(' · ');

  const text = [
    `${t.kicker} — ${opts.companyName}`,
    '',
    article.title,
    meta,
    '',
    article.excerpt,
    '',
    `${t.read}: ${article.url}`,
    '',
    '—',
    `${t.why} ${site}.`,
    `${t.unsubscribe}: ${opts.unsubscribeUrl}`,
  ].join('\n');

  // Table layout and inline styles: what email apps (Gmail, Outlook) display reliably.
  const html = `<!doctype html>
<html lang="${opts.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4efe9;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(article.excerpt).slice(0, 180)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe9;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#2b1d14;">
<tr><td style="background:#2b1d14;padding:22px 28px;">
<a href="${esc(opts.siteUrl)}" style="text-decoration:none;"><img src="${esc(opts.logoUrl)}" width="150" alt="${esc(opts.companyName)}" style="display:block;border:0;width:150px;height:auto;"></a>
</td></tr>
${article.imageUrl ? `<tr><td><a href="${esc(article.url)}"><img src="${esc(article.imageUrl)}" width="600" alt="" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>` : ''}
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#c96f00;">${esc(t.kicker)}</p>
<h1 style="margin:0 0 8px;font-size:26px;line-height:1.25;color:#2b1d14;"><a href="${esc(article.url)}" style="color:#2b1d14;text-decoration:none;">${esc(article.title)}</a></h1>
${meta ? `<p style="margin:0 0 16px;font-size:13px;color:#8a7768;">${esc(meta)}</p>` : ''}
${article.excerpt ? `<p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a3b30;">${esc(article.excerpt)}</p>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:#ff8e00;">
<a href="${esc(article.url)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:bold;color:#2b1d14;text-decoration:none;">${esc(t.read)} &rarr;</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:28px;font-size:12px;line-height:1.6;color:#8a7768;border-top:1px solid #eee4da;">
${esc(t.why)} <a href="${esc(opts.siteUrl)}" style="color:#8a7768;">${esc(site)}</a>.<br>
<a href="${esc(opts.unsubscribeUrl)}" style="color:#8a7768;">${esc(t.unsubscribe)}</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html };
}
