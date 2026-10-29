'use server'

import { headers } from 'next/headers'
import { after } from 'next/server'
import { Prisma } from '@prisma/client'
import { ui } from '@/i18n/ui'
import { getRequestLocale } from '@/lib/content/request-locale'
import { prisma } from '@/lib/db'
import { notifyLead } from '@/lib/email/notify-lead'
import { clientIp } from '@/lib/security/client-ip'
import { enquiryLimiter, limiter } from '@/lib/security/rate-limit'
import { TURNSTILE_RESPONSE_FIELD, verifyTurnstile } from '@/lib/security/turnstile'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: Record<string, string>
  /** What the visitor typed, sent back with an error so the form can show it again (React empties a form after its action). */
  values?: Record<string, string>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Contact form: 5 messages per visitor per 10 minutes. Newsletter: 10 sign-ups per visitor per 10 minutes. */
const subscribeLimiter = () => limiter('subscribe', 10, 10 * 60 * 1000)

const field = (data: FormData, key: string, max = 2000): string =>
  String(data.get(key) ?? '')
    .trim()
    .slice(0, max)

/** “Get in touch” form → Inbox → Messages in /admin. */
export async function submitContact(_prev: FormState, data: FormData): Promise<FormState> {
  const locale = await getRequestLocale()
  const t = ui(locale)
  // Hidden field real visitors never fill in; bots do. Pretend success so they don't retry.
  if (field(data, 'company_website')) return { status: 'success', message: t.formSent }

  const name = field(data, 'name', 120)
  const email = field(data, 'email', 200)
  const phone = field(data, 'phone', 40)
  const service = field(data, 'service', 120)
  const message = field(data, 'message', 4000)
  const source = field(data, 'source', 120) || 'Home page — Get in touch'

  const values = { name, email, phone, service, message }
  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = t.formNameRequired
  if (!EMAIL.test(email)) fieldErrors.email = t.formEmailInvalid
  if (message.length < 10) fieldErrors.message = t.formMessageShort
  if (Object.keys(fieldErrors).length) return { status: 'error', message: t.formCheckFields, fieldErrors, values }

  const h = await headers()
  const ip = clientIp(h)
  if (!enquiryLimiter().take(ip))
    return { status: 'error', message: t.formTooMany, values }

  // Spam check (Cloudflare Turnstile), only when its keys are set in .env. If Cloudflare cannot be
  // reached the message is let through (the rate limit still applies) rather than lose a real enquiry.
  const check = await verifyTurnstile(field(data, TURNSTILE_RESPONSE_FIELD, 2048), ip)
  if (check === 'failed') return { status: 'error', message: t.formHumanCheck, values }

  try {
    const lead = await prisma.lead.create({
      data: { name, email, phone, service, message, source, locale, userAgent: h.get('user-agent')?.slice(0, 300) ?? null },
    })
    // The message is saved: that is the success the visitor is told about. The email to the team is sent
    // after the response; its result (sent / failed / not set up) is shown on the message in /admin.
    after(() => notifyLead(lead.id).catch((error) => console.error('[contact] notification step failed', error)))
    return { status: 'success', message: t.formSent }
  } catch (error) {
    console.error('[contact] Could not save message', error)
    return { status: 'error', message: t.formFailed, values }
  }
}

/** “Subscribe for our updates” → Inbox → Subscribers in /admin. */
export async function subscribe(_prev: FormState, data: FormData): Promise<FormState> {
  const t = ui(await getRequestLocale())
  if (field(data, 'company_website')) return { status: 'success', message: t.subscribed }

  const email = field(data, 'email', 200).toLowerCase()
  if (!EMAIL.test(email))
    return { status: 'error', message: t.formEmailInvalid, fieldErrors: { email: t.formEmailInvalid }, values: { email } }

  if (!subscribeLimiter().take(clientIp(await headers())))
    return { status: 'error', message: t.subscribeTooMany, values: { email } }

  try {
    try {
      await prisma.subscriber.create({ data: { email, source: field(data, 'source', 120) || 'Home page — Why work with us' } })
    } catch (error) {
      // already subscribed: same friendly answer, nothing revealed
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error
    }
    return { status: 'success', message: t.subscribed }
  } catch (error) {
    console.error('[subscribe] Could not save subscriber', error)
    return { status: 'error', message: t.subscribeFailed, values: { email } }
  }
}
