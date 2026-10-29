import { DEFAULT_BLOG_PAGE } from '@/lib/content/blogDefaults';
import { DEFAULT_CONTACT_PAGE } from '@/lib/content/contactDefaults';
import { DEFAULT_ABOUT, DEFAULT_HOME } from '@/lib/content/defaults';
import { normalizeServiceDetail } from '@/lib/content/normalize';
import { DEFAULT_PROJECTS_PAGE } from '@/lib/content/projectDefaults';
import { DEFAULT_SERVICES_PAGE } from '@/lib/content/serviceDefaults';
import type { Cta, IconCard } from '@/lib/content/types';
import type { T } from '@/lib/cms/globals-model';
import type { FixedPageKey } from './catalogue';
import { parseSection, type LinkValue, type PageDoc, type Section, type Value } from './model';

// Starter pages, built from the existing starter content (src/lib/content/*Defaults.ts) so the
// site looks the same once pages are read from the database (Phase 6).

const t = (s: string | undefined | null): T => (s ? { en: s } : {});
const link = (c: Cta | null | undefined): LinkValue => ({ label: t(c?.label), url: c?.url ?? '', newTab: c?.newTab ?? false });
const cards = (items: { icon?: string; title: string; text: string }[]) => items.map((x, i) => ({ id: `c${i}`, icon: x.icon ?? '', title: t(x.title), text: t(x.text) }));
const paras = (list: string[]) => t(list.join('\n\n'));

let n = 0;
function sec(type: string, variant: string, data: Record<string, Value | unknown>, opts: { visible?: boolean; background?: Section['background']['style'] } = {}): Section {
  const s = parseSection({ id: `${type}-${++n}`, type, variant, visible: opts.visible ?? true, background: { style: opts.background ?? 'default' }, data }, n);
  if (!s) throw new Error(`Unknown section type ${type}`);
  return s;
}

const seo = (s: { metaTitle: string; metaDescription: string }) => ({ title: t(s.metaTitle), description: t(s.metaDescription), ogImage: null, noIndex: false });
const banner = (b: { eyebrow?: string; heading: string; intro: string }, cta?: Cta) => sec('banner', 'cinematic', { eyebrow: t(b.eyebrow), heading: t(b.heading), intro: t(b.intro), ...(cta ? { cta: link(cta) } : {}) });
const closing = (c: { enabled: boolean; heading: string; text: string; primaryCta: Cta | null; secondaryCta: Cta | null }) =>
  sec('cta', 'band', { heading: t(c.heading), text: t(c.text), primaryCta: link(c.primaryCta), secondaryCta: link(c.secondaryCta) }, { visible: c.enabled, background: 'dark' });

function home(): PageDoc {
  const h = DEFAULT_HOME;
  return {
    sections: [
      sec(
        'hero',
        h.hero.height,
        {
          autoplay: h.hero.autoplay,
          intervalSeconds: h.hero.intervalSeconds,
          kenBurns: h.hero.kenBurns,
          showArrows: h.hero.showArrows,
          showDots: h.hero.showDots,
          slides: h.hero.slides.map((s, i) => ({
            id: `slide${i}`,
            eyebrow: t(s.eyebrow),
            heading: t(s.heading),
            highlightText: t(s.highlightText),
            subheading: t(s.subheading),
            primaryCta: link(s.primaryCta),
            secondaryCta: link(s.secondaryCta),
            textAlign: s.textAlign,
            overlay: s.overlay,
          })),
        },
        { visible: h.hero.enabled },
      ),
      sec('highlights', 'row', { items: h.highlights.map((x, i) => ({ id: `h${i}`, title: t(x.title), text: t(x.text), link: { label: {}, url: x.url, newTab: false } })) }, { visible: h.highlights.length > 0 }),
      sec(
        'textMedia',
        'image-right',
        {
          eyebrow: t(h.whoWeAre.eyebrow),
          heading: t(h.whoWeAre.heading),
          highlightText: t(h.whoWeAre.highlightText),
          body: paras(h.whoWeAre.paragraphs),
          badge: t(h.whoWeAre.badge),
          items: cards(h.whoWeAre.features),
          primaryCta: link(h.whoWeAre.primaryCta ?? h.whoWeAre.learnMore),
          secondaryCta: link(h.whoWeAre.secondaryCta),
        },
        { visible: h.whoWeAre.enabled },
      ),
      sec('services', 'cards', { eyebrow: t(h.whatWeDo.eyebrow), heading: t(h.whatWeDo.heading), intro: t(h.whatWeDo.intro), learnMoreLabel: t(h.whatWeDo.learnMoreLabel), homeOnly: true, viewAll: link(h.whatWeDo.viewAll) }, { visible: h.whatWeDo.enabled, background: 'tint' }),
      sec('features', 'list', { eyebrow: t(h.why.eyebrow), heading: t(h.why.heading), intro: t(h.why.message), items: cards(h.why.points), cta: link(h.why.cta) }, { visible: h.why.enabled, background: 'dark' }),
      sec('newsletter', 'band', { heading: t(h.why.newsletter.heading), text: t(h.why.newsletter.text), buttonLabel: t(h.why.newsletter.buttonLabel) }, { visible: h.why.enabled && h.why.newsletter.enabled }),
      sec('projects', 'grid', { eyebrow: t(h.portfolio.eyebrow), heading: t(h.portfolio.heading), intro: t(h.portfolio.intro), filter: 'home', limit: h.portfolio.limit, viewAll: link(h.portfolio.viewAll) }, { visible: h.portfolio.enabled }),
      sec('clients', 'grid', { eyebrow: t(h.clients.eyebrow), heading: t(h.clients.heading), intro: t(h.clients.intro) }, { visible: h.clients.enabled, background: 'tint' }),
      sec('contact', 'split', { eyebrow: t(h.contact.eyebrow), heading: t(h.contact.heading), intro: t(h.contact.intro), formTitle: t(h.contact.formTitle), showForm: h.contact.showForm }, { visible: h.contact.enabled, background: 'dark' }),
    ],
    seo: seo(h.seo),
  };
}

