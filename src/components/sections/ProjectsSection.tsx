import Image from 'next/image'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectsExplorer } from '@/components/projects/ProjectsExplorer'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SmartLink } from '@/components/ui/SmartLink'
import { getProjects } from '@/lib/content'
import type { ProjectItem } from '@/lib/content/types'
import { SectionShell, link, muted, num, str, strong, text, type SectionProps } from './shared'

function pick(all: ProjectItem[], filter: string, serviceSlug?: string): ProjectItem[] {
  switch (filter) {
    case 'completed':
      return all.filter((p) => p.status === 'completed')
    case 'inProgress':
      return all.filter((p) => p.status === 'in-progress')
    case 'home':
      return all.filter((p) => p.showOnHome && p.status === 'completed')
    case 'service':
      // outside a service page there is no "this service": nothing is shown rather than everything
      return serviceSlug ? all.filter((p) => p.serviceSlug === serviceSlug) : []
    default:
      return all
  }
}

/** Published projects (edited under Projects): grid, grid with filters, or list. */
export async function ProjectsSection({ section, ctx }: SectionProps) {
  const { locale, t } = ctx
  const d = section.data
  const all = await getProjects(200)
  const filter = str(d.filter, 'all')
  const projects = pick(all, filter, ctx.page.serviceSlug).slice(0, num(d.limit, 6))
  if (!projects.length) return null
  const heading = text(d.heading, locale)
  const intro = text(d.intro, locale)
  const viewAll = link(d.viewAll, locale)

  // Grid with filters showing all projects: the Our Projects page body (completed and in-progress groups).
  if (section.variant === 'explorer' && filter === 'all') {
    return (
      <div id={ctx.anchor}>
        <ProjectsExplorer
          completed={projects.filter((p) => p.status === 'completed')}
          inProgress={projects.filter((p) => p.status === 'in-progress')}
          page={{
            completed: { heading: heading || t.completed, intro },
            inProgress: { heading: text(d.secondHeading, locale) || t.inProgress, intro: text(d.secondIntro, locale) },
          }}
        />
      </div>
    )
  }

  const id = `${ctx.anchor}-heading`
  return (
    <SectionShell section={section} ctx={ctx} labelledBy={heading ? id : undefined}>
      {(tone) => (
        <div className="container-x">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {heading && <SectionHeading id={id} tone={tone} eyebrow={text(d.eyebrow, locale)} title={heading} intro={intro} />}
            {viewAll && (
              <Reveal className="shrink-0">
                <SmartLink href={viewAll.url} newTab={viewAll.newTab} className={tone === 'dark' ? 'btn btn-ghost' : 'btn btn-outline'}>
                  {viewAll.label}
                  <ArrowRightIcon width={18} height={18} />
                </SmartLink>
              </Reveal>
            )}
          </div>

          {section.variant === 'list' ? (
            <ul className="mt-12 grid gap-5 lg:grid-cols-2">
              {projects.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 2) * 100}>
                  <SmartLink
                    href={p.url}
                    className={`group flex h-full gap-5 overflow-hidden p-4 ${tone === 'dark' ? 'rounded-2xl border border-white/15 bg-white/10 transition hover:bg-white/15' : 'rounded-2xl bg-white shadow-lg shadow-brand-navy/5 ring-1 ring-brand-navy/5 transition hover:-translate-y-1 hover:shadow-xl'}`}
                  >
                    <span className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-xl bg-brand-navy-deep sm:w-40">
                      {p.image ? (
                        <Image src={p.image.url} alt={p.image.alt || p.title} fill sizes="160px" className="object-cover transition duration-500 group-hover:scale-105" />
                      ) : (
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,#001a45,#00327f_60%,#0057a3)]" />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col justify-center">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${tone === 'dark' ? 'text-brand-yellow' : 'text-brand-blue'}`}>
                        {p.status === 'completed' ? t.completed : `${t.inProgress} · ${p.progress}%`}
                      </span>
                      <span className={`mt-1 font-display text-lg font-semibold ${strong(tone)}`}>{p.title}</span>
                      {p.shortDescription && <span className={`mt-1 line-clamp-2 text-sm ${muted(tone)}`}>{p.shortDescription}</span>}
                    </span>
                  </SmartLink>
                </Reveal>
              ))}
            </ul>
          ) : (
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 110}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      )}
    </SectionShell>
  )
}
