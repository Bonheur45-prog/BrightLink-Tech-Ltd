import { SmartLink } from '@/components/ui/SmartLink'

/** Server-rendered "Previous / Next" with numbered pages. `basePath` may already hold other query parameters. */
export function Pagination({ page, totalPages, basePath, query = {} }: { page: number; totalPages: number; basePath: string; query?: Record<string, string> }) {
  if (totalPages <= 1) return null
  const href = (n: number) => {
    const p = new URLSearchParams(query)
    if (n > 1) p.set('page', String(n))
    const qs = p.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }
  const num = (n: number) => (
    <li key={n}>
      <SmartLink
        href={href(n)}
        aria-current={n === page ? 'page' : undefined}
        aria-label={`Page ${n}`}
        className={`grid size-11 place-items-center rounded-full font-semibold transition ${n === page ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy ring-1 ring-slate-200 hover:ring-brand-blue/40'}`}
      >
        {n}
      </SmartLink>
    </li>
  )
  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-3">
      {page > 1 && (
        <SmartLink href={href(page - 1)} rel="prev" className="btn btn-outline">
          ← Newer
        </SmartLink>
      )}
      <ul className="flex flex-wrap items-center gap-2">{Array.from({ length: totalPages }, (_, i) => num(i + 1))}</ul>
      {page < totalPages && (
        <SmartLink href={href(page + 1)} rel="next" className="btn btn-outline">
          Older →
        </SmartLink>
      )}
    </nav>
  )
}
