import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { saveTeam } from '../../collection-actions';
import { EditorHeader, PublishBox, TranslationTabs, enabledLocales, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit team member' };

export default async function TeamEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const m = await prisma.teamMember.findFirst({ where: { id, deletedAt: null }, include: { translations: true } });
  if (!m) notFound();
  const [locales, media] = await Promise.all([enabledLocales(), pickedMedia([m.photoMediaId])]);
  const values = Object.fromEntries(m.translations.map((t) => [t.locale, t]));
  return (
    <>
      <EditorHeader kind="team" id={m.id} title={m.name} back="All team members" searchParams={searchParams} />
      <EntityForm
        action={saveTeam.bind(null, m.id)}
        aside={
          <>
            <PublishBox status={m.status} sortOrder={m.sortOrder} />
            <Fieldset legend="Photo">
              <MediaField name="photoMediaId" label="Portrait" hint="Square works best." initial={m.photoMediaId ? (media.get(m.photoMediaId) ?? null) : null} />
            </Fieldset>
          </>
        }
      >
        <Fieldset legend="Person">
          <CField name="name" label="Name" required>
            <TextInput id="name" name="name" defaultValue={m.name} maxLength={120} />
          </CField>
          <CField name="email" label="Email" hint="Optional. Shown on the website.">
            <TextInput id="email" name="email" type="email" defaultValue={m.email} maxLength={200} />
          </CField>
          <CField name="linkedin" label="LinkedIn" hint="Optional.">
            <TextInput id="linkedin" name="linkedin" type="url" defaultValue={m.linkedin} maxLength={300} placeholder="https://www.linkedin.com/in/…" />
          </CField>
        </Fieldset>
        <Fieldset legend="Role and bio">
          <TranslationTabs
            locales={locales}
            values={values}
            fields={[
              { field: 'role', label: 'Role', max: 120, required: true },
              { field: 'bio', label: 'Short bio', type: 'textarea' },
            ]}
          />
        </Fieldset>
      </EntityForm>
    </>
  );
}
