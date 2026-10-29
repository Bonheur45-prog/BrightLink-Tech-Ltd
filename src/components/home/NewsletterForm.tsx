'use client'

import { useActionState } from 'react'
import { subscribe, type FormState } from '@/lib/actions'
import { CheckIcon, SendIcon } from '@/components/ui/Icons'

const initial: FormState = { status: 'idle', message: '' }

export function NewsletterForm({
  buttonLabel,
  source = 'Home page — Why work with us',
}: {
  buttonLabel: string
  source?: string
}) {
  const [state, action, pending] = useActionState(subscribe, initial)

  if (state.status === 'success') {
    return (
      <p role="status" className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 text-white">
        <CheckIcon width={22} height={22} className="mt-0.5 shrink-0 text-brand-yellow" />
        {state.message}
      </p>
    )
  }

  return (
    <form action={action} noValidate>
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          defaultValue={state.values?.email}
          required
          autoComplete="email"
          placeholder="Your email address"
          aria-invalid={state.status === 'error'}
          aria-describedby={state.status === 'error' ? 'newsletter-error' : undefined}
          className="min-h-12 min-w-0 flex-1 rounded-full border border-white/25 bg-white/10 px-5 text-white placeholder:text-white/60 focus:border-brand-yellow focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
        />
        {/* honeypot: hidden from people, irresistible to bots */}
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-70">
          {pending ? 'Subscribing…' : buttonLabel}
          {!pending && <SendIcon width={18} height={18} />}
        </button>
      </div>
      {state.status === 'error' && (
        <p id="newsletter-error" role="alert" className="mt-3 text-sm text-red-200">
          {state.message}
        </p>
      )}
    </form>
  )
}
