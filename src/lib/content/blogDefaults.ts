import { markdownToBlocks, readingMinutes } from './richtext'
import type { BlogCategory, BlogPageData, BlogPostFull } from './types'

/**
 * Starter blog content. Written in plain, truthful terms: it describes what BrightLink built and gives
 * general, evergreen technology advice. No statistics, prices, testimonials or invented news.
 * Everything is editable in /admin → Blog.
 */

export const DEFAULT_BLOG_PAGE: BlogPageData = {
  banner: {
    eyebrow: 'The BrightLink Journal',
    heading: 'Stories, solutions and technology news from BrightLink',
    intro:
      'Read how we build the systems and websites our clients use, plus practical advice and the technology trends that matter to organisations in Rwanda.',
    image: null,
  },
  postsPerPage: 9,
  latestHeading: 'Latest articles',
  subscribe: {
    enabled: true,
    heading: 'Get new articles in your inbox',
    text: 'Subscribe for our latest solutions, tips and technology news. No spam — unsubscribe any time.',
    buttonLabel: 'Subscribe',
  },
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}

export const STARTER_CATEGORIES_RAW = [
  {
    name: 'Our Solutions',
    slug: 'our-solutions',
    description: 'Behind the scenes of the systems and platforms BrightLink has built or is building.',
    icon: 'code',
    color: 'orange' as const,
    order: 10,
  },
  {
    name: 'Tech News & Trends',
    slug: 'tech-news-trends',
    description: 'What is changing in the world of technology, explained in plain language.',
    icon: 'rocket',
    color: 'teal' as const,
    order: 20,
  },
  {
    name: 'Web & Design',
    slug: 'web-design',
    description: 'Websites that look sharp, load fast and get found — and how we build them.',
    icon: 'globe',
    color: 'blue' as const,
    order: 30,
  },
  {
    name: 'Digital Marketing',
    slug: 'digital-marketing',
    description: 'Practical ideas for growing your visibility and reaching the right customers online.',
    icon: 'megaphone',
    color: 'green' as const,
    order: 40,
  },
  {
    name: 'IT Support Tips',
    slug: 'it-support-tips',
    description: 'Simple habits and advice to keep your technology safe and running smoothly.',
    icon: 'shield',
    color: 'navy' as const,
    order: 50,
  },
]

export const STARTER_CATEGORIES: BlogCategory[] = STARTER_CATEGORIES_RAW.map((c, i) => ({
  id: `starter-category-${i}`,
  name: c.name,
  slug: c.slug,
  url: `/blog/category/${c.slug}`,
  description: c.description,
  icon: c.icon,
  color: c.color,
  count: 0,
  seo: { metaTitle: '', metaDescription: '' },
}))

type RawPost = {
  title: string
  slug: string
  category: string
  excerpt: string
  date: string
  featured?: boolean
  tags: string[]
  focusKeyword: string
  metaTitle: string
  metaDescription: string
  body: string
}

