import { authenticateApi, jsonError } from '@/lib/auth/api';
import { toCsv } from '@/lib/cms/csv';
import { prisma } from '@/lib/db';

/** CSV download of messages or subscribers (opens in Excel). */
export async function GET(request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const auth = await authenticateApi(request);
  if ('response' in auth) return auth.response;
  const { kind } = await params;
  let csv: string;
  if (kind === 'leads') {
    const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
    csv = toCsv(['Received', 'Status', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Sent from'], rows.map((r) => [r.createdAt.toISOString(), r.status, r.name, r.email, r.phone, r.service, r.message, r.source]));
  } else if (kind === 'subscribers') {
    const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
    csv = toCsv(['Subscribed', 'Email', 'Active', 'Source'], rows.map((r) => [r.createdAt.toISOString(), r.email, r.active ? 'yes' : 'no', r.source]));
  } else return jsonError('Unknown export.', 404);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="brightlink-${kind}-${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
