import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ChevronDownIcon } from '@/components/ui/Icons'

/** Accordion built on native <details>: works without JavaScript and the answers stay readable to search engines. */
export function Faq({ faqs, title }: { faqs: { question: string; answer: string }[]; title: string }) {
  if (faqs.length === 0) return null
  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-slate-50 py-20 lg:py-28">
      <div className="container-x max-w-3xl">
        <SectionHeading id="faq-heading" align="center" eyebrow="FAQ" title={title} />
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.question} delay={(i % 4) * 70}>
              <details className="group rounded-2xl bg-white shadow-md shadow-brand-navy/5 ring-1 ring-brand-navy/5 open:ring-brand-blue/30">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-lg font-semibold text-brand-navy-deep [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <ChevronDownIcon width={20} height={20} className="shrink-0 text-brand-blue transition group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 leading-relaxed text-slate-600">{f.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
