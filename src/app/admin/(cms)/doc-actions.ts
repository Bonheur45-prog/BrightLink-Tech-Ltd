'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { audit } from '@/lib/audit';
import { requireUser } from '@/lib/auth/session';
import { discardDraft, isDocKey, isPageDoc, publish, restoreVersion, saveDraft, type DocKey } from '@/lib/cms/drafts';
import type { Problems } from '@/lib/cms/globals-model';

// Draft/publish actions shared by every draft-based editor (header, footer, pages).
export type DocSaveResult = { ok: true; savedAt: number } | { ok: false; error: string; problems?: Problems };

const path = (k: DocKey) => (isPageDoc(k) ? `/admin/pages/${k}` : `/admin/${k}`);

export async function saveDocDraft(k: DocKey, doc: unknown): Promise<DocSaveResult> {
  const user = await requireUser();
  if (!isDocKey(k)) return { ok: false, error: 'Unknown content.' };
  await saveDraft(k, doc);
  await audit(user.id, `${k}.save`, isPageDoc(k) ? 'page' : 'global', k);
  revalidatePath(path(k));
  return { ok: true, savedAt: Date.now() };
}

export async function publishDoc(k: DocKey, doc: unknown, note: string): Promise<DocSaveResult> {
  const user = await requireUser();
  if (!isDocKey(k)) return { ok: false, error: 'Unknown content.' };
  await saveDraft(k, doc);
  const result = await publish(k, user.id, typeof note === 'string' ? note : undefined);
  if (!result.ok) return { ok: false, error: 'Not published yet: the fields marked below need attention. Your changes are saved as a draft.', problems: result.problems };
  await audit(user.id, `${k}.publish`, isPageDoc(k) ? 'page' : 'global', k);
  revalidatePath(path(k));
  return { ok: true, savedAt: Date.now() };
}

export async function discardDoc(k: DocKey) {
  const user = await requireUser();
  if (!isDocKey(k)) redirect('/admin');
  await discardDraft(k);
  await audit(user.id, `${k}.discard`, isPageDoc(k) ? 'page' : 'global', k);
  redirect(`${path(k)}?notice=discarded`);
}

export async function restoreDocVersion(k: DocKey, versionId: string) {
  const user = await requireUser();
  if (!isDocKey(k) || !/^[a-z0-9]{10,40}$/.test(versionId)) redirect('/admin');
  const ok = await restoreVersion(k, versionId);
  if (ok) await audit(user.id, `${k}.restore`, isPageDoc(k) ? 'page' : 'global', k, { versionId });
  redirect(`${path(k)}?notice=${ok ? 'version-restored' : 'saved'}`);
}
