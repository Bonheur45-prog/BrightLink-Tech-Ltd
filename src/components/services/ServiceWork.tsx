import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ProjectItem, ServiceClient, ServiceDetail } from '@/lib/content/types'

function ClientTile({ c }: { c: ServiceClient }) {
  const cls =
    'group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-navy/10'
  const body = (
    <>
      <div className="flex h-16 items-center">
        {c.logo ? (
          <Image
            src={c.logo.url}
            alt={c.logo.alt || `${c.name} logo`}
            width={c.logo.width ?? 240}
            height={c.logo.height ?? 120}
            sizes="240px"
            className="max-h-14 w-auto max-w-full object-contain"
          />
        ) : (
          <span className="font-display text-lg font-semibold leading-tight text-brand-navy">{c.name}</span>
        )}
      </div>
      {c.logo && <p className="text-sm font-semibold text-brand-navy-deep">{c.name}</p>}
      {c.note && <p className="text-sm leading-snug text-slate-500">{c.note}</p>}
    </>
  )
  return c.website ? (
    <a href={c.website} target="_blank" rel="noopener noreferrer" aria-label={`${c.name} (opens their website)`} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  )
}

/** Projects tagged with this service, plus the clients we serve with it (for work without a project page). */
export function ServiceWork({ service, projects }: { service: ServiceDetail; projects: ProjectItem[] }) {
  const clients = service.clientsServed
  if (projects.length === 0 && clients.length === 0) return null
  return (
    <section id="our-work" aria-labelledby="work-heading" className="bg-white py-20 lg:py-28">
      <div className="container-x">
        {projects.length > 0 && (
          <>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading id="work-heading" eyebrow="Our Work" title={service.work.heading} intro={service.work.intro} />
              <Reveal className="shrink-0">
                <SmartLink href="/our-projects" className="btn btn-outline">
                  View all projects
                  <ArrowRightIcon width={18} height={18} />
                </SmartLink>
              </Reveal>
            </div>
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 110}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </ul>
          </>
        )}
        {clients.length > 0 && (
          <div className={projects.length > 0 ? 'mt-20' : ''}>
            <SectionHeading
              id={projects.length > 0 ? undefined : 'work-heading'}
              align="center"
              eyebrow={projects.length > 0 ? undefined : 'Our Work'}
              title={service.clientsHeading || 'Organisations we work with'}
            />
            <ul className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-5">
              {clients.map((c, i) => (
                <Reveal as="li" key={`${c.name}-${i}`} delay={(i % 3) * 90} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.85rem)]">
                  <ClientTile c={c} />
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
