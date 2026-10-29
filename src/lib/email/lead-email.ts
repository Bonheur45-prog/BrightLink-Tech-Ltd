// The email sent to the team for every new contact message. Pure (tested in email.test.ts).

export type LeadForEmail = { id: string; name: string; email: string; phone: string; service: string; message: string; source: string; locale: string; createdAt: Date }

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Header values must stay on one line (a newline would let a visitor add headers). */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

export function leadEmail(lead: LeadForEmail, opts: { siteUrl: string; companyName: string }) {
  const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' }).format(lead.createdAt)
  const adminUrl = `${opts.siteUrl.replace(/\/+$/, '')}/admin/messages/${lead.id}`
  const rows: [string, string][] = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Interested in', lead.service],
    ['Sent from', lead.source],
    ['Language', lead.locale],
    ['Received', when],
  ]
  const shown = rows.filter(([, v]) => v)
  const subject = oneLine(`New message from ${lead.name}${lead.service ? ` — ${lead.service}` : ''}`).slice(0, 200)
  const text = [
    `New message on the ${opts.companyName} website.`,
    '',
    ...shown.map(([k, v]) => `${k}: ${v}`),
    '',
    lead.message,
    '',
    `Open it in the CMS: ${adminUrl}`,
    'Reply to this email to answer the sender directly.',
  ].join('\n')
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#1e293b;max-width:620px">
<p>New message on the ${esc(opts.companyName)} website.</p>
<table cellpadding="6" style="border-collapse:collapse">${shown.map(([k, v]) => `<tr><td style="color:#64748b">${esc(k)}</td><td><strong>${esc(v)}</strong></td></tr>`).join('')}</table>
<p style="white-space:pre-wrap;background:#f8fafc;border-left:4px solid #ff8e00;padding:12px 16px">${esc(lead.message)}</p>
<p><a href="${esc(adminUrl)}">Open it in the CMS</a> · Reply to this email to answer the sender directly.</p>
</div>`
  return { subject, text, html, replyTo: oneLine(`${lead.name.replace(/["<>]/g, '')} <${lead.email}>`) }
}

/** SMTP settings from .env, or null when email is not set up yet. */
export function smtpConfig(env: Record<string, string | undefined> = process.env) {
  const host = env.SMTP_HOST?.trim()
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS
  if (!host || !user || !pass) return null
  const port = Number(env.SMTP_PORT) || 465
  return { host, port, secure: port === 465, auth: { user, pass }, from: env.EMAIL_FROM?.trim() || user }
}
