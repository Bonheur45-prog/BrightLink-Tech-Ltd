import { locales, type Locale } from '@/i18n/config';
import { isValidSlug, slugify } from './slug';
import type { Errors, Input, Validation } from './settings-validation';

// Pure validation of the collection editors (services, projects, clients, team). Tested in phase3.test.ts.
// Translated fields are named "<field>.<locale>", e.g. "title.fr". Lists (features, paragraphs…) are one item per line.

const MEDIA_ID = /^[a-z0-9]{10,40}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const lines = (raw: string, maxItems = 20, maxLen = 300) =>
  raw
    .split(/\r?\n/)
    .map((l) => l.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);

function helpers(input: Input, errors: Errors) {
  const text = (name: string, label: string, max: number, required = false) => {
    const v = input.get(name).trim();
    if (required && !v) errors[name] = `${label} is required.`;
    else if (v.length > max) errors[name] = `${label} can be at most ${max} characters.`;
    return v;
  };
  const media = (name: string) => {
    const v = input.get(name).trim();
    return MEDIA_ID.test(v) ? v : null;
  };
  const int = (name: string, min: number, max: number, fallback: number) => {
    const n = Number.parseInt(input.get(name), 10);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };
  const url = (name: string, label: string) => {
    const v = input.get(name).trim();
    if (!v) return '';
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      if (u.protocol === 'https:' || u.protocol === 'http:') return u.toString();
    } catch {
      /* fall through */
    }
    errors[name] = `${label}: use a full web address (https://…).`;
    return v;
  };
  const slug = (name: string, fallbackFrom: string) => {
    const raw = input.get(name).trim().toLowerCase();
    const v = raw || slugify(fallbackFrom);
    if (!isValidSlug(v)) errors[name] = 'Use lowercase letters, numbers and dashes, e.g. web-design.';
    return v;
  };
  const published = () => input.get('status') === 'PUBLISHED';
  /** One value per language; non-English rows that are completely empty are left out. */
  function translations<T extends Record<string, unknown>>(build: (l: Locale, t: (field: string, label: string, max: number, required?: boolean) => string) => T, isEmpty: (row: T) => boolean) {
    const out: Partial<Record<Locale, T>> = {};
    for (const l of locales) {
      const row = build(l, (field, label, max, required = false) => text(`${field}.${l}`, label, max, required && l === 'en'));
      if (l === 'en' || !isEmpty(row)) out[l] = row;
    }
    return out;
  }
  return { text, media, int, url, slug, published, translations };
}

const allEmpty = (row: Record<string, unknown>) => Object.values(row).every((v) => (Array.isArray(v) ? v.length === 0 : !v));

// ── Services ──
export type ServiceT = { title: string; shortDescription: string; features: string[]; metaTitle: string; metaDescription: string };
export type ServiceData = { slug: string; status: 'DRAFT' | 'PUBLISHED'; icon: string; showOnHome: boolean; sortOrder: number; coverMediaId: string | null; translations: Partial<Record<Locale, ServiceT>> };

export function validateService(input: Input, iconKeys: string[]): Validation<ServiceData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const translations = h.translations<ServiceT>(
    (l, t) => ({
      title: t('title', 'Name', 120, true),
      shortDescription: t('shortDescription', 'Short description', 300),
      features: lines(input.get(`features.${l}`), 12, 160),
      metaTitle: t('metaTitle', 'Search title', 120),
      metaDescription: t('metaDescription', 'Search description', 300),
    }),
    allEmpty,
  );
  const icon = input.get('icon');
  const data: ServiceData = {
    slug: h.slug('slug', translations.en?.title ?? ''),
    status: h.published() ? 'PUBLISHED' : 'DRAFT',
    icon: iconKeys.includes(icon) ? icon : '',
    showOnHome: input.get('showOnHome') === 'on',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
    coverMediaId: h.media('coverMediaId'),
    translations,
  };
  if (data.status === 'PUBLISHED' && !translations.en?.shortDescription) errors['shortDescription.en'] = 'Add a short description before publishing.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

