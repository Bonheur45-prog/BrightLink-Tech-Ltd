'use client'

import { useActionState } from 'react'
import { submitContact, type FormState } from '@/lib/actions'
import { CheckIcon, SendIcon } from '@/components/ui/Icons'

const initial: FormState = { status: 'idle', message: '' }

const inputClass =
  'mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25 aria-[invalid=true]:border-red-500'

export function ContactForm({
  services,
  source = 'Home page — Get in touch',
}: {
  services: string[]
  source?: string
}) {
  const [state, action, pending] = useActionState(submitContact, initial)
  const err = state.fieldErrors ?? {}

  if (state.status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center py-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-brand-green/10 text-brand-green">
          <CheckIcon width={32} height={32} />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold">Message sent</h3>
        <p className="mt-2 max-w-sm text-slate-600">{state.message}</p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="text-sm font-semibold text-brand-navy-deep">
            Your name
          </label>
          <input id="cf-name" name="name" required autoComplete="name" className={inputClass} aria-invalid={Boolean(err.name)} aria-describedby={err.name ? 'cf-name-err' : undefined} />
          {err.name && <p id="cf-name-err" className="mt-1 text-sm text-red-600">{err.name}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="text-sm font-semibold text-brand-navy-deep">
            Email
          </label>
          <input id="cf-email" name="email" type="email" required autoComplete="email" className={inputClass} aria-invalid={Boolean(err.email)} aria-describedby={err.email ? 'cf-email-err' : undefined} />
          {err.email && <p id="cf-email-err" className="mt-1 text-sm text-red-600">{err.email}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-phone" className="text-sm font-semibold text-brand-navy-deep">
            Phone <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <input id="cf-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="cf-service" className="text-sm font-semibold text-brand-navy-deep">
            I’m interested in
          </label>
          <select id="cf-service" name="service" defaultValue="" className={inputClass}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="text-sm font-semibold text-brand-navy-deep">
          How can we help?
        </label>
        <textarea id="cf-message" name="message" rows={5} required className={`${inputClass} py-3`} aria-invalid={Boolean(err.message)} aria-describedby={err.message ? 'cf-message-err' : undefined} />
        {err.message && <p id="cf-message-err" className="mt-1 text-sm text-red-600">{err.message}</p>}
      </div>
      {/* honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {state.status === 'error' && !state.fieldErrors && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
        {pending ? 'Sending…' : 'Send message'}
        {!pending && <SendIcon width={18} height={18} />}
      </button>
    </form>
  )
}
