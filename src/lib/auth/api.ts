import 'server-only';
import { getCurrentUser, type AdminUser } from './session';

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/**
 * For /admin/api route handlers: returns the logged-in user, or a ready error response.
 * Also refuses requests sent from another website (the session cookie is SameSite=Lax, and this
 * Origin check is a second guard).
 */
export async function authenticateApi(request: Request): Promise<{ user: AdminUser } | { response: Response }> {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (origin && host && new URL(origin).host !== host) {
    return { response: jsonError('Request from another website refused.', 403) };
  }
  const user = await getCurrentUser();
  if (!user) return { response: jsonError('Your session has ended. Log in again.', 401) };
  return { user };
}
