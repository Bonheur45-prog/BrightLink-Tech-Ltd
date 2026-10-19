// Cloudflare Turnstile: a "are you a person?" check on the contact form, usually invisible to people.
// Keys come from .env (TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY). Without them the check is skipped,
// which is fine for development; the CMS dashboard warns when it is off.

export const TURNSTILE_RESPONSE_FIELD = 'cf-turnstile-response';
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export function turnstileSiteKey(): string | null {
  return process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY ? process.env.TURNSTILE_SITE_KEY : null;
}

export type TurnstileResult = 'ok' | 'failed' | 'disabled' | 'unavailable';

/**
 * Checks the token the widget put in the form.
 * 'unavailable' = Cloudflare could not be reached; the caller lets the message through (and rate limits
 * still apply) rather than losing a real customer's enquiry because of a network problem.
 */
export async function verifyTurnstile(
  token: string,
  ip: string,
  fetchImpl: typeof fetch = fetch,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !process.env.TURNSTILE_SITE_KEY) return 'disabled';
  if (!token || token.length > 2048) return 'failed';
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== 'unknown') body.set('remoteip', ip);
    const response = await fetchImpl(VERIFY_URL, { method: 'POST', body, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return 'unavailable';
    const data = (await response.json()) as { success?: boolean };
    return data.success ? 'ok' : 'failed';
  } catch {
    return 'unavailable';
  }
}
