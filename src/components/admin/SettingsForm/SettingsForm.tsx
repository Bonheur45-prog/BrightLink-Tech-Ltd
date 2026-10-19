'use client';

import { useActionState, useState, useTransition } from 'react';
import { saveSettings, type SettingsFormState } from '@/app/admin/(cms)/settings/actions';
import { Checkbox, Field, Fieldset, Select, TextArea, TextInput } from '@/components/admin/Field/Field';
import { Button } from '@/components/admin/Button/Button';
import { LocaleTabs } from '@/components/admin/LocaleTabs/LocaleTabs';
import { MediaField, type PickedMedia } from '@/components/admin/MediaPicker/MediaPicker';
import { Notice } from '@/components/admin/Notice/Notice';
import { localeNames, locales, type Locale } from '@/i18n/config';
import { SOCIAL_NETWORKS, type SettingsTranslationData } from '@/lib/cms/settings-validation';
import { FONTS, type FontKey } from '@/lib/fonts';
import styles from './SettingsForm.module.css';

export type SettingsInitial = {
  companyName: string;
  legalName: string;
  phone: string;
  secondaryPhone: string;
  publicEmail: string;
  notificationEmail: string;
  addressStreet: string;
  addressCity: string;
  addressCountry: string;
  addressCountryCode: string;
  openingHours: string;
  socials: Record<string, string>;
  logo: PickedMedia | null;
  logoLight: PickedMedia | null;
  defaultOg: PickedMedia | null;
  titleTemplate: string;
  googleSiteVerification: string;
  enabledLocales: Locale[];
  headingFont: FontKey;
  bodyFont: FontKey;
  smoothScroll: boolean;
  parallax: boolean;
  translations: Record<Locale, SettingsTranslationData>;
};

const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

