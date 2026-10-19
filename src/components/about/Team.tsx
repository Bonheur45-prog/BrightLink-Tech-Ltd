import Image from 'next/image'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowRightIcon, MailIcon, SocialIcon, UsersIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { AboutData, TeamMember } from '@/lib/content/types'

const AVATAR_BG = [
  'bg-[linear-gradient(135deg,#00327f,#0057a3)]',
  'bg-[linear-gradient(135deg,#ff8e00,#ffc000)]',
  'bg-[linear-gradient(135deg,#009b9c,#047845)]',
  'bg-[linear-gradient(135deg,#001a45,#00327f)]',
]

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

function MemberCard({ m, index }: { m: TeamMember; index: number }) {
  return (
    <article className="group h-full overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15">
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-navy-deep">
        {m.photo ? (
          <Image
            src={m.photo.url}
            alt={m.photo.alt || `${m.name}, ${m.role}`}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 grid place-items-center ${AVATAR_BG[index % AVATAR_BG.length]}`}>
            <span aria-hidden className="font-display text-6xl font-bold text-white/90">
              {initials(m.name)}
            </span>
          </div>
        )}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-navy-deep/60 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold">{m.name}</h3>
        {m.role && <p className="mt-0.5 text-sm font-semibold text-brand-blue">{m.role}</p>}
        {m.bio && <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">{m.bio}</p>}
        {(m.email || m.linkedin) && (
          <div className="mt-5 flex gap-2.5">
            {m.email && (
              <a
                href={`mailto:${m.email}`}
                aria-label={`Email ${m.name}`}
                className="grid size-10 place-items-center rounded-full border border-slate-200 text-brand-navy transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <MailIcon width={18} height={18} />
              </a>
            )}
            {m.linkedin && (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${m.name} on LinkedIn`}
                className="grid size-10 place-items-center rounded-full border border-slate-200 text-brand-navy transition hover:border-brand-blue hover:bg-brand-blue hover:text-white"
              >
                <SocialIcon platform="linkedin" width={18} height={18} />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function Team({ data, members }: { data: AboutData['team']; members: TeamMember[] }) {
  if (!data.enabled) return null
  return (
    <section id="team" aria-labelledby="team-heading" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="container-x">
        <SectionHeading id="team-heading" align="center" eyebrow={data.eyebrow} title={data.heading} intro={data.intro} />

        {/* optional whole-team photo */}
        {data.groupPhoto && (
          <Reveal className="mt-12">
            <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-navy/15">
              <Image
                src={data.groupPhoto.url}
                alt={data.groupPhoto.alt || 'The BrightLink Technologies team'}
                fill
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        )}

        {members.length > 0 ? (
          <ul className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m, i) => (
              <Reveal as="li" key={m.id} delay={(i % 4) * 100}>
                <MemberCard m={m} index={i} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className="mx-auto mt-12 max-w-2xl">
            <div className="rounded-3xl border border-dashed border-brand-blue/30 bg-slate-50 p-10 text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-cool text-white">
                <UsersIcon width={30} height={30} />
              </span>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">{data.emptyMessage}</p>
            </div>
          </Reveal>
        )}

        {data.cta && (
          <Reveal className="mt-12 text-center">
            <SmartLink href={data.cta.url} newTab={data.cta.newTab} className="btn btn-primary">
              {data.cta.label}
              <ArrowRightIcon width={18} height={18} />
            </SmartLink>
          </Reveal>
        )}
      </div>
    </section>
  )
}
