import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { saveClient } from '../../collection-actions';
import { EditorHeader, PublishBox, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit client' };

export default async function ClientEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const c = await prisma.client.findFirst({ where: { id, deletedAt: null } });
  if (!c) notFound();
  const media = await pickedMedia([c.logoMediaId]);
  return (
    <>
      <EditorHeader kind="clients" id={c.id} title={c.name} back="All clients" searchParams={searchParams} />
      <EntityForm action={saveClient.bind(null, c.id)} aside={<PublishBox status={c.status} sortOrder={c.sortOrder} />}>
        <Fieldset legend="Client">
          <CField name="name" label="Name" required>
            <TextInput id="name" name="name" defaultValue={c.name} maxLength={120} />
          </CField>
          <CField name="website" label="Website" hint="Optional. The logo links to it.">
            <TextInput id="website" name="website" type="url" defaultValue={c.website} maxLength={300} placeholder="https://" />
          </CField>
          <MediaField name="logoMediaId" label="Logo" hint="Without a logo, the name is shown." initial={c.logoMediaId ? (media.get(c.logoMediaId) ?? null) : null} />
        </Fieldset>
      </EntityForm>
    </>
  );
}
