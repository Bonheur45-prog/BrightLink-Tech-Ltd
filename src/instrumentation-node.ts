import { sendDueNewsletters } from '@/lib/email/newsletter';

/*
 * Every 10 minutes, articles that have gone live (including scheduled ones whose date has come) and were
 * not emailed yet are sent to the subscribers (src/lib/email/newsletter.ts). One timer in the single PM2
 * process; costs almost nothing.
 */
const run = () => void sendDueNewsletters();
setTimeout(run, 60_000).unref(); // shortly after start (e.g. after a deploy)
setInterval(run, 10 * 60_000).unref();
