'use client'

import { useActionState } from 'react'
import { submitContact, type FormState } from '@/lib/actions'
import { CheckIcon, SendIcon } from '@/components/ui/Icons'
import { TurnstileField } from './TurnstileField'
import { useUi } from '@/components/i18n/useUi'

const initial: FormState = { status: 'idle', message: '' }

const inputClass =
  'mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25 aria-[invalid=true]:border-red-500'

export function ContactForm({
  services,
  source = 'Home page — Get in touch',
  turnstileSiteKey = null,
  fallbackEmail,
}: {
  services: string[]
  source?: string
  /** Cloudflare Turnstile site key (null = spam check off) */
  turnstileSiteKey?: string | null
  fallbackEmail?: string
}) {
  const t = useUi()
  const [state, action, pending] = useActionState(submitContact, initial)
  const err = state.fieldErrors ?? {}
  const v = state.values ?? {}

  if (state.status === 'success') {
    return (
      <div role="status" className="flex flex-col items-center py-10 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-brand-green/10 text-brand-green">
          <CheckIcon width={32} height={32} />
        </span>
        <h3 className="mt-5 font-display text-2xl font-semibold">{t.messageSent}</h3>
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
            {t.yourName}
          </label>
          <input id="cf-name" name="name" defaultValue={v.name} required autoComplete="name" className={inputClass} aria-invalid={Boolean(err.name)} aria-describedby={err.name ? 'cf-name-err' : undefined} />
          {err.name && <p id="cf-name-err" className="mt-1 text-sm text-red-600">{err.name}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="text-sm font-semibold text-brand-navy-deep">
            {t.emailField}
          </label>
          <input id="cf-email" name="email" type="email" defaultValue={v.email} required autoComplete="email" className={inputClass} aria-invalid={Boolean(err.email)} aria-describedby={err.email ? 'cf-email-err' : undefined} />
          {err.email && <p id="cf-email-err" className="mt-1 text-sm text-red-600">{err.email}</p>}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-phone" className="text-sm font-semibold text-brand-navy-deep">
            {t.phoneField} <span className="font-normal text-slate-500">{t.optional}</span>
          </label>
          <input id="cf-phone" name="phone" type="tel" defaultValue={v.phone} autoComplete="tel" className={inputClass} />
        </div>
        <div>
          <label htmlFor="cf-service" className="text-sm font-semibold text-brand-navy-deep">
            {t.interestedIn}
          </label>
          {/* key: a <select> only takes its default when it is first drawn, so it is redrawn with the visitor's choice after an error */}
          <select key={v.service ?? ''} id="cf-service" name="service" defaultValue={v.service ?? ''} className={inputClass}>
            <option value="">{t.selectService}</option>
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Something else">{t.somethingElse}</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="cf-message" className="text-sm font-semibold text-brand-navy-deep">
          {t.howCanWeHelp}
        </label>
        <textarea id="cf-message" name="message" rows={5} defaultValue={v.message} required className={`${inputClass} py-3`} aria-invalid={Boolean(err.message)} aria-describedby={err.message ? 'cf-message-err' : undefined} />
        {err.message && <p id="cf-message-err" className="mt-1 text-sm text-red-600">{err.message}</p>}
      </div>
      {/* honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      {turnstileSiteKey && <TurnstileField siteKey={turnstileSiteKey} resetKey={state.status === 'error' ? state : null} fallbackEmail={fallbackEmail} />}
      {state.status === 'error' && !state.fieldErrors && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full disabled:opacity-70 sm:w-auto">
        {pending ? t.sending : t.sendMessageButton}
        {!pending && <SendIcon width={18} height={18} />}
      </button>
    </form>
  )
}
