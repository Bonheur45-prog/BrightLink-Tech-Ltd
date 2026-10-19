/** Accessible progress bar for projects that are still being built. */
export function ProgressBar({ value, label, large = false }: { value: number; label: string; large?: boolean }) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className={`font-display font-bold text-brand-navy-deep ${large ? 'text-2xl' : 'text-base'}`}>{v}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        className={`mt-2 w-full overflow-hidden rounded-full bg-slate-200 ${large ? 'h-3.5' : 'h-2.5'}`}
      >
        <div className="h-full rounded-full bg-brand-link" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}
