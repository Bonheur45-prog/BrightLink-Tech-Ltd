import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/db';

/** Minimal settings the CMS frame needs (Phase 2 grows this into the full Site Settings). */
export const getSiteSettings = cache(async (): Promise<{ businessName: string }> => {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { id: 1 }, select: { companyName: true } });
    return { businessName: row?.companyName || 'BrightLink Technologies' };
  } catch {
    return { businessName: 'BrightLink Technologies' };
  }
});
