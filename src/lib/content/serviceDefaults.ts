import { STARTER_SERVICES_RAW } from './defaults'
import type { IconCard, ServiceDetail, ServicesPageData } from './types'

/**
 * Starter content for the Our Services page and each service page. Written in plain, truthful terms: no prices,
 * statistics or testimonials. Everything is editable in /admin → Pages → Our Services Page and Content → Services.
 */

export const DEFAULT_SERVICES_PAGE: ServicesPageData = {
  banner: {
    eyebrow: 'Our Services',
    heading: 'Technology services that help your organisation grow',
    intro:
      'Software, websites, digital marketing and IT support from one Kigali-based team — practical solutions, delivered and supported by people you can talk to.',
    image: null,
  },
  listing: {
    eyebrow: 'What We Do',
    heading: 'Four services, one trusted partner',
    intro: 'Choose a service to see what is included, how we work and the projects we have delivered.',
  },
  why: {
    enabled: true,
    eyebrow: 'Why Choose BrightLink',
    heading: 'Technology you can rely on, people you can talk to',
    message:
      'We combine technical skill with plain, honest communication — and we stay with you after launch.',
    image: null,
    points: [
      { icon: 'target', title: 'Built around your goals', text: 'We start with your organisation and what you need to achieve, not with a template.' },
      { icon: 'users', title: 'One team for everything', text: 'Software, websites, marketing and IT support under one roof, so nothing falls between suppliers.' },
      { icon: 'shield', title: 'Support after launch', text: 'We stay available once your solution is live and keep it working for you.' },
      { icon: 'rocket', title: 'Real work, real clients', text: 'We build and run technology for organisations in Rwanda today.' },
    ],
  },
  showProjects: true,
  closing: {
    enabled: true,
    heading: 'Not sure which service you need?',
    text: 'Tell us what you are trying to achieve and we will point you in the right direction — no obligation.',
    primaryCta: { label: 'Talk to us', url: '/#get-in-touch', newTab: false },
    secondaryCta: { label: 'See our projects', url: '/our-projects', newTab: false },
  },
  seo: { metaTitle: '', metaDescription: '', ogImage: null },
}

const card = (icon: string, title: string, text: string): IconCard => ({ icon, title, text })
const cta = (label: string, url = '/#get-in-touch') => ({ label, url, newTab: false })

type Extra = Omit<ServiceDetail, 'id' | 'title' | 'slug' | 'url' | 'icon' | 'shortDescription' | 'features' | 'showOnHome'>

