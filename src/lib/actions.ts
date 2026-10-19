'use server'

import { headers } from 'next/headers'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

export type FormState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: Record<string, string>
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Small in-memory limiter: at most 5 submissions per visitor per 10 minutes (per server instance). */
const hits = new Map<string, number[]>()
async function tooManyRequests(): Promise<boolean> {
  const h = await headers()
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim()
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > 5
}

const field = (data: FormData, key: string, max = 2000): string =>
  String(data.get(key) ?? '')
    .trim()
    .slice(0, max)

/** “Get in touch” form → Inbox → Messages in /admin. */
export async function submitContact(_prev: FormState, data: FormData): Promise<FormState> {
  // Hidden field real visitors never fill in; bots do. Pretend success so they don't retry.
  if (field(data, 'company_website')) return { status: 'success', message: 'Thank you! Your message has been sent.' }

  const name = field(data, 'name', 120)
  const email = field(data, 'email', 200)
  const phone = field(data, 'phone', 40)
  const service = field(data, 'service', 120)
  const message = field(data, 'message', 4000)
  const source = field(data, 'source', 120) || 'Home page — Get in touch'

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Please enter your name.'
  if (!EMAIL.test(email)) fieldErrors.email = 'Please enter a valid email address.'
  if (message.length < 10) fieldErrors.message = 'Please tell us a little more (at least 10 characters).'
  if (Object.keys(fieldErrors).length) return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors }

  if (await tooManyRequests())
    return { status: 'error', message: 'Too many messages in a short time. Please try again in a few minutes.' }

  try {
    await prisma.lead.create({ data: { name, email, phone, service, message, source, userAgent: (await headers()).get('user-agent')?.slice(0, 300) ?? null } })
    return { status: 'success', message: 'Thank you! Your message has been sent. We will get back to you shortly.' }
  } catch (error) {
    console.error('[contact] Could not save message', error)
    return {
      status: 'error',
      message: 'Sorry, something went wrong. Please email or call us directly.',
    }
  }
}

/** “Subscribe for our updates” → Inbox → Subscribers in /admin. */
export async function subscribe(_prev: FormState, data: FormData): Promise<FormState> {
  if (field(data, 'company_website')) return { status: 'success', message: 'Thanks for subscribing!' }

  const email = field(data, 'email', 200).toLowerCase()
  if (!EMAIL.test(email))
    return { status: 'error', message: 'Please enter a valid email address.', fieldErrors: { email: 'Invalid email' } }

  if (await tooManyRequests())
    return { status: 'error', message: 'Too many attempts. Please try again in a few minutes.' }

  try {
    try {
      await prisma.subscriber.create({ data: { email, source: field(data, 'source', 120) || 'Home page — Why work with us' } })
    } catch (error) {
      // already subscribed: same friendly answer, nothing revealed
      if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) throw error
    }
    return { status: 'success', message: 'Thanks for subscribing! We’ll keep you posted.' }
  } catch (error) {
    console.error('[subscribe] Could not save subscriber', error)
    return { status: 'error', message: 'Sorry, something went wrong. Please try again later.' }
  }
}