function about(): PageDoc {
  const a = DEFAULT_ABOUT;
  return {
    sections: [
      banner(a.banner),
      sec(
        'textMedia',
        'image-left',
        { eyebrow: t(a.story.eyebrow), heading: t(a.story.heading), highlightText: t(a.story.highlightText), body: paras(a.story.paragraphs), points: t(a.story.points.join('\n')), badge: t(a.story.badge), primaryCta: link(a.story.cta) },
        { visible: a.story.enabled },
      ),
      sec('glance', 'row', { heading: t(a.glance.heading) }, { visible: a.glance.enabled, background: 'dark' }),
      sec(
        'mission',
        'columns',
        { eyebrow: t(a.mission.eyebrow), heading: t(a.mission.heading), missionTitle: t(a.mission.missionTitle), missionText: t(a.mission.missionText), visionTitle: t(a.mission.visionTitle), visionText: t(a.mission.visionText), valuesHeading: t(a.mission.valuesHeading), items: cards(a.mission.values) },
        { visible: a.mission.enabled },
      ),
      sec('features', 'steps', { eyebrow: t(a.process.eyebrow), heading: t(a.process.heading), intro: t(a.process.intro), items: cards(a.process.steps) }, { visible: a.process.enabled, background: 'tint' }),
      sec('services', 'list', { eyebrow: t(a.services.eyebrow), heading: t(a.services.heading), intro: t(a.services.intro) }, { visible: a.services.enabled }),
      sec('team', 'cards', { eyebrow: t(a.team.eyebrow), heading: t(a.team.heading), intro: t(a.team.intro), emptyMessage: t(a.team.emptyMessage), cta: link(a.team.cta) }, { visible: a.team.enabled }),
      sec('clients', 'grid', { eyebrow: t(DEFAULT_HOME.clients.eyebrow), heading: t(DEFAULT_HOME.clients.heading), intro: t(DEFAULT_HOME.clients.intro) }, { visible: a.showClients, background: 'tint' }),
      closing(a.closing),
    ],
    seo: seo(a.seo),
  };
}

function servicesIndex(): PageDoc {
  const s = DEFAULT_SERVICES_PAGE;
  return {
    sections: [
      banner(s.banner),
      sec('services', 'large', { eyebrow: t(s.listing.eyebrow), heading: t(s.listing.heading), intro: t(s.listing.intro), limit: 24 }),
      sec('features', 'list', { eyebrow: t(s.why.eyebrow), heading: t(s.why.heading), intro: t(s.why.message), items: cards(s.why.points as IconCard[]), cta: { label: t('Plan your project with us'), url: '/#get-in-touch', newTab: false } }, { visible: s.why.enabled, background: 'dark' }),
      sec('projects', 'grid', { eyebrow: t('Our Work'), heading: t('Projects we have built'), intro: t('A few of the systems, websites and campaigns delivered across our services.'), filter: 'home', limit: 6, viewAll: { label: t('View more projects'), url: '/our-projects', newTab: false } }, { visible: s.showProjects }),
      closing(s.closing),
    ],
    seo: seo(s.seo),
  };
}

function projectsIndex(): PageDoc {
  const p = DEFAULT_PROJECTS_PAGE;
  return {
    sections: [
      banner(p.banner),
      sec('projects', 'explorer', { heading: t(p.completed.heading), intro: t(p.completed.intro), secondHeading: t(p.inProgress.heading), secondIntro: t(p.inProgress.intro), filter: 'all', limit: 60 }),
      closing(p.closing),
    ],
    seo: seo(p.seo),
  };
}

