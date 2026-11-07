import 'server-only'

import nodemailer from 'nodemailer'
import { defaultLocale, type Locale } from '@/i18n/config'
import { prisma } from '@/lib/db'
import { photoUrl } from '@/lib/media'
import imageLoader from '@/lib/image-loader'
import { absoluteUrl, getServerUrl } from '@/lib/seo'
import { smtpConfig } from './lead-email'
import { newsletterEmail } from './newsletter-email'

/*
 * Emails each new article to the active subscribers, once.
 *
 * Runs right after an article is published (src/app/admin/(cms)/blog/actions.ts) and every 10 minutes
 * in the background (src/instrumentation.ts), which is what sends scheduled articles when their date
 * comes. An article is "claimed" (newsletterSentAt set) before the first email goes out, so two runs
 * can never send it twice. The result — how many were sent, how many failed and why — is saved on the
 * article and shown in its editor.
 */

/** Pause between emails: Brevo and Gmail dislike bursts. */
const GAP_MS = 250
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

let running = false

export async function sendDueNewsletters(): Promise<void> {
  if (running) return // one run at a time in this process
  running = true
  try {
    const due = await prisma.post.findMany({
      where: { status: 'PUBLISHED', deletedAt: null, emailSubscribers: true, newsletterSentAt: null, publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'asc' },
      select: { id: true },
      take: 5,
    })
    for (const { id } of due) await sendArticle(id)
  } catch (error) {
    console.error('[newsletter] run failed', error)
  } finally {
    running = false
  }
}

async function sendArticle(postId: string): Promise<void> {
  // Claim it first: if another run got here first, stop.
  const claimed = await prisma.post.updateMany({ where: { id: postId, newsletterSentAt: null }, data: { newsletterSentAt: new Date() } })
  if (claimed.count !== 1) return

  const record = (data: { newsletterSent?: number; newsletterFailed?: number; newsletterError?: string | null }) =>
    prisma.post.update({ where: { id: postId }, data })

  const smtp = smtpConfig()
  if (!smtp) {
    // Not sent: release the claim so it goes out once email is set up.
    await prisma.post.update({ where: { id: postId }, data: { newsletterSentAt: null, newsletterError: 'Email is not set up (SMTP_* in .env), so subscribers were not emailed yet.' } })
    return
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { translations: true, category: { include: { translations: true } }, coverMedia: true },
  })
  if (!post) return
  const subscribers = await prisma.subscriber.findMany({ where: { active: true }, select: { email: true, locale: true, token: true } })
  if (!subscribers.length) {
    await record({ newsletterSent: 0, newsletterFailed: 0, newsletterError: null })
    return
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { companyName: true } })
  const companyName = settings?.companyName || 'BrightLink'
  const siteUrl = getServerUrl()
  const cover = post.coverMedia && !post.coverMedia.deletedAt ? photoUrl(post.coverMedia) : null
  const imageUrl = cover ? absoluteUrl(cover.startsWith('/') ? cover : imageLoader({ src: cover, width: 1200 })) : null
  const english = post.translations.find((t) => t.locale === defaultLocale)

  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
    pool: true,
    maxConnections: 1,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  })

  let sent = 0
  let failed = 0
  let lastError: string | null = null
  try {
    for (const s of subscribers) {
      // The subscriber's language when the article has it, otherwise English.
      const tr = post.translations.find((t) => t.locale === s.locale && t.title.trim()) ?? english ?? post.translations[0]
      if (!tr) continue
      const locale: Locale = tr.locale
      const category = post.category.translations.find((c) => c.locale === locale)?.name ?? post.category.translations.find((c) => c.locale === defaultLocale)?.name ?? ''
      const unsubscribeUrl = `${siteUrl}/api/unsubscribe?t=${encodeURIComponent(s.token)}`
      const mail = newsletterEmail(
        { title: tr.title, excerpt: tr.excerpt, url: absoluteUrl(`/blog/${post.slug}`, locale), imageUrl, category, readingMinutes: post.readingMinutes },
        { locale, companyName, siteUrl, logoUrl: `${siteUrl}/images/brand/brightlink-logo-light.png`, unsubscribeUrl },
      )
      try {
        await transport.sendMail({
          from: smtp.from,
          to: s.email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          // One-click unsubscribe button in Gmail/Outlook (RFC 8058); also helps delivery.
          list: { unsubscribe: { url: unsubscribeUrl, comment: 'Unsubscribe' } },
          headers: { 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
        })
        sent++
      } catch (error) {
        failed++
        lastError = error instanceof Error ? error.message : String(error)
        console.error('[newsletter] could not email a subscriber', lastError)
      }
      await sleep(GAP_MS)
    }
  } finally {
    transport.close()
  }

  await record({
    newsletterSent: sent,
    newsletterFailed: failed,
    newsletterError: failed ? `${failed} email(s) could not be sent. Last error: ${lastError}`.slice(0, 500) : null,
  })
  await prisma.auditLog.create({ data: { action: 'post.newsletter', entityType: 'post', entityId: postId, meta: { sent, failed } } })
}