const EXTRA: Record<string, Extra> = {
  'software-development': {
    image: null,
    banner: {
      heading: 'Custom software built around the way you work',
      intro:
        'From inventory and employee management to property and hotel systems, we design and build software that replaces paperwork and gives you a clear view of your operations.',
      image: null,
    },
    overview: {
      eyebrow: 'Software Development',
      heading: 'Software that fits your organisation, not the other way around',
      highlightText: 'fits your organisation',
      paragraphs: [
        'Off-the-shelf tools rarely match how an organisation really runs. We build management systems and business applications around your own processes, so your team spends less time on admin and more on the work that matters.',
        'We have designed and delivered systems for inventory, employee management, property management and hotel operations — and we keep improving and supporting them after launch.',
      ],
      image: null,
    },
    offerings: {
      heading: 'What we build',
      intro: 'Systems and applications designed for the day-to-day reality of your organisation.',
      items: [
        card('code', 'Custom management systems', 'Tailor-made software for your own workflows, records and reporting.'),
        card('globe', 'Web applications', 'Secure, browser-based systems your team can use from any device.'),
        card('bar-chart', 'Inventory & stock control', 'Track stock levels and movements so you always know what you have (like our StockPro system).'),
        card('users', 'Employee & HR management', 'Keep staff records and HR processes organised and easy to follow (like our CrewTrack system).'),
        card('network', 'Property & hotel management', 'Manage properties, tenants, bookings and guests in one place (our PMS and HMS systems).'),
        card('rocket', 'Improvements & support', 'New features, fixes and ongoing support as your needs change.'),
      ],
    },
    why: {
      heading: 'Why choose BrightLink for your software',
      message: 'We build systems people actually use — and we stay to support them.',
      image: null,
      points: [
        card('target', 'Built around your process', 'We map how you work first, then design the system to match it.'),
        card('check', 'Tested before launch', 'Careful testing so the system is dependable from day one.'),
        card('users', 'Training and hand-over', 'We help your team get comfortable with the system.'),
        card('shield', 'Ongoing support', 'Improvements and help are available long after go-live.'),
      ],
    },
    process: {
      heading: 'How a software project runs',
      intro: 'A clear path from first idea to a system your team relies on.',
      steps: [
        { title: 'Discover', text: 'We learn how your organisation works and what the system must achieve.' },
        { title: 'Design', text: 'We agree scope, screens and timeline before building starts.' },
        { title: 'Build & test', text: 'We develop in clear stages, share progress and test thoroughly.' },
        { title: 'Launch & support', text: 'We take the system live, train your team and keep supporting it.' },
      ],
    },
    work: { heading: 'Systems we have built', intro: 'A selection of the software we have designed and delivered.' },
    clientsServed: [],
    clientsServedFallback: [],
    clientsHeading: '',
    faqs: [
      { question: 'What kind of software can you build?', answer: 'We build custom management systems and web applications — for example inventory, employee, property and hotel management. If you have a different process to digitise, tell us about it.' },
      { question: 'Will you support the system after it goes live?', answer: 'Yes. We offer ongoing improvements and support so the system keeps meeting your needs as your organisation changes.' },
      { question: 'How do we get started?', answer: 'Contact us by phone, email or the form on this page. We will arrange a conversation to understand your needs and suggest the best next step.' },
    ],
    cta: {
      heading: 'Have a system in mind?',
      text: 'Tell us about your process and we will discuss how software can make it simpler.',
      primaryCta: cta('Discuss your software project'),
      secondaryCta: cta('View our projects', '/our-projects'),
    },
    seo: {
      metaTitle: 'Software Development in Kigali, Rwanda',
      metaDescription:
        'Custom software for Rwandan organisations: inventory, employee, property and hotel management systems built and supported by BrightLink Technologies.',
      ogImage: null,
    },
  },

  'website-design': {
    image: null,
    banner: {
      heading: 'Professional websites that win trust and get found',
      intro:
        'Responsive, fast and SEO-ready websites for businesses and organisations — designed to look sharp and built to be easy for you to update.',
      image: null,
    },
    overview: {
      eyebrow: 'Website Design',
      heading: 'Your website is often the first thing customers see',
      highlightText: 'first thing customers see',
      paragraphs: [
        'We design and build websites that present your organisation clearly, work beautifully on phones, and are structured so search engines can understand them.',
        'We have built websites for organisations including SAGEC Ltd (sagecltd.com), PowerPlus Technology Ltd (powerplustechnology.rw), nsi-monique.com and gecoafrica.com.',
      ],
      image: null,
    },
    offerings: {
      heading: 'What is included',
      intro: 'Everything needed for a website you are proud to share.',
      items: [
        card('globe', 'Business & corporate websites', 'Clear, professional sites that explain what you do and make it easy to contact you.'),
        card('smartphone', 'Mobile-first, responsive design', 'Looks and works well on phones, tablets and desktops.'),
        card('bar-chart', 'SEO-ready structure', 'Clean structure, page titles and descriptions so you can be found on Google.'),
        card('code', 'Easy content updates', 'Edit your text, pictures and pages yourself — no developer needed for everyday changes.'),
        card('rocket', 'Fast and reliable', 'Built for speed and tested before launch.'),
        card('shield', 'Redesigns & improvements', 'Give an ageing website a fresh look and better results.'),
      ],
    },
    why: {
      heading: 'Why choose BrightLink for your website',
      message: 'A website should work for your organisation long after launch day.',
      image: null,
      points: [
        card('target', 'Designed around your brand', 'Your colours, your logo, your voice — not a generic template.'),
        card('bar-chart', 'Built to be found', 'SEO is part of the build, not an afterthought.'),
        card('users', 'You stay in control', 'Update your content easily whenever you need to.'),
        card('shield', 'Support when you need it', 'We are on hand after launch for changes and improvements.'),
      ],
    },
    process: {
      heading: 'How a website project runs',
      intro: 'Simple steps, clear communication.',
      steps: [
        { title: 'Plan', text: 'We agree your goals, pages and content.' },
        { title: 'Design', text: 'You review the look and feel before we build.' },
        { title: 'Build & test', text: 'We build the site and test it on real devices.' },
        { title: 'Launch & support', text: 'We take it live and remain available for updates.' },
      ],
    },
    work: { heading: 'Websites we have built', intro: 'Live websites designed and delivered by our team.' },
    clientsServed: [],
    clientsServedFallback: [],
    clientsHeading: '',
    faqs: [
      { question: 'Will my website work on mobile phones?', answer: 'Yes. Every website we build is designed mobile-first and tested on phones, tablets and computers.' },
      { question: 'Can I update the website myself?', answer: 'Yes. We build websites so you can edit text, pictures and pages yourself, and we are available if you need help.' },
      { question: 'Will people be able to find my website on Google?', answer: 'We build every site with an SEO-ready structure, which gives search engines the best chance of understanding it. Good results also depend on your content and ongoing work, which our digital marketing service can help with.' },
    ],
    cta: {
      heading: 'Ready for a website you are proud of?',
      text: 'Tell us about your organisation and we will suggest the right website for it.',
      primaryCta: cta('Start your website'),
      secondaryCta: cta('See our work', '/our-projects'),
    },
    seo: {
      metaTitle: 'Website Design in Kigali, Rwanda',
      metaDescription:
        'Professional, responsive and SEO-ready website design for businesses in Rwanda. See the websites BrightLink Technologies has built.',
      ogImage: null,
    },
  },

  'digital-marketing': {
    image: null,
    banner: {
      heading: 'Digital marketing that keeps your brand visible',
      intro:
        'We manage your social media, create the content and post it for you — so your organisation stays active online and reaches the customers who are looking for you.',
      image: null,
    },
    overview: {
      eyebrow: 'Digital Marketing',
      heading: 'Stay active online without taking on the workload',
      highlightText: 'without taking on the workload',
      paragraphs: [
        'Consistent, good-looking content is what keeps an organisation visible on social media. We take that work off your hands: we plan and create the content, post it, and manage the accounts day to day.',
        'We currently manage the social media of SAGEC Ltd and PowerPlus Technology Ltd, and we can also support you with search engine optimisation.',
      ],
      image: null,
    },
    offerings: {
      heading: 'What we do for you',
      intro: 'Hands-on marketing support, from content to reporting.',
      items: [
        card('megaphone', 'Social media management', 'We run your accounts so they stay active and on-brand.'),
        card('code', 'Content creation', 'Posts, graphics and messages created for your audience.'),
        card('rocket', 'Posting & scheduling', 'Content published regularly, so you never have to remember to post.'),
        card('bar-chart', 'Search engine optimisation', 'Help your website appear when customers search for what you offer.'),
        card('target', 'Campaigns', 'Focused campaigns around a launch, offer or event.'),
        card('users', 'Audience engagement', 'Keep your followers informed and connected to your brand.'),
      ],
    },
    why: {
      heading: 'Why choose BrightLink for your marketing',
      message: 'We already run social media for real organisations — consistently.',
      image: null,
      points: [
        card('check', 'Done for you', 'We handle content and posting, so you can focus on your work.'),
        card('target', 'On-brand content', 'Everything we publish reflects your organisation and audience.'),
        card('bar-chart', 'Joined up with your website', 'Marketing, website and technology planned together.'),
        card('users', 'Regular communication', 'You always know what is being posted and why.'),
      ],
    },
    process: {
      heading: 'How we manage your marketing',
      intro: 'A steady rhythm that keeps your brand visible.',
      steps: [
        { title: 'Understand', text: 'We learn about your brand, audience and goals.' },
        { title: 'Plan', text: 'We agree the platforms and the type of content to publish.' },
        { title: 'Create & post', text: 'We create the content and publish it on schedule.' },
        { title: 'Review', text: 'We look at what is working and keep improving.' },
      ],
    },
    work: { heading: 'Marketing work', intro: 'Marketing projects and campaigns we have delivered.' },
    clientsServed: [],
    clientsServedFallback: [
      { name: 'SAGEC Ltd', note: 'Social media management — content creation and posting' },
      { name: 'PowerPlus Technology Ltd', note: 'Social media management — content creation and posting' },
    ],
    clientsHeading: 'Organisations whose social media we manage',
    faqs: [
      { question: 'Do you create the content as well as post it?', answer: 'Yes. We create the content — posts and graphics — and publish it on your accounts as part of managing your social media.' },
      { question: 'Which platforms do you manage?', answer: 'We agree the right platforms for your audience together, then manage them for you.' },
      { question: 'Can you also help my website get found?', answer: 'Yes. We offer search engine optimisation, and our website design service builds SEO into every site.' },
    ],
    cta: {
      heading: 'Let us look after your social media',
      text: 'Tell us about your brand and we will suggest a simple plan to keep you visible online.',
      primaryCta: cta('Plan your marketing'),
      secondaryCta: cta('See our services', '/our-services'),
    },
    seo: {
      metaTitle: 'Digital Marketing & Social Media Management in Rwanda',
      metaDescription:
        'BrightLink Technologies manages social media, creates content and posts for organisations in Rwanda, and helps websites get found with SEO.',
      ogImage: null,
    },
  },

  'it-support-consultancy': {
    image: null,
    banner: {
      heading: 'IT support and advice you can count on',
      intro:
        'Practical, responsive IT support and expert consultancy that keeps your technology running and aligned with your goals.',
      image: null,
    },
    overview: {
      eyebrow: 'IT Support & Consultancy',
      heading: 'Keep your team working while we look after the technology',
      highlightText: 'we look after the technology',
      paragraphs: [
        'When computers, networks or systems fail, work stops. We provide dependable IT support and clear, jargon-free advice so problems are fixed quickly and technology decisions are made with confidence.',
        'We provide IT support to organisations including Minimekix Forex, SAGEC Ltd and NSI Group.',
      ],
      image: null,
    },
    offerings: {
      heading: 'How we support you',
      intro: 'Support and consultancy for organisations of every size.',
      items: [
        card('headset', 'Troubleshooting & maintenance', 'Fast help when something stops working, plus regular upkeep to prevent problems.'),
        card('network', 'Equipment & network setup', 'Computers, networks and office technology set up properly from the start.'),
        card('lightbulb', 'Technology consultancy', 'Independent advice on what to buy, build or change.'),
        card('shield', 'Planning & best practice', 'Technology plans aligned with your goals and budget.'),
        card('users', 'Staff support', 'Help for your team when they need it.'),
        card('clock', 'Ongoing support', 'A dependable contact when you need IT help.'),
      ],
    },
    why: {
      heading: 'Why choose BrightLink for IT support',
      message: 'Real people, quick responses, plain explanations.',
      image: null,
      points: [
        card('headset', 'A team you can reach', 'Call or email and speak to someone who knows your setup.'),
        card('check', 'Practical fixes', 'We solve the problem, not just the symptom.'),
        card('lightbulb', 'Plain-language advice', 'No jargon — just clear recommendations.'),
        card('code', 'Technology all under one roof', 'Software, websites and support from the same team.'),
      ],
    },
    process: {
      heading: 'How our support works',
      intro: 'Simple and predictable.',
      steps: [
        { title: 'Reach out', text: 'Contact us by phone or email.' },
        { title: 'Diagnose', text: 'We understand the issue and what it affects.' },
        { title: 'Fix', text: 'We resolve it and confirm everything works.' },
        { title: 'Prevent', text: 'We advise how to avoid it happening again.' },
      ],
    },
    work: { heading: 'IT support projects', intro: 'Support and consultancy projects we have delivered.' },
    clientsServed: [],
    clientsServedFallback: [
      { name: 'Minimekix Forex', note: 'IT support' },
      { name: 'SAGEC Ltd', note: 'IT support' },
      { name: 'NSI Group', note: 'IT support' },
    ],
    clientsHeading: 'Organisations we provide IT support for',
    faqs: [
      { question: 'What does IT support include?', answer: 'Troubleshooting, maintenance, equipment and network setup, and advice on technology decisions. Tell us what you need and we will agree the right support.' },
      { question: 'Can you advise us before we buy equipment or software?', answer: 'Yes. Our consultancy gives you independent, practical advice so you invest in what really helps.' },
      { question: 'How do I get help?', answer: 'Call or email us using the contact details on this page and we will take it from there.' },
    ],
    cta: {
      heading: 'Need dependable IT support?',
      text: 'Get in touch and we will discuss how we can keep your technology running smoothly.',
      primaryCta: cta('Get IT support'),
      secondaryCta: cta('See our services', '/our-services'),
    },
    seo: {
      metaTitle: 'IT Support & Consultancy in Kigali, Rwanda',
      metaDescription:
        'Dependable IT support, equipment and network setup, and technology consultancy for organisations in Rwanda from BrightLink Technologies.',
      ogImage: null,
    },
  },
}

/** Starter detail for a service slug (also used to fill any blank fields of a service saved in the CMS). */
export function starterServiceExtra(slug: string): Extra {
  return (
    EXTRA[slug] ?? {
      banner: { heading: '', intro: '', image: null },
      overview: { eyebrow: 'Our Services', heading: '', highlightText: '', paragraphs: [], image: null },
      offerings: { heading: 'What is included', intro: '', items: [] },
      why: null,
      process: { heading: 'How we work', intro: '', steps: [] },
      work: { heading: 'Our work', intro: '' },
      clientsServed: [],
      clientsServedFallback: [],
      clientsHeading: 'Organisations we work with',
      faqs: [],
      cta: {
        heading: 'Ready to talk?',
        text: 'Tell us what you need and we will get back to you.',
        primaryCta: cta('Get in touch'),
        secondaryCta: cta('See our projects', '/our-projects'),
      },
      seo: { metaTitle: '', metaDescription: '', ogImage: null },
    }
  )
}

export const STARTER_SERVICE_SLUGS = STARTER_SERVICES_RAW.map((s) => s.slug)
