import 'server-only';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

/**
 * Records who changed what, e.g. audit(user.id, 'item.publish', 'item', item.id, { slug }).
 * A failed audit write is logged but never blocks the change itself.
 */
export async function audit(
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  meta: Prisma.InputJsonObject = {},
) {
  try {
    await prisma.auditLog.create({ data: { userId, action, entityType, entityId, meta } });
  } catch (error) {
    console.error('audit: could not record', action, entityId, error);
  }
}
