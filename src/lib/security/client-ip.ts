// The visitor's IP address, as reported by the proxy in front of the app.
// Behind Cloudflare: CF-Connecting-IP. Behind Nginx: X-Forwarded-For (first entry) or X-Real-IP.
// Only trust these headers when the app is reachable ONLY through that proxy (see README deployment notes).
export function clientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  );
}
