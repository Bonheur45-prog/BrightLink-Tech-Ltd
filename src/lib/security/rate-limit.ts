// Counts requests per key (usually an IP address) in a fixed time window, in memory.
// Correct for one server process (the planned VPS). With several processes, move this to Redis.

export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private limit: number,
    private windowMs: number,
    private now: () => number = Date.now,
  ) {}

  /** Records one request. Returns true when it is allowed, false when the limit is reached. */
  take(key: string): boolean {
    const now = this.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (this.hits.size > 20_000) this.hits.clear(); // memory guard against floods of random keys
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (entry.count >= this.limit) return false;
    entry.count++;
    return true;
  }
}

const globals = globalThis as unknown as { blLimiters?: Record<string, RateLimiter> };
globals.blLimiters ??= {};

/** One shared limiter per name, kept across hot reloads in development. */
export function limiter(name: string, limit: number, windowMs: number): RateLimiter {
  return (globals.blLimiters![name] ??= new RateLimiter(limit, windowMs));
}

/** Enquiry form: 5 messages per IP address per 10 minutes. */
export const enquiryLimiter = () => limiter('enquiry', 5, 10 * 60 * 1000);
/** Call/WhatsApp tap tracking: 60 per IP address per minute. */
export const trackLimiter = () => limiter('track', 60, 60 * 1000);
