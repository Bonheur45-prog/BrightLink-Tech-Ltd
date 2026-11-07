import { CalendarClock, FilePen, FileText, Images, Inbox, LineChart, MailPlus, Newspaper, Plus, Upload } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Notice } from '@/components/admin/Notice/Notice';
import { StatCard } from '@/components/admin/StatCard/StatCard';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { missingR2Settings } from '@/lib/storage/r2';
import styles from './dashboard.module.css';

export const metadata: Metadata = { title: 'Dashboard' };

/** What still needs setting up on the server, so nothing fails silently later. */
function setupWarnings(): { title: string; text: string }[] {
  const warnings: { title: string; text: string }[] = [];
  const r2 = missingR2Settings();
  if (r2.length) warnings.push({ title: 'File storage is not set up', text: `Add ${r2.join(', ')} to .env. Photos and videos cannot be uploaded until then.` });
  if (!process.env.SITE_URL) warnings.push({ title: 'SITE_URL is not set', text: 'Add the public address (https://…) to .env. It is used in the sitemap, share links and canonical addresses.' });
  if (!process.env.SMTP_HOST) warnings.push({ title: 'Email is not set up', text: 'Add the SMTP_* settings to .env so new contact messages are emailed to you.' });
  if (!process.env.TURNSTILE_SECRET_KEY) warnings.push({ title: 'Spam protection is off', text: 'Add the Cloudflare Turnstile keys to .env to protect the contact form.' });
  return warnings;
}

const tz = 'Africa/Kigali';
const greeting = (d: Date) => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: tz }).format(d));
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: tz });
const short = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: tz });
const shortTime = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: tz });

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const live = { status: 'PUBLISHED' as const, deletedAt: null };
  const [newMessages, subscribers, media, publishedPosts, scheduledPosts, services, projects, clients, team, settings, messages, posts] = await Promise.all([
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.subscriber.count({ where: { active: true } }),
    prisma.mediaAsset.count({ where: { deletedAt: null } }),
    prisma.post.count({ where: { ...live, publishedAt: { lte: now } } }),
    prisma.post.count({ where: { ...live, publishedAt: { gt: now } } }),
    prisma.service.count({ where: live }),
    prisma.project.count({ where: live }),
    prisma.client.count({ where: live }),
    prisma.teamMember.count({ where: { deletedAt: null } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { googleAnalyticsId: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, service: true, message: true, status: true, createdAt: true } }),
    prisma.post.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { id: true, slug: true, status: true, publishedAt: true, updatedAt: true, translations: { where: { locale: 'en' }, select: { title: true } } },
    }),
  ]);
  const analytics = settings?.googleAnalyticsId ?? '';
  const warnings = setupWarnings();

  const postState = (p: (typeof posts)[number]) =>
    p.status === 'DRAFT' ? { label: 'Draft', tone: 'draft' } : p.publishedAt && p.publishedAt > now ? { label: `Scheduled · ${short.format(p.publishedAt)}`, tone: 'scheduled' } : { label: 'Published', tone: 'live' };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.date}>{today.format(now)}</p>
          <h1 className={styles.hello}>
            {greeting(now)}, {user.name.split(' ')[0]}
          </h1>
          <p className={styles.heroLead}>Everything on brightlinkltd.com, in one place.</p>
        </div>
        <div className={styles.quick}>
          <Link href="/admin/blog" className={styles.quickPrimary}>
            <Plus size={16} aria-hidden="true" /> Write an article
          </Link>
          <Link href="/admin/pages" className={styles.quickLink}>
            <FilePen size={16} aria-hidden="true" /> Edit pages
          </Link>
          <Link href="/admin/media" className={styles.quickLink}>
            <Upload size={16} aria-hidden="true" /> Upload media
          </Link>
        </div>
      </section>

      {warnings.length > 0 && (
        <div className={styles.warnings}>
          {warnings.map((w) => (
            <Notice key={w.title} tone="warning" title={w.title}>
              {w.text}
            </Notice>
          ))}
        </div>
      )}

      <div className={styles.stats}>
        <StatCard icon={<Inbox size={20} />} label="New messages" value={newMessages} highlight={newMessages > 0} href="/admin/messages?status=NEW" />
        <StatCard icon={<MailPlus size={20} />} label="Subscribers" value={subscribers} href="/admin/subscribers" />
        <StatCard icon={<Newspaper size={20} />} label={scheduledPosts ? `Articles live · ${scheduledPosts} scheduled` : 'Articles live'} value={publishedPosts} href="/admin/blog" />
        <StatCard icon={<Images size={20} />} label="Files in the media library" value={media} href="/admin/media" />
        <StatCard icon={<LineChart size={20} />} label={analytics ? `Google Analytics · ${analytics}` : 'Google Analytics is off'} value={analytics ? 'On' : 'Off'} href="/admin/settings" />
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Latest messages</h2>
            <Link href="/admin/messages" className={styles.panelLink}>
              All messages →
            </Link>
          </header>
          {messages.length ? (
            <ul className={styles.rows}>
              {messages.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/messages/${m.id}`} className={styles.row}>
                    <span className={styles.initial} aria-hidden="true">
                      {(m.name || '?').trim().charAt(0).toUpperCase()}
                    </span>
                    <span className={styles.rowText}>
                      <span className={styles.rowTitle}>
                        {m.name || 'Visitor'}
                        {m.status === 'NEW' && <span className={styles.newDot}>New</span>}
                      </span>
                      <span className={styles.rowSub}>{m.service || m.message || 'No message'}</span>
                    </span>
                    <time className={styles.rowMeta} dateTime={m.createdAt.toISOString()}>
                      {shortTime.format(m.createdAt)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No messages yet. They arrive here from the contact form.</p>
          )}
        </section>

        <section className={styles.panel}>
          <header className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Recent articles</h2>
            <Link href="/admin/blog" className={styles.panelLink}>
              All articles →
            </Link>
          </header>
          {posts.length ? (
            <ul className={styles.rows}>
              {posts.map((p) => {
                const s = postState(p);
                return (
                  <li key={p.id}>
                    <Link href={`/admin/blog/${p.id}`} className={styles.row}>
                      <span className={styles.postIcon} aria-hidden="true">
                        {s.tone === 'scheduled' ? <CalendarClock size={18} /> : <FileText size={18} />}
                      </span>
                      <span className={styles.rowText}>
                        <span className={styles.rowTitle}>{p.translations[0]?.title || p.slug}</span>
                        <span className={styles.rowSub}>Edited {short.format(p.updatedAt)}</span>
                      </span>
                      <span className={styles.pill} data-tone={s.tone}>
                        {s.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.empty}>No articles yet.</p>
          )}
        </section>
      </div>

      <section className={styles.glance} aria-label="On the website">
        {[
          { href: '/admin/services', label: 'Services', value: services },
          { href: '/admin/projects', label: 'Projects', value: projects },
          { href: '/admin/clients', label: 'Clients', value: clients },
          { href: '/admin/team', label: 'Team members', value: team },
        ].map((c) => (
          <Link key={c.href} href={c.href} className={styles.glanceItem}>
            <span className={styles.glanceValue}>{c.value}</span>
            <span className={styles.glanceLabel}>{c.label}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
