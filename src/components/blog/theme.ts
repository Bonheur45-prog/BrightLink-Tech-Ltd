import type { CategoryColor } from '@/lib/content/types'

/** Full class names are written out so Tailwind can find them. */
export const CAT: Record<CategoryColor, { chip: string; tile: string; art: string; text: string; ring: string }> = {
  orange: {
    chip: 'bg-orange-50 text-orange-800 ring-orange-600/20',
    tile: 'bg-gradient-to-br from-brand-orange to-brand-yellow text-brand-navy-deep',
    art: 'bg-[linear-gradient(135deg,#ff8e00,#ffc000)]',
    text: 'text-orange-700',
    ring: 'hover:ring-brand-orange/40',
  },
  teal: {
    chip: 'bg-teal-50 text-teal-800 ring-teal-600/20',
    tile: 'bg-gradient-to-br from-brand-teal to-brand-blue text-white',
    art: 'bg-[linear-gradient(135deg,#009b9c,#0057a3)]',
    text: 'text-teal-700',
    ring: 'hover:ring-brand-teal/40',
  },
  blue: {
    chip: 'bg-blue-50 text-blue-800 ring-blue-600/20',
    tile: 'bg-gradient-to-br from-brand-blue to-brand-navy text-white',
    art: 'bg-[linear-gradient(135deg,#0057a3,#00327f)]',
    text: 'text-blue-700',
    ring: 'hover:ring-brand-blue/40',
  },
  green: {
    chip: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
    tile: 'bg-gradient-to-br from-brand-green to-brand-teal text-white',
    art: 'bg-[linear-gradient(135deg,#047845,#009b9c)]',
    text: 'text-emerald-700',
    ring: 'hover:ring-brand-green/40',
  },
  navy: {
    chip: 'bg-slate-100 text-slate-800 ring-slate-600/20',
    tile: 'bg-gradient-to-br from-brand-navy-deep to-brand-navy text-white',
    art: 'bg-[linear-gradient(135deg,#001a45,#00327f)]',
    text: 'text-brand-navy',
    ring: 'hover:ring-brand-navy/40',
  },
}

/** "18 Oct 2026" — always in UTC so the server and the browser agree. */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return ''
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d)
}