// ── Projects ──
export type ProjectT = { title: string; category: string; shortDescription: string; paragraphs: string[]; highlights: string[]; metaTitle: string; metaDescription: string };
export type ProjectData = {
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  state: 'COMPLETED' | 'IN_PROGRESS';
  progress: number;
  serviceId: string | null;
  externalUrl: string;
  showOnHome: boolean;
  sortOrder: number;
  coverMediaId: string | null;
  gallery: string[];
  translations: Partial<Record<Locale, ProjectT>>;
};

export function validateProject(input: Input): Validation<ProjectData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const translations = h.translations<ProjectT>(
    (l, t) => ({
      title: t('title', 'Name', 120, true),
      category: t('category', 'Category', 80),
      shortDescription: t('shortDescription', 'Short description', 300),
      paragraphs: lines(input.get(`paragraphs.${l}`), 12, 2000),
      highlights: lines(input.get(`highlights.${l}`), 12, 160),
      metaTitle: t('metaTitle', 'Search title', 120),
      metaDescription: t('metaDescription', 'Search description', 300),
    }),
    allEmpty,
  );
  const state = input.get('state') === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'COMPLETED';
  const serviceId = input.get('serviceId').trim();
  const data: ProjectData = {
    slug: h.slug('slug', translations.en?.title ?? ''),
    status: h.published() ? 'PUBLISHED' : 'DRAFT',
    state,
    progress: state === 'COMPLETED' ? 100 : h.int('progress', 0, 99, 0),
    serviceId: MEDIA_ID.test(serviceId) ? serviceId : null,
    externalUrl: h.url('externalUrl', 'Live website'),
    showOnHome: input.get('showOnHome') === 'on',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
    coverMediaId: h.media('coverMediaId'),
    gallery: [...new Set(input.getAll('gallery').filter((v) => MEDIA_ID.test(v)))].slice(0, 30),
    translations,
  };
  if (data.status === 'PUBLISHED' && !translations.en?.shortDescription) errors['shortDescription.en'] = 'Add a short description before publishing.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

// ── Clients ──
export type ClientData = { name: string; website: string; logoMediaId: string | null; status: 'DRAFT' | 'PUBLISHED'; sortOrder: number };

export function validateClient(input: Input): Validation<ClientData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const data: ClientData = {
    name: h.text('name', 'Name', 120, true),
    website: h.url('website', 'Website'),
    logoMediaId: h.media('logoMediaId'),
    status: h.published() ? 'PUBLISHED' : 'DRAFT',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

// ── Team ──
export type TeamT = { role: string; bio: string };
export type TeamData = { name: string; email: string; linkedin: string; photoMediaId: string | null; status: 'DRAFT' | 'PUBLISHED'; sortOrder: number; translations: Partial<Record<Locale, TeamT>> };

export function validateTeam(input: Input): Validation<TeamData> {
  const errors: Errors = {};
  const h = helpers(input, errors);
  const email = input.get('email').trim().toLowerCase();
  if (email && !EMAIL.test(email)) errors.email = 'Use a valid email address.';
  const linkedin = h.url('linkedin', 'LinkedIn');
  if (linkedin && !errors.linkedin && !/^https?:\/\/([a-z]+\.)?linkedin\.com\//i.test(linkedin)) errors.linkedin = 'Paste the LinkedIn profile link (https://www.linkedin.com/in/…).';
  const data: TeamData = {
    name: h.text('name', 'Name', 120, true),
    email,
    linkedin,
    photoMediaId: h.media('photoMediaId'),
    status: h.published() ? 'PUBLISHED' : 'DRAFT',
    sortOrder: h.int('sortOrder', 0, 9999, 0),
    translations: h.translations<TeamT>((_l, t) => ({ role: t('role', 'Role', 120, true), bio: t('bio', 'Short bio', 2000) }), allEmpty),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