export function SettingsForm({ initial: s }: { initial: SettingsInitial }) {
  const [state, action] = useActionState<SettingsFormState, FormData>(saveSettings, { status: 'idle' });
  const [enabled, setEnabled] = useState<Locale[]>(s.enabledLocales);
  const [seo, setSeo] = useState({ title: s.translations.en.seoTitle, description: s.translations.en.seoDescription });
  // Submitted by hand (not <form action>) so React does not reset the fields, keeping typed text after an error.
  const [pending, startSubmit] = useTransition();
  const e = state.status === 'error' ? state.errors : {};

  const text = (name: keyof SettingsInitial, label: string, opts: { hint?: string; type?: string; required?: boolean; max?: number } = {}) => (
    <Field label={label} htmlFor={name} hint={opts.hint} error={e[name]} required={opts.required}>
      <TextInput id={name} name={name} type={opts.type ?? 'text'} defaultValue={String(s[name] ?? '')} maxLength={opts.max ?? 200} required={opts.required} />
    </Field>
  );

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startSubmit(() => action(data));
      }}
    >
      {state.status === 'error' && <Notice tone="error">{state.message}</Notice>}
      {state.status === 'saved' && <Notice tone="success">Saved at {time.format(state.savedAt)}. The website shows it now.</Notice>}

      <Fieldset legend="Company">
        {text('companyName', 'Company name', { required: true, max: 120 })}
        {text('legalName', 'Legal name', { required: true, max: 160, hint: 'Used in the copyright line and for Google.' })}
        <MediaField name="logoMediaId" label="Logo (for light backgrounds)" initial={s.logo} hint="Empty = the built-in BrightLink logo." />
        <MediaField name="logoLightMediaId" label="Logo for dark backgrounds" initial={s.logoLight} hint="Used in the footer and over the hero." />
      </Fieldset>

      <Fieldset legend="Contact">
        {text('phone', 'Phone', { max: 40 })}
        {text('secondaryPhone', 'Second phone', { max: 40 })}
        {text('publicEmail', 'Public email', { type: 'email', required: true, hint: 'Shown on the website.' })}
        {text('notificationEmail', 'Notification email', { type: 'email', required: true, hint: 'New contact messages are emailed here. Not shown on the website.' })}
        {text('addressStreet', 'Street')}
        {text('addressCity', 'City', { max: 80 })}
        {text('addressCountry', 'Country', { max: 80 })}
        {text('addressCountryCode', 'Country code', { max: 2, hint: '2 letters, e.g. RW. Helps Google show your location.' })}
        {text('openingHours', 'Opening hours', { hint: 'e.g. Mon–Fri 8:00–17:00' })}
      </Fieldset>

      <Fieldset legend="Social media" description="Paste the full link of each page you have. Empty ones are hidden.">
        {SOCIAL_NETWORKS.map((n) => (
          <Field key={n.key} label={n.label} htmlFor={`social.${n.key}`} error={e[`social.${n.key}`]}>
            <TextInput id={`social.${n.key}`} name={`social.${n.key}`} type="url" defaultValue={s.socials[n.key] ?? ''} maxLength={300} placeholder="https://" />
          </Field>
        ))}
      </Fieldset>

      <Fieldset legend="Languages" description="English is always on. Turn a language on to translate the site into it; anything not translated shows in English.">
        {locales.map((l) => (
          <Checkbox
            key={l}
            name="enabledLocales"
            value={l}
            label={localeNames[l]}
            checked={enabled.includes(l)}
            disabled={l === 'en'}
            onChange={(ev) => setEnabled((cur) => (ev.target.checked ? [...cur, l] : cur.filter((x) => x !== l)))}
          />
        ))}
      </Fieldset>

      <Fieldset legend="Texts and search engine defaults" description="Used on pages that have no title or description of their own.">
        <LocaleTabs
          tabs={locales
            .filter((l) => enabled.includes(l))
            .map((l) => {
              const t = s.translations[l];
              const f = (field: keyof SettingsTranslationData) => `${field}.${l}`;
              return {
                code: l,
                label: localeNames[l],
                hasError: Object.keys(e).some((k) => k.endsWith(`.${l}`)),
                note: l === 'en' ? undefined : 'Leave empty to use the English text.',
                panel: (
                  <div className={styles.stack}>
                    <Field label="Tagline" htmlFor={f('tagline')} error={e[f('tagline')]}>
                      <TextInput id={f('tagline')} name={f('tagline')} defaultValue={t.tagline} maxLength={200} />
                    </Field>
                    <Field label="Footer description" htmlFor={f('footerDescription')} error={e[f('footerDescription')]} hint="Empty = the tagline.">
                      <TextArea id={f('footerDescription')} name={f('footerDescription')} defaultValue={t.footerDescription} maxLength={500} rows={3} />
                    </Field>
                    <Field label="Default page title" htmlFor={f('seoTitle')} error={e[f('seoTitle')]} required={l === 'en'} hint="Aim for 50–60 characters.">
                      <TextInput
                        id={f('seoTitle')}
                        name={f('seoTitle')}
                        defaultValue={t.seoTitle}
                        maxLength={120}
                        onChange={l === 'en' ? (ev) => setSeo((x) => ({ ...x, title: ev.target.value })) : undefined}
                      />
                    </Field>
                    <Field label="Default description" htmlFor={f('seoDescription')} error={e[f('seoDescription')]} required={l === 'en'} hint="Aim for 120–160 characters.">
                      <TextArea
                        id={f('seoDescription')}
                        name={f('seoDescription')}
                        defaultValue={t.seoDescription}
                        maxLength={300}
                        rows={3}
                        onChange={l === 'en' ? (ev) => setSeo((x) => ({ ...x, description: ev.target.value })) : undefined}
                      />
                    </Field>
                  </div>
                ),
              };
            })}
        />
        <div className={styles.preview} aria-label="Google preview (English)">
          <p className={styles.previewLabel}>Google preview</p>
          <p className={styles.previewTitle}>{seo.title || 'Page title'}</p>
          <p className={styles.previewDesc}>{seo.description || 'Description'}</p>
          <p className={styles.previewCount} data-warn={seo.title.length > 60 || seo.description.length > 160 || undefined}>
            Title {seo.title.length}/60 · description {seo.description.length}/160
          </p>
        </div>
        {text('titleTemplate', 'Title pattern', { required: true, max: 120, hint: '%s is replaced by the page title, e.g. “%s | BrightLink Technologies”.' })}
        {text('googleSiteVerification', 'Google Search Console code', { max: 300, hint: 'Optional. Paste the code or the whole meta tag Google gives you.' })}
        <MediaField name="defaultOgMediaId" label="Default share image" initial={s.defaultOg} hint="Shown when a page is shared on WhatsApp, LinkedIn… and has no image of its own. Best size 1200 × 630." />
      </Fieldset>

      <Fieldset legend="Fonts" description="Self-hosted for speed. Visitors only download the two fonts chosen here.">
        {(['headingFont', 'bodyFont'] as const).map((name) => (
          <Field key={name} label={name === 'headingFont' ? 'Headings' : 'Body text'} htmlFor={name}>
            <Select id={name} name={name} defaultValue={s[name]}>
              {FONTS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} ({f.kind}) — {f.note}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </Fieldset>

      <Fieldset legend="Motion" description="Both are switched off automatically for visitors whose device asks for reduced motion.">
        <Checkbox name="smoothScroll" defaultChecked={s.smoothScroll} label="Smooth scrolling" hint="Computers only; phones keep their own scrolling." />
        <Checkbox name="parallax" defaultChecked={s.parallax} label="Parallax backgrounds" hint="Background photos move slower than the page." />
      </Fieldset>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={pending} aria-busy={pending || undefined}>
          {pending ? 'Saving…' : 'Save settings'}
        </Button>
      </div>
    </form>
  );
}
