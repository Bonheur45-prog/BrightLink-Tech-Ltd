import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Fieldset } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge/StatusBadge';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import type { Search } from '../../_collections/shared';
import { deleteLead, setLeadStatus } from '../actions';

export const metadata: Metadata = { title: 'Message' };
const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Kigali' });

export default async function MessagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const m = await prisma.lead.findUnique({ where: { id } });
  if (!m) notFound();
  const { notice } = noticeFrom(await searchParams);
  const row = (label: string, value: string) => (value ? <p><strong>{label}:</strong> {value}</p> : null);

  return (
    <>
      <PageHeader
        title={`Message from ${m.name}`}
        back={{ href: '/admin/messages', label: 'All messages' }}
        actions={
          <>
            <Button href={`mailto:${m.email}?subject=${encodeURIComponent('Your message to BrightLink Technologies')}`}>Reply by email</Button>
            {m.phone && <Button href={`tel:${m.phone.replace(/[^\d+]/g, '')}`}>Call</Button>}
          </>
        }
      />
      {notice && <Notice tone="success">{notice}</Notice>}
      {m.notifyError && <Notice tone="warning" title="The notification email failed">{m.notifyError}</Notice>}
      <Fieldset legend="Details">
        <p><StatusBadge status={m.status} /></p>
        {row('Received', when.format(m.createdAt))}
        {row('Email', m.email)}
        {row('Phone', m.phone)}
        {row('Service', m.service)}
        {row('Sent from', m.source)}
        <p style={{ whiteSpace: 'pre-wrap', padding: 'var(--space-4)', background: 'var(--plaster)' }}>{m.message}</p>
      </Fieldset>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginTop: 'var(--space-5)' }}>
        {(['NEW', 'CONTACTED', 'CLOSED'] as const)
          .filter((s) => s !== m.status)
          .map((s) => (
            <form key={s} action={setLeadStatus.bind(null, m.id, s)}>
              <ConfirmButton>Mark as {s.toLowerCase()}</ConfirmButton>
            </form>
          ))}
        <form action={deleteLead.bind(null, m.id)}>
          <ConfirmButton variant="danger" confirm="Delete this message for good?">Delete</ConfirmButton>
        </form>
      </div>
    </>
  );
}
