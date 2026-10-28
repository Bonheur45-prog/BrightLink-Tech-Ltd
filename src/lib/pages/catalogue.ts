// The fixed catalogue of section types a page can be built from. Each type lists its layouts
// (variants) and its fields. One generic editor (src/components/admin/PageBuilder) draws the fields
// from this schema, and one generic parser/checker (./model.ts) cleans and validates them.
// Text fields hold one value per language ({ en, fr, rw }); "long" text keeps line breaks
// (a blank line starts a new paragraph). Media fields hold a media library id.

export type FieldDef =
  | { key: string; label: string; kind: 'text' | 'long'; required?: boolean; max?: number; hint?: string }
  | { key: string; label: string; kind: 'media'; hint?: string; video?: boolean }
  | { key: string; label: string; kind: 'link'; hint?: string; required?: boolean }
  | { key: string; label: string; kind: 'select'; options: { value: string; label: string }[]; default: string }
  | { key: string; label: string; kind: 'number'; min: number; max: number; default: number; hint?: string }
  | { key: string; label: string; kind: 'boolean'; default: boolean; hint?: string }
  | { key: string; label: string; kind: 'icon' }
  | { key: string; label: string; kind: 'items'; itemLabel: string; fields: FieldDef[]; max: number; min?: number; hint?: string };

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  variants: { value: string; label: string }[];
  fields: FieldDef[];
};

const eyebrow: FieldDef = { key: 'eyebrow', label: 'Small label above the heading', kind: 'text', max: 80 };
const heading: FieldDef = { key: 'heading', label: 'Heading', kind: 'text', required: true, max: 160 };
const highlight: FieldDef = { key: 'highlightText', label: 'Words to highlight in the heading', kind: 'text', max: 80, hint: 'Must appear exactly in the heading.' };
const intro: FieldDef = { key: 'intro', label: 'Introduction', kind: 'long', max: 800 };
const iconCards = (label: string, max = 12): FieldDef => ({
  key: 'items',
  label,
  kind: 'items',
  itemLabel: 'item',
  max,
  fields: [
    { key: 'icon', label: 'Icon', kind: 'icon' },
    { key: 'title', label: 'Title', kind: 'text', required: true, max: 100 },
    { key: 'text', label: 'Text', kind: 'long', max: 500 },
  ],
});

