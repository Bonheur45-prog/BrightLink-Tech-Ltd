import Image from 'next/image'

import { ArrowRightIcon, ArrowUpRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ProjectItem } from '@/lib/content/types'
import { ProgressBar } from './ProgressBar'

const BG = [
  'bg-[linear-gradient(135deg,#001a45,#00327f_60%,#0057a3)]',
  'bg-[linear-gradient(135deg,#00327f,#0057a3_55%,#009b9c)]',
  'bg-[linear-gradient(135deg,#0057a3,#009b9c_60%,#047845)]',
  'bg-[linear-gradient(135deg,#001a45,#00327f_50%,#ff8e00)]',
]

export function StatusBadge({ status }: { status: ProjectItem['status'] }) {
  return status === 'completed' ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/20">
      <span aria-hidden className="size-1.5 rounded-full bg-emerald-600" />
      Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/25">
      <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-amber-500" />
      In progress
    </span>
  )
}

/** One project card: picture space, status, short intro, progress bar when still being built, and links. */
export function ProjectCard({ project: p, index = 0 }: { project: ProjectItem; index?: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-navy-deep">
        {p.image ? (
          <Image
            src={p.image.url}
            alt={p.image.alt || `${p.title} — project screenshot`}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 ${BG[index % BG.length]}`}>
            <div className="absolute -right-8 -top-8 size-40 rounded-full bg-brand-yellow/25 blur-2xl" />
            <Image src="/images/brand/brightlink-mark.png" alt="" width={212} height={280} aria-hidden className="absolute -bottom-6 -right-4 h-[85%] w-auto opacity-[0.14]" />
          </div>
        )}
        {p.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-navy-deep shadow">
            {p.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div>
          <StatusBadge status={p.status} />
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold">{p.title}</h3>
        {p.shortDescription && <p className="mt-2 line-clamp-3 flex-1 text-[0.95rem] leading-relaxed text-slate-600">{p.shortDescription}</p>}
        {p.status === 'in-progress' && (
          <div className="mt-4">
            <ProgressBar value={p.progress} label="Progress" />
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <SmartLink
            href={p.url}
            aria-label={`View details: ${p.title}`}
            className="inline-flex items-center gap-2 font-semibold text-brand-blue after:absolute after:inset-0 hover:text-brand-navy"
          >
            View details
            <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
          </SmartLink>
          {p.externalUrl && (
            <a
              href={p.externalUrl}
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
  )
}