export const STARTER_POSTS_RAW: RawPost[] = [
  {
    title: 'StockPro: keeping stock under control with an inventory system',
    slug: 'stockpro-inventory-management-system',
    category: 'our-solutions',
    excerpt: 'How StockPro, the inventory management system built by BrightLink, helps organisations always know what they have in stock.',
    date: '2026-10-16T08:00:00.000Z',
    featured: true,
    tags: ['inventory', 'StockPro', 'software'],
    focusKeyword: 'inventory management system',
    metaTitle: 'StockPro: An Inventory Management System by BrightLink',
    metaDescription:
      'Meet StockPro, the inventory management system built by BrightLink Technologies in Kigali. See what it does and why organisations need one.',
    body: `Running out of a key item — or discovering you are holding far more than you need — is a problem almost every organisation meets sooner or later. **StockPro** is the inventory management system we built at BrightLink to solve it.

## The problem with tracking stock by hand

Notebooks and spreadsheets work when there are only a few items. As the business grows, records fall behind, numbers stop matching what is on the shelf, and nobody is sure which figure is right. Time is lost searching for answers instead of serving customers.

## What StockPro does

StockPro keeps a single, organised record of your stock so that the whole team looks at the same numbers:

- Tracks stock levels, so you always know what you have
- Records stock movements, so you can see what came in and what went out
- Replaces scattered paperwork with one clear system

## Why we build systems like this

We start by understanding how an organisation really works, then design the system around that process — not the other way around. After launch we stay available for improvements and support.

## Need a system for your own operations?

If you are managing stock, assets or records by hand, we would be glad to talk. Read more about our [software development service](/our-services/software-development) or [get in touch](/#get-in-touch).`,
  },
  {
    title: 'CrewTrack: organising employee records in one place',
    slug: 'crewtrack-employee-management-system',
    category: 'our-solutions',
    excerpt: 'CrewTrack is BrightLink’s employee management system for keeping staff records and HR processes organised and easy to follow.',
    date: '2026-10-14T08:00:00.000Z',
    tags: ['HR', 'CrewTrack', 'software'],
    focusKeyword: 'employee management system',
    metaTitle: 'CrewTrack: Employee Management System by BrightLink',
    metaDescription:
      'CrewTrack is an employee management system built by BrightLink Technologies to keep staff records and HR processes organised in one place.',
    body: `Behind every organisation is a team, and keeping track of that team takes more than a filing cabinet. **CrewTrack** is the employee management system we designed to keep staff information and HR processes in one organised place.

## Why employee records need a system

When personnel information lives in separate files, emails and notebooks, simple questions become slow to answer. Who works where? What needs updating? What is still pending? A system gives everyone one reliable source.

## What CrewTrack is for

- Keeping staff records organised and easy to find
- Making HR processes simpler to follow
- Giving managers a clearer view of their team

## Built around your process

Every organisation manages people a little differently, so we begin by learning how yours works and shape the system to match. We also train your team and support the system after it goes live.

## Talk to us

Interested in a system for your own team? Explore our [software development service](/our-services/software-development) or [contact us](/#get-in-touch).`,
  },
  {
    title: 'ComCoders: building a home for young developers in Rwanda',
    slug: 'comcoders-platform-for-young-developers',
    category: 'our-solutions',
    excerpt: 'ComCoders is a platform we are building to connect young developers in Rwanda, so they can share skills and hear about new opportunities.',
    date: '2026-10-12T08:00:00.000Z',
    tags: ['ComCoders', 'developers', 'Rwanda'],
    focusKeyword: 'ComCoders',
    metaTitle: 'ComCoders: A Platform for Young Developers in Rwanda',
    metaDescription:
      'ComCoders is a platform being built by BrightLink Technologies to connect young developers in Rwanda so they can share skills and hear about new opportunities.',
    body: `Talented young developers are growing up across Rwanda, but they do not always know each other — or hear about the opportunities that are out there. **ComCoders** is the platform we are building to change that.

## What ComCoders is

ComCoders connects young developers in Rwanda in one place. It is designed so they can:

- Share skills and learn from each other
- Get updates on new opportunities in Rwanda

## Where it stands

ComCoders is currently in development and well advanced. You can follow its progress on our [projects page](/our-projects/comcoders).

## Why we are building it

Technology grows faster when people share what they know. By giving developers a shared space, we hope to help the community learn together and find the next step in their careers.

## Who it is for

ComCoders is for young developers who are starting out, building their skills or looking for their next opportunity. Whether someone has a lot of experience to share or a lot of questions to ask, the idea is the same: a place where the community grows together instead of working alone.

## Get involved

Have ideas for ComCoders, or want to talk about building a platform of your own? [Get in touch](/#get-in-touch).`,
  },
  {
    title: 'Websites we have built: what goes into a site that gets found',
    slug: 'business-website-design-in-rwanda',
    category: 'web-design',
    excerpt: 'From sagecltd.com to powerplustechnology.rw, here is what we focus on in every business website design project.',
    date: '2026-10-10T08:00:00.000Z',
    tags: ['website design', 'SEO', 'responsive'],
    focusKeyword: 'business website design',
    metaTitle: 'Business Website Design in Rwanda: What Goes Into It',
    metaDescription:
      'Business website design by BrightLink: sagecltd.com, powerplustechnology.rw, nsi-monique.com and gecoafrica.com. See what goes into every site we build.',
    body: `Good business website design starts with a simple idea: a website is often the first impression people have of an organisation. We have designed and built websites for clients including **sagecltd.com**, **powerplustechnology.rw**, **nsi-monique.com** and **gecoafrica.com**. Here is what we focus on every time.

## 1. Mobile-first, responsive design

Many visitors arrive on a phone. We design for small screens first, then scale up, so the site is comfortable to use on any device.

## 2. A structure search engines understand

Clear headings, sensible page titles and fast loading help Google understand a site. We build this in from the start rather than adding it later.

## 3. Content you can update yourself

A website should not depend on a developer for every small change. We set sites up so your team can keep the content fresh.

## 4. A clear way to get in touch

Every good business website makes the next step obvious: a call, an email or a simple form.

## Looking for a new website?

See our [website design service](/our-services/website-design) and the [websites we have built](/our-projects), then [start a conversation](/#get-in-touch).`,
  },
  {
    title: 'AI at work: practical ways organisations can start',
    slug: 'ai-for-business-practical-ways-to-start',
    category: 'tech-news-trends',
    excerpt: 'AI tools are showing up in everyday office work. Here is a sensible way for an organisation to start using them.',
    date: '2026-10-08T08:00:00.000Z',
    tags: ['AI', 'productivity', 'trends'],
    focusKeyword: 'AI for business',
    metaTitle: 'AI for Business: Practical Ways to Get Started',
    metaDescription:
      'AI for business is moving into everyday work. Learn a simple, low-risk way for your organisation to get started with AI tools.',
    body: `Artificial intelligence has moved from headlines into everyday work tools: writing assistants, meeting notes, data summaries and customer-service helpers. The question for most organisations is no longer *whether* to pay attention to AI for business, but *how* to start sensibly.

## Start with a real, small problem

Pick one repetitive task that costs your team time — drafting routine replies, summarising long documents, organising notes — and test an AI tool on that alone. A narrow trial teaches more than a big plan.

## Keep a person in the loop

AI can make mistakes. Treat its output as a first draft that someone on your team checks before it is used or sent.

## Protect sensitive information

Do not paste confidential customer, financial or personal data into tools you have not reviewed. Decide as a team which information is never shared with outside tools.

## Measure, then expand

After a few weeks, ask whether the task became faster or better. If yes, expand carefully. If not, try another idea.

## Need advice?

Choosing technology that really helps is part of our [IT support and consultancy service](/our-services/it-support-consultancy). [Talk to us](/#get-in-touch).`,
  },
  {
    title: 'Five cybersecurity habits every organisation should have',
    slug: 'five-cybersecurity-habits-for-organisations',
    category: 'it-support-tips',
    excerpt: 'You do not need a big budget to be safer online. These five habits protect most organisations from common problems.',
    date: '2026-10-06T08:00:00.000Z',
    tags: ['cybersecurity', 'IT support', 'passwords'],
    focusKeyword: 'cybersecurity habits',
    metaTitle: '5 Cybersecurity Habits Every Organisation Should Have',
    metaDescription:
      'Five simple cybersecurity habits that help organisations stay safe: strong passwords, two-step verification, updates, backups and care with links.',
    body: `Most security problems start with ordinary mistakes, not clever attacks. These five cybersecurity habits are simple, cost little and prevent many common problems.

## 1. Use strong, different passwords

Reusing one password everywhere means one leak can open many doors. Use a password manager and unique passwords for important accounts.

## 2. Turn on two-step verification

Where it is offered, switch on a second step such as a code on your phone. It stops many break-ins even if a password is stolen.

## 3. Keep software up to date

Updates often fix security holes. Install them promptly on computers, phones and network equipment.

## 4. Back up what matters

Keep copies of important files somewhere separate, and check from time to time that you can really restore them.

## 5. Be careful with links and attachments

If a message is unexpected, urgent or asks for money or passwords, stop and check with the sender another way before acting.

## Want a second pair of eyes?

We provide [IT support and consultancy](/our-services/it-support-consultancy) for organisations. [Contact us](/#get-in-touch) to talk about yours.`,
  },
  {
    title: 'Why posting regularly beats occasional big campaigns on social media',
    slug: 'social-media-management-consistent-posting',
    category: 'digital-marketing',
    excerpt: 'Consistency keeps your brand visible. Here is why a steady rhythm of useful posts usually works better than occasional bursts.',
    date: '2026-10-04T08:00:00.000Z',
    tags: ['social media', 'content', 'marketing'],
    focusKeyword: 'social media management',
    metaTitle: 'Social Media Management: Why Consistency Wins',
    metaDescription:
      'Social media management works best with consistency. Learn why a steady rhythm of useful posts keeps your brand visible and how to plan it.',
    body: `Good social media management is mostly about rhythm. Many organisations treat social media as something to do when there is big news. Then weeks go quiet — and the audience forgets. A steady rhythm of useful posts usually does more for a brand than the occasional burst.

## Why consistency works

People need to see a brand more than once before they remember it. Regular posts keep you visible, show that the organisation is active and give followers a reason to come back.

## Plan a simple rhythm

- Choose the platforms where your audience really is
- Agree how often you can post and stick to it
- Mix useful tips, updates about your work and behind-the-scenes content

## Make it sustainable

A realistic schedule you can keep is better than an ambitious one that fades after a month. Prepare content in batches so busy weeks do not break the rhythm.

## Let us handle it

Managing social media — planning, creating the content and posting it — is one of the things we do at BrightLink. Learn more about our [digital marketing service](/our-services/digital-marketing) or [get in touch](/#get-in-touch).`,
  },
]

export const STARTER_POSTS: BlogPostFull[] = STARTER_POSTS_RAW.map((p, i) => {
  const cat = STARTER_CATEGORIES_RAW.find((c) => c.slug === p.category)!
  const blocks = markdownToBlocks(p.body)
  return {
    id: `starter-post-${i}`,
    title: p.title,
    slug: p.slug,
    url: `/blog/${p.slug}`,
    excerpt: p.excerpt,
    image: null,
    category: { name: cat.name, slug: cat.slug, color: cat.color, icon: cat.icon },
    tags: p.tags,
    author: { name: 'BrightLink Team', role: '', photo: null },
    publishedAt: p.date,
    readingMinutes: readingMinutes(blocks),
    featured: Boolean(p.featured),
    seo: {
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      ogImage: null,
      focusKeyword: p.focusKeyword,
      canonicalUrl: '',
      noIndex: false,
    },
    blocks,
  }
})