export const SECTIONS: SectionDef[] = [
  {
    type: 'hero',
    label: 'Hero slider',
    description: 'Large slides at the top of the home page.',
    variants: [
      { value: 'full', label: 'Full screen' },
      { value: 'large', label: 'Large' },
      { value: 'medium', label: 'Medium' },
    ],
    fields: [
      { key: 'autoplay', label: 'Change slides automatically', kind: 'boolean', default: true },
      { key: 'intervalSeconds', label: 'Seconds per slide', kind: 'number', min: 3, max: 30, default: 7 },
      { key: 'kenBurns', label: 'Slow zoom on photos', kind: 'boolean', default: true },
      { key: 'showArrows', label: 'Arrows', kind: 'boolean', default: true },
      { key: 'showDots', label: 'Dots', kind: 'boolean', default: true },
      {
        key: 'slides',
        label: 'Slides',
        kind: 'items',
        itemLabel: 'slide',
        min: 1,
        max: 6,
        fields: [
          { key: 'image', label: 'Photo', kind: 'media' },
          { key: 'video', label: 'Video (optional, plays instead of the photo)', kind: 'media', video: true },
          eyebrow,
          heading,
          highlight,
          { key: 'subheading', label: 'Text under the heading', kind: 'long', max: 400 },
          { key: 'primaryCta', label: 'Main button', kind: 'link' },
          { key: 'secondaryCta', label: 'Second button', kind: 'link' },
          { key: 'textAlign', label: 'Text position', kind: 'select', default: 'left', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Centre' }] },
          { key: 'overlay', label: 'Darkening over the photo', kind: 'select', default: 'medium', options: [{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'strong', label: 'Strong' }] },
        ],
      },
    ],
  },
  {
    type: 'banner',
    label: 'Page banner',
    description: 'Title area at the top of an inner page.',
    variants: [
      { value: 'cinematic', label: 'Photo behind the title' },
      { value: 'split', label: 'Title left, photo right' },
      { value: 'plain', label: 'Colour only' },
    ],
    fields: [eyebrow, heading, intro, { key: 'image', label: 'Photo', kind: 'media' }],
  },
  {
    type: 'highlights',
    label: 'Highlight links',
    description: 'A row of short linked cards (e.g. under the hero).',
    variants: [{ value: 'row', label: 'Row' }],
    fields: [
      {
        key: 'items',
        label: 'Cards',
        kind: 'items',
        itemLabel: 'card',
        max: 4,
        fields: [
          { key: 'title', label: 'Title', kind: 'text', required: true, max: 80 },
          { key: 'text', label: 'Text', kind: 'long', max: 300 },
          { key: 'link', label: 'Link', kind: 'link' },
        ],
      },
    ],
  },
  {
    type: 'textMedia',
    label: 'Text and photo',
    description: 'A story block: heading, paragraphs, points and one or two photos.',
    variants: [
      { value: 'image-right', label: 'Text left, photo right' },
      { value: 'image-left', label: 'Photo left, text right' },
      { value: 'stacked', label: 'Text above, photo below' },
    ],
    fields: [
      eyebrow,
      heading,
      highlight,
      { key: 'body', label: 'Paragraphs', kind: 'long', max: 4000, hint: 'Leave a blank line between paragraphs.' },
      { key: 'points', label: 'Bullet points', kind: 'long', max: 1500, hint: 'One per line.' },
      { key: 'image', label: 'Photo', kind: 'media' },
      { key: 'secondImage', label: 'Second photo (optional)', kind: 'media' },
      { key: 'badge', label: 'Badge on the photo', kind: 'text', max: 60 },
      iconCards('Feature cards', 6),
      { key: 'primaryCta', label: 'Main button', kind: 'link' },
      { key: 'secondaryCta', label: 'Second button', kind: 'link' },
    ],
  },
  {
    type: 'services',
    label: 'Services list',
    description: 'Cards for the published services (edited under Services).',
    variants: [
      { value: 'cards', label: 'Cards' },
      { value: 'list', label: 'List' },
    ],
    fields: [
      eyebrow,
      heading,
      intro,
      { key: 'learnMoreLabel', label: '“Learn more” text', kind: 'text', max: 40 },
      { key: 'limit', label: 'How many', kind: 'number', min: 1, max: 24, default: 12 },
      { key: 'homeOnly', label: 'Only services marked “show on home page”', kind: 'boolean', default: false },
      { key: 'viewAll', label: '“View all” link', kind: 'link' },
    ],
  },
  {
    type: 'projects',
    label: 'Projects list',
    description: 'Published projects (edited under Projects).',
    variants: [
      { value: 'grid', label: 'Grid' },
      { value: 'explorer', label: 'Grid with filters' },
      { value: 'list', label: 'List' },
    ],
    fields: [
      eyebrow,
      heading,
      intro,
      {
        key: 'filter',
        label: 'Which projects',
        kind: 'select',
        default: 'all',
        options: [
          { value: 'all', label: 'All' },
          { value: 'completed', label: 'Completed only' },
          { value: 'inProgress', label: 'In progress only' },
          { value: 'home', label: 'Marked “show on home page”' },
          { value: 'service', label: 'This service’s projects (service pages only)' },
        ],
      },
      { key: 'limit', label: 'How many', kind: 'number', min: 1, max: 60, default: 6 },
      { key: 'viewAll', label: '“View all” link', kind: 'link' },
    ],
  },
  {
    type: 'features',
    label: 'Icon cards',
    description: 'Reasons, values, offerings or steps, each with an icon.',
    variants: [
      { value: 'cards', label: 'Cards' },
      { value: 'list', label: 'List beside a photo' },
      { value: 'steps', label: 'Numbered steps' },
    ],
    fields: [eyebrow, heading, intro, { key: 'image', label: 'Photo (for “list beside a photo”)', kind: 'media' }, iconCards('Cards'), { key: 'cta', label: 'Button', kind: 'link' }],
  },
  {
    type: 'mission',
    label: 'Mission and vision',
    description: 'Two statements side by side, with optional value cards.',
    variants: [{ value: 'columns', label: 'Two columns' }],
    fields: [
      eyebrow,
      heading,
      { key: 'missionTitle', label: 'Mission title', kind: 'text', max: 60 },
      { key: 'missionText', label: 'Mission', kind: 'long', max: 800 },
      { key: 'visionTitle', label: 'Vision title', kind: 'text', max: 60 },
      { key: 'visionText', label: 'Vision', kind: 'long', max: 800 },
      { key: 'valuesHeading', label: 'Values heading', kind: 'text', max: 100 },
      iconCards('Values'),
    ],
  },
  {
    type: 'glance',
    label: 'At a glance',
    description: 'Short company facts (services, projects, location) taken from the site data.',
    variants: [{ value: 'row', label: 'Row' }],
    fields: [heading],
  },
  {
    type: 'clients',
    label: 'Client logos',
    description: 'Published clients (edited under Clients).',
    variants: [
      { value: 'grid', label: 'Grid' },
      { value: 'marquee', label: 'Moving row' },
    ],
    fields: [eyebrow, heading, intro],
  },
  {
    type: 'team',
    label: 'Team',
    description: 'Published team members (edited under Team).',
    variants: [
      { value: 'cards', label: 'Cards' },
      { value: 'list', label: 'List' },
    ],
    fields: [eyebrow, heading, intro, { key: 'groupPhoto', label: 'Group photo (optional)', kind: 'media' }, { key: 'emptyMessage', label: 'Text when nobody is published yet', kind: 'long', max: 300 }, { key: 'cta', label: 'Button', kind: 'link' }],
  },
  {
    type: 'faq',
    label: 'Questions and answers',
    description: 'Also tells Google these are FAQs.',
    variants: [{ value: 'accordion', label: 'Fold-out list' }],
    fields: [
      heading,
      intro,
      {
        key: 'items',
        label: 'Questions',
        kind: 'items',
        itemLabel: 'question',
        min: 1,
        max: 20,
        fields: [
          { key: 'question', label: 'Question', kind: 'text', required: true, max: 200 },
          { key: 'answer', label: 'Answer', kind: 'long', required: true, max: 1500 },
        ],
      },
    ],
  },
  {
    type: 'cta',
    label: 'Call to action',
    description: 'A closing band with one or two buttons.',
    variants: [
      { value: 'band', label: 'Full-width band' },
      { value: 'card', label: 'Card' },
    ],
    fields: [heading, { key: 'text', label: 'Text', kind: 'long', max: 500 }, { key: 'primaryCta', label: 'Main button', kind: 'link', required: true }, { key: 'secondaryCta', label: 'Second button', kind: 'link' }],
  },
  {
    type: 'contact',
    label: 'Contact block',
    description: 'Contact details from Site settings, with the contact form.',
    variants: [
      { value: 'split', label: 'Details left, form right' },
      { value: 'stacked', label: 'Details above the form' },
    ],
    fields: [
      eyebrow,
      heading,
      intro,
      { key: 'formTitle', label: 'Form title', kind: 'text', max: 100 },
      { key: 'showForm', label: 'Show the form', kind: 'boolean', default: true },
    ],
  },
  {
    type: 'newsletter',
    label: 'Newsletter sign-up',
    description: 'Email box that adds people to Subscribers.',
    variants: [{ value: 'band', label: 'Band' }],
    fields: [heading, { key: 'text', label: 'Text', kind: 'long', max: 400 }, { key: 'buttonLabel', label: 'Button text', kind: 'text', max: 30 }],
  },
  {
    type: 'posts',
    label: 'Blog articles',
    description: 'Latest published articles.',
    variants: [
      { value: 'grid', label: 'Grid with featured article' },
      { value: 'list', label: 'Simple grid' },
    ],
    fields: [heading, { key: 'limit', label: 'Articles per page', kind: 'number', min: 1, max: 24, default: 9 }],
  },
  {
    type: 'richText',
    label: 'Text',
    description: 'A heading with paragraphs (policies, notes).',
    variants: [
      { value: 'narrow', label: 'Narrow column' },
      { value: 'wide', label: 'Wide' },
    ],
    fields: [{ key: 'heading', label: 'Heading', kind: 'text', max: 160 }, { key: 'body', label: 'Text', kind: 'long', required: true, max: 10000, hint: 'Leave a blank line between paragraphs.' }],
  },
];

export const SECTION_BY_TYPE: Record<string, SectionDef> = Object.fromEntries(SECTIONS.map((s) => [s.type, s]));

export const BACKGROUNDS = [
  { value: 'default', label: 'Page colour' },
  { value: 'tint', label: 'Light tint' },
  { value: 'dark', label: 'Dark navy' },
  { value: 'image', label: 'Photo' },
] as const;

/** The pages built with sections. Service pages are added per service ("service:<id>"). */
export const PAGES = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'about', label: 'About us', path: '/about-us' },
  { key: 'services', label: 'Our services', path: '/our-services' },
  { key: 'projects', label: 'Our projects', path: '/our-projects' },
  { key: 'blog', label: 'Blog', path: '/blog' },
  { key: 'contact', label: 'Contact us', path: '/contact-us' },
] as const;

export type FixedPageKey = (typeof PAGES)[number]['key'];
export const MAX_SECTIONS = 20;
