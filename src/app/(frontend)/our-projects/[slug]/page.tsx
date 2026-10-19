import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ClosingCta } from '@/components/about/ClosingCta'
import { ProgressBar } from '@/components/projects/ProgressBar'
import { ProjectCard, StatusBadge } from '@/components/projects/ProjectCard'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import { getProjectBySlug, getProjects, getSiteSettings } from '@/lib/content'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [settings, project] = await Promise.all([getSiteSettings(), getProjectBySlug(slug)])
  if (!project) return { title: 'Project not found', robots: { index: false } }
  return buildMetadata({
    settings,
    title: project.seo.metaTitle || project.title,
    description: project.seo.metaDescription || project.shortDescription,
    image: project.seo.ogImage ?? project.image,
    path: project.url,
  })
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const all = await getProjects(100)
  const related = [
    ...all.filter((p) => p.slug !== slug && p.serviceSlug && p.serviceSlug === project.serviceSlug),
    ...all.filter((p) => p.slug !== slug && (!p.serviceSlug || p.serviceSlug !== project.serviceSlug)),
  ].slice(0, 3)
  const inProgress = project.status === 'in-progress'

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      '@id': `${absoluteUrl(project.url)}#project`,
      name: project.title,
      description: project.seo.metaDescription || project.shortDescription,
      url: absoluteUrl(project.url),
      creator: { '@id': `${getServerUrl()}/#organization` },
      ...(project.image ? { image: absoluteUrl(project.image.url) } : {}),
      ...(project.externalUrl ? { sameAs: [project.externalUrl] } : {}),
      ...(project.category ? { genre: project.category } : {}),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Our Projects', path: '/our-projects' },
      { name: project.title, path: project.url },
    ]),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={[project.category, inProgress ? 'In progress' : 'Completed'].filter(Boolean).join(' · ')}
        title={project.title}
        intro={project.shortDescription}
        image={null}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Our Projects', href: '/our-projects' }, { label: project.title }]}
      />

      <section id="overview" aria-labelledby="overview-heading" className="bg-white py-20 lg:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <SectionHeading id="overview-heading" eyebrow="About this project" title={`What is ${project.title}?`} />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-slate-600">
              {project.paragraphs.map((t, i) => (
                <Reveal key={i} delay={120 + i * 80}>
                  <p>{t}</p>
                </Reveal>
              ))}
            </div>
            {project.highlights.length > 0 && (
              <ul className="mt-8 grid gap-3.5 sm:grid-cols-2">
                {project.highlights.map((h, i) => (
                  <Reveal as="li" key={h} delay={200 + i * 70} className="flex gap-3">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-brand-warm text-brand-navy-deep">
                      <CheckIcon width={16} height={16} strokeWidth={2.4} />
                    </span>
                    <span className="font-medium text-brand-navy-deep">{h}</span>
                  </Reveal>
                ))}
              </ul>
            )}
          </div>

          {/* facts + main picture */}
          <div className="lg:col-span-5">
            <Reveal from="right">
              <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-brand-navy/15 ring-1 ring-brand-navy/10">
                <div className="relative aspect-[16/10] bg-brand-navy-deep">
                  {project.image ? (
                    <Image src={project.image.url} alt={project.image.alt || `${project.title} — project screenshot`} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#001a45,#00327f_60%,#0057a3)]">
                      <div className="absolute -right-8 -top-8 size-44 rounded-full bg-brand-yellow/25 blur-2xl" />
                      <Image src="/images/brand/brightlink-mark.png" alt="" width={212} height={280} aria-hidden className="absolute -bottom-6 -right-4 h-[85%] w-auto opacity-[0.16]" />
                    </div>
                  )}
                </div>
                <dl className="space-y-4 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-slate-500">Status</dt>
                    <dd>
                      <StatusBadge status={project.status} />
                    </dd>
                  </div>
                  {inProgress && (
                    <div>
                      <ProgressBar value={project.progress} label="Progress so far" large />
                    </div>
                  )}
                  {project.category && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-slate-500">Type</dt>
                      <dd className="font-semibold text-brand-navy-deep">{project.category}</dd>
                    </div>
                  )}
                  {project.serviceSlug && project.serviceTitle && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-sm text-slate-500">Service</dt>
                      <dd>
                        <SmartLink href={`/our-services/${project.serviceSlug}`} className="font-semibold text-brand-blue hover:text-brand-navy">
                          {project.serviceTitle}
                        </SmartLink>
                      </dd>
                    </div>
                  )}
                  {project.externalUrl && (
                    <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full justify-center">
                      Visit the live site
                      <ArrowUpRightIcon width={18} height={18} />
                    </a>
                  )}
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section id="gallery" aria-labelledby="gallery-heading" className="bg-slate-50 py-20 lg:py-24">
          <div className="container-x">
            <SectionHeading id="gallery-heading" align="center" eyebrow="Gallery" title={`${project.title} in pictures`} />
            <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {project.gallery.map((g, i) => (
                <Reveal as="li" key={`${g.url}-${i}`} delay={(i % 3) * 100}>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-brand-navy-deep shadow-lg shadow-brand-navy/10">
                    <Image src={g.url} alt={g.alt || `${project.title} screenshot ${i + 1}`} fill sizes="(min-width: 1024px) 380px, 50vw" className="object-cover" />
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-slate-50 py-20 lg:py-24">
          <div className="container-x">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading id="related-heading" title="More of our projects" />
              <SmartLink href="/our-projects" className="btn btn-outline shrink-0">
                View all projects
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            </div>
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 110}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingCta
        data={{
          enabled: true,
          heading: 'Want a project like this?',
          text: 'Tell us what you need and we will discuss the best way to build it.',
          primaryCta: { label: 'Start a project', url: '/#get-in-touch', newTab: false },
          secondaryCta: { label: 'Explore our services', url: '/our-services', newTab: false },
        }}
      />
    </>
  )
}
