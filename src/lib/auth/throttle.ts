// Slows down password guessing: after MAX_FAILURES wrong attempts for the same email (or from the
// same IP address) within WINDOW_MS, further attempts are refused until the window has passed.
// Kept in memory: correct for one server process (the planned VPS). If the site ever runs on
// several processes, move this to the database or Redis.
export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60 * 1000;

type Entry = { count: number; firstAt: number };

export class LoginThrottle {
  private entries = new Map<string, Entry>();

  constructor(private now: () => number = Date.now) {}

  private live(key: string): Entry | undefined {
    const entry = this.entries.get(key);
    if (entry && this.now() - entry.firstAt > WINDOW_MS) {
      this.entries.delete(key);
      return undefined;
    }
    return entry;
  }

  /** Milliseconds until another attempt is allowed, or 0 when allowed now. */
  retryAfter(keys: string[]): number {
    let wait = 0;
    for (const key of keys) {
      const entry = this.live(key);
      if (entry && entry.count >= MAX_FAILURES) wait = Math.max(wait, entry.firstAt + WINDOW_MS - this.now());
    }
    return wait;
  }

  fail(keys: string[]) {
    for (const key of keys) {
      const entry = this.live(key);
      if (entry) entry.count++;
      else this.entries.set(key, { count: 1, firstAt: this.now() });
    }
    if (this.entries.size > 10_000) this.entries.clear(); // memory guard against floods of random emails
  }

  succeed(keys: string[]) {
    for (const key of keys) this.entries.delete(key);
  }
}

const globalForThrottle = globalThis as unknown as { loginThrottle?: LoginThrottle };
export const loginThrottle = (globalForThrottle.loginThrottle ??= new LoginThrottle());
