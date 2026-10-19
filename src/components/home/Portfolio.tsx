import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { PortfolioData, ProjectItem } from '@/lib/content/types'

const PLACEHOLDER_BG = [
  'bg-[linear-gradient(135deg,#001a45,#00327f_60%,#0057a3)]',
  'bg-[linear-gradient(135deg,#00327f,#0057a3_55%,#009b9c)]',
  'bg-[linear-gradient(135deg,#0057a3,#009b9c_60%,#047845)]',
  'bg-[linear-gradient(135deg,#001a45,#00327f_50%,#ff8e00)]',
]

/** Shown until a screenshot is uploaded: brand art, never a broken image. */
function Placeholder({ index }: { index: number }) {
  return (
    <div className={`absolute inset-0 ${PLACEHOLDER_BG[index % PLACEHOLDER_BG.length]}`}>
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-brand-yellow/25 blur-2xl" />
      <Image
        src="/images/brand/brightlink-mark.png"
        alt=""
        width={212}
        height={280}
        aria-hidden
        className="absolute -bottom-6 -right-4 h-[85%] w-auto opacity-[0.14]"
      />
    </div>
  )
}

export function Portfolio({ data, projects }: { data: PortfolioData; projects: ProjectItem[] }) {
  const items = projects.filter((p) => p.showOnHome && p.status === 'completed').slice(0, data.limit)
  if (!data.enabled || items.length === 0) return null

  return (
    <section id="portfolio" aria-labelledby="portfolio-heading" className="bg-white py-20 lg:py-28">
      <div className="container-x">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading id="portfolio-heading" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />
          {data.viewAll && (
            <Reveal className="hidden shrink-0 sm:block">
              <SmartLink href={data.viewAll.url} newTab={data.viewAll.newTab} className="btn btn-outline">
                {data.viewAll.label}
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            </Reveal>
          )}
        </div>

        <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project, i) => (
            <Reveal as="li" key={project.id} delay={(i % 3) * 110}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy-deep">
                  {project.image ? (
                    <Image
                      src={project.image.url}
                      alt={project.image.alt || `${project.title} — project screenshot`}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <Placeholder index={i} />
                  )}
                  {project.category && (
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-navy-deep shadow">
                      {project.category}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                  {project.shortDescription && (
                    <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-slate-600">{project.shortDescription}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-4 pt-5">
                    <SmartLink
                      href={project.url}
                      aria-label={`View project: ${project.title}`}
                      className="inline-flex items-center gap-2 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
                    >
                      View project
                      <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
                    </SmartLink>
                    {project.externalUrl && (
                      <a
                        href={project.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-navy"
                      >
                        Visit site
                        <ArrowUpRightIcon width={16} height={16} />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        {data.viewAll && (
          <Reveal className="mt-12 text-center sm:hidden">
            <SmartLink href={data.viewAll.url} newTab={data.viewAll.newTab} className="btn btn-outline">
              {data.viewAll.label}
            </SmartLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}
