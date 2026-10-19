import Image from 'next/image'
import type { ReactNode } from 'react'

import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { ClientItem, ClientsData } from '@/lib/content/types'

function Tile({ client, children }: { client: ClientItem; children: ReactNode }) {
  const base =
    'group flex h-28 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-xl hover:shadow-brand-navy/10'
  return client.website ? (
    <a href={client.website} target="_blank" rel="noopener noreferrer" aria-label={`${client.name} (opens their website)`} className={base}>
      {children}
    </a>
  ) : (
    <div className={base}>{children}</div>
  )
}

export function Clients({ data, clients }: { data: ClientsData; clients: ClientItem[] }) {
  if (!data.enabled || clients.length === 0) return null

  return (
    <section id="clients" aria-labelledby="clients-heading" className="bg-slate-50 py-20 lg:py-24">
      <div className="container-x">
        <SectionHeading
          id="clients-heading"
          align="center"
          eyebrow={data.eyebrow}
          title={data.heading}
          intro={data.intro}
        />
        <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-5">
          {clients.map((client, i) => (
            <Reveal as="li" key={client.id} delay={(i % 6) * 70} className="w-[calc(50%-0.625rem)] sm:w-[calc(33.333%-0.85rem)] lg:w-[calc(25%-0.95rem)]">
              <Tile client={client}>
                {client.logo ? (
                  <Image
                    src={client.logo.url}
                    alt={client.logo.alt || `${client.name} logo`}
                    width={client.logo.width ?? 240}
                    height={client.logo.height ?? 120}
                    sizes="240px"
                    className="max-h-16 w-auto max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="text-center font-display text-lg font-semibold leading-tight text-brand-navy/80 transition group-hover:text-brand-navy">
                    {client.name}
                  </span>
                )}
              </Tile>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
