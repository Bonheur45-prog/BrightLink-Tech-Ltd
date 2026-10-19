'use client'

import { useState } from 'react'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, CheckIcon, ClockIcon, RocketIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { ProjectItem, ProjectsPageData } from '@/lib/content/types'
import { ProjectCard } from './ProjectCard'

type Filter = 'all' | 'completed' | 'in-progress'

/**
 * The body of the Our Projects page. Both groups are always in the HTML (good for search engines and
 * for visitors without JavaScript); the tabs only narrow the view.
 */
export function ProjectsExplorer({
  completed,
  inProgress,
  page,
}: {
  completed: ProjectItem[]
  inProgress: ProjectItem[]
  page: Pick<ProjectsPageData, 'completed' | 'inProgress'>
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: 'all', label: 'All projects', count: completed.length + inProgress.length },
    { id: 'completed', label: 'Completed', count: completed.length },
    { id: 'in-progress', label: 'In progress', count: inProgress.length },
  ].filter((t) => t.id === 'all' || t.count > 0) as { id: Filter; label: string; count: number }[]

  const showCompleted = filter !== 'in-progress' && completed.length > 0
  const showInProgress = filter !== 'completed' && inProgress.length > 0

  const guide = [
    { id: 'completed', icon: <CheckIcon width={26} height={26} strokeWidth={2.4} />, n: completed.length, title: 'Completed projects', text: 'Delivered and in use', tone: 'bg-gradient-to-br from-brand-teal to-brand-green text-white' },
    { id: 'in-progress', icon: <ClockIcon width={26} height={26} />, n: inProgress.length, title: 'Projects in progress', text: 'Being built right now', tone: 'bg-brand-warm text-brand-navy-deep' },
  ].filter((g) => g.n > 0)

  return (
    <>
      {/* first-look guide: what is on this page */}
      <section aria-label="What is on this page" className="relative z-10 -mt-10 pb-6">
        <div className="container-x">
          <ul className="grid gap-4 sm:grid-cols-3">
            {guide.map((g, i) => (
              <Reveal as="li" key={g.id} delay={i * 90}>
                <a
                  href={`#${g.id}`}
                  onClick={() => setFilter('all')}
                  className="group flex h-full items-center gap-4 rounded-2xl bg-white p-5 shadow-xl shadow-brand-navy/10 ring-1 ring-brand-navy/5 transition hover:-translate-y-1"
                >
                  <span className={`grid size-14 shrink-0 place-items-center rounded-2xl ${g.tone}`}>{g.icon}</span>
                  <span className="flex-1">
                    <span className="block font-display text-3xl font-bold leading-none text-brand-navy-deep">{g.n}</span>
                    <span className="mt-1 block font-semibold text-brand-navy-deep">{g.title}</span>
                    <span className="block text-sm text-slate-500">{g.text}</span>
                  </span>
                  <ArrowRightIcon width={18} height={18} className="text-brand-blue transition group-hover:translate-x-1" />
                </a>
              </Reveal>
            ))}
            <Reveal as="li" delay={guide.length * 90}>
              <SmartLink
                href="/#get-in-touch"
                className="group flex h-full items-center gap-4 rounded-2xl bg-brand-navy-deep p-5 text-white shadow-xl shadow-brand-navy/20 transition hover:-translate-y-1"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-cool text-white">
                  <RocketIcon width={26} height={26} />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">Want something like this?</span>
                  <span className="block text-sm text-white/70">Start a conversation with us</span>
                </span>
                <ArrowRightIcon width={18} height={18} className="text-brand-yellow transition group-hover:translate-x-1" />
              </SmartLink>
            </Reveal>
          </ul>
        </div>
      </section>

      {/* filter tabs */}
      {tabs.length > 2 && (
        <div className="container-x pt-10">
          <div role="group" aria-label="Filter projects" className="flex flex-wrap justify-center gap-2.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  filter === t.id
                    ? 'bg-brand-navy text-white shadow-lg shadow-brand-navy/25'
                    : 'bg-white text-brand-navy ring-1 ring-slate-200 hover:ring-brand-blue/40'
                }`}
              >
                {t.label} <span className={filter === t.id ? 'text-white/70' : 'text-slate-400'}>({t.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <section id="completed" hidden={!showCompleted} aria-labelledby="completed-heading" className="scroll-mt-24 bg-white py-16 lg:py-24">
          <div className="container-x">
            <SectionHeading id="completed-heading" eyebrow="Completed" title={page.completed.heading} intro={page.completed.intro} />
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 110}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {inProgress.length > 0 && (
        <section id="in-progress" hidden={!showInProgress} aria-labelledby="in-progress-heading" className="scroll-mt-24 bg-slate-50 py-16 lg:py-24">
          <div className="container-x">
            <SectionHeading id="in-progress-heading" eyebrow="In progress" title={page.inProgress.heading} intro={page.inProgress.intro} />
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {inProgress.map((p, i) => (
                <Reveal as="li" key={p.id} delay={(i % 3) * 110}>
                  <ProjectCard project={p} index={i + 2} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  )
}