function blogIndex(): PageDoc {
  const b = DEFAULT_BLOG_PAGE;
  return {
    sections: [
      banner(b.banner),
      sec('posts', 'grid', { heading: t(b.latestHeading), limit: b.postsPerPage }),
      sec('newsletter', 'band', { heading: t(b.subscribe.heading), text: t(b.subscribe.text), buttonLabel: t(b.subscribe.buttonLabel) }, { visible: b.subscribe.enabled }),
      closing({
        enabled: true,
        heading: 'Want a solution like the ones we write about?',
        text: 'Tell us what you need and we will discuss how to build it.',
        primaryCta: { label: 'Start a conversation', url: '/#get-in-touch', newTab: false },
        secondaryCta: { label: 'See our projects', url: '/our-projects', newTab: false },
      }),
    ],
    seo: seo(b.seo),
  };
}

function contact(): PageDoc {
  const c = DEFAULT_CONTACT_PAGE;
  return {
    sections: [
      banner(c.banner, { label: 'Talk to our team', url: '#get-in-touch', newTab: false }),
      sec(
        'contact',
        'page',
        { eyebrow: t('Reach us your way'), heading: t('Good conversations start here.'), intro: t('Choose the channel that works best for you. We’re ready to listen.'), formTitle: t(c.form.heading), showForm: true },
        { background: 'tint' },
      ),
      sec('newsletter', 'band', { heading: t(c.subscribe.heading), text: t(c.subscribe.text), buttonLabel: t(c.subscribe.buttonLabel) }, { visible: c.subscribe.enabled }),
    ],
    seo: seo(c.seo),
  };
}

// Section ids are numbered per page, so building a starter page twice gives the same ids.
const fresh = (build: () => PageDoc) => () => {
  n = 0;
  return build();
};

export const FIXED_PAGE_DEFAULTS: Record<FixedPageKey, () => PageDoc> = {
  home: fresh(home),
  about: fresh(about),
  services: fresh(servicesIndex),
  projects: fresh(projectsIndex),
  blog: fresh(blogIndex),
  contact: fresh(contact),
};

/** Starter page for one service, from its name and description (+ the built-in texts of the starter services). */
export function servicePageDefault(service: { slug: string; title: string; shortDescription: string; features: string[] }): PageDoc {
  n = 0;
  const d = normalizeServiceDetail({ ...service, features: service.features.map((text) => ({ text })) });
  if (!d) return { sections: [], seo: { title: {}, description: {}, ogImage: null, noIndex: false } };
  return {
    sections: [
      sec('banner', 'cinematic', { eyebrow: t(d.title), heading: t(d.banner.heading), intro: t(d.banner.intro) }),
      sec('textMedia', 'image-right', {
        eyebrow: t(d.overview.eyebrow),
        heading: t(d.overview.heading),
        highlightText: t(d.overview.highlightText),
        body: paras(d.overview.paragraphs),
        points: t(d.features.join('\n')),
        primaryCta: { label: t('Start a conversation'), url: '/#get-in-touch', newTab: false },
      }),
      sec('features', 'cards', { eyebrow: t('What’s included'), heading: t(d.offerings.heading), intro: t(d.offerings.intro), items: cards(d.offerings.items) }, { visible: d.offerings.items.length > 0, background: 'tint' }),
      sec(
        'features',
        'list',
        {
          eyebrow: t(d.why ? 'Why Choose Us' : DEFAULT_SERVICES_PAGE.why.eyebrow),
          heading: t(d.why?.heading ?? DEFAULT_SERVICES_PAGE.why.heading),
          intro: t(d.why?.message ?? DEFAULT_SERVICES_PAGE.why.message),
          items: cards(d.why?.points ?? (DEFAULT_SERVICES_PAGE.why.points as IconCard[])),
          cta: link(d.cta.primaryCta ?? { label: 'Talk to us', url: '/#get-in-touch', newTab: false }),
        },
        { background: 'dark' },
      ),
      sec('features', 'steps', { eyebrow: t('How We Work'), heading: t(d.process.heading), intro: t(d.process.intro), items: cards(d.process.steps) }, { visible: d.process.steps.length > 0 }),
      sec('projects', 'grid', { eyebrow: t('Our Work'), heading: t(d.work.heading), intro: t(d.work.intro), filter: 'service', limit: 6, viewAll: { label: t('View all projects'), url: '/our-projects', newTab: false } }),
      sec('clients', 'grid', { heading: t(d.clientsHeading) }, { visible: d.clientsServedFallback.length > 0 }),
      sec('faq', 'accordion', { heading: t(`${d.title}: common questions`), items: d.faqs.map((f, i) => ({ id: `q${i}`, question: t(f.question), answer: t(f.answer) })) }, { visible: d.faqs.length > 0 }),
      closing({ enabled: true, ...d.cta }),
    ],
    seo: seo(d.seo),
  };
}
