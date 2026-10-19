import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm, MediaListField } from '@/components/admin/EntityForm/EntityForm';
import { Fieldset, Select, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { saveProject } from '../../collection-actions';
import { EditorHeader, HomeCheckbox, PublishBox, SEO_FIELDS, TranslationTabs, enabledLocales, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit project' };

export default async function ProjectEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const p = await prisma.project.findFirst({ where: { id, deletedAt: null }, include: { translations: true, gallery: { orderBy: { position: 'asc' } } } });
  if (!p) notFound();
  const [locales, media, services] = await Promise.all([
    enabledLocales(),
    pickedMedia([p.coverMediaId, ...p.gallery.map((g) => g.mediaId)]),
    prisma.service.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' }, include: { translations: { where: { locale: 'en' } } } }),
  ]);
  const values = Object.fromEntries(p.translations.map((t) => [t.locale, { ...t, paragraphs: (t.paragraphs as string[]) ?? [], highlights: (t.highlights as string[]) ?? [] }]));
  const title = p.translations.find((t) => t.locale === 'en')?.title || p.slug;

  return (
    <>
      <EditorHeader kind="projects" id={p.id} title={title} back="All projects" searchParams={searchParams} viewHref={p.status === 'PUBLISHED' ? `/our-projects/${p.slug}` : undefined} />
      <EntityForm
        action={saveProject.bind(null, p.id)}
        aside={
          <>
            <PublishBox status={p.status} sortOrder={p.sortOrder}>
              <HomeCheckbox checked={p.showOnHome} />
            </PublishBox>
            <Fieldset legend="Details">
              <CField name="serviceId" label="Service">
                <Select id="serviceId" name="serviceId" defaultValue={p.serviceId ?? ''}>
                  <option value="">(none)</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>{s.translations[0]?.title || s.slug}</option>
                  ))}
                </Select>
              </CField>
              <CField name="state" label="Stage">
                <Select id="state" name="state" defaultValue={p.state}>
                  <option value="COMPLETED">Completed</option>
                  <option value="IN_PROGRESS">In progress</option>
                </Select>
              </CField>
              <CField name="progress" label="Progress (%)" hint="Only for projects in progress.">
                <TextInput id="progress" name="progress" type="number" min={0} max={99} defaultValue={p.state === 'IN_PROGRESS' ? p.progress : 0} />
              </CField>
              <CField name="externalUrl" label="Live website" hint="Optional.">
                <TextInput id="externalUrl" name="externalUrl" type="url" defaultValue={p.externalUrl} maxLength={300} placeholder="https://" />
              </CField>
            </Fieldset>
          </>
        }
      >
        <Fieldset legend="Texts">
          <TranslationTabs
            locales={locales}
            values={values}
            fields={[
              { field: 'title', label: 'Name', max: 120, required: true },
              { field: 'category', label: 'Category', max: 80, hint: 'e.g. Software System, Website' },
              { field: 'shortDescription', label: 'Short description', type: 'textarea', hint: 'Required to publish.' },
              { field: 'paragraphs', label: 'Full description', type: 'lines', hint: 'Each line becomes a paragraph.' },
              { field: 'highlights', label: 'Highlights', type: 'lines' },
              ...SEO_FIELDS,
            ]}
          />
        </Fieldset>
        <Fieldset legend="Photos">
          <MediaField name="coverMediaId" label="Cover photo" initial={p.coverMediaId ? (media.get(p.coverMediaId) ?? null) : null} />
          <MediaListField name="gallery" label="Gallery" initial={p.gallery.map((g) => media.get(g.mediaId)).filter((m) => !!m)} />
        </Fieldset>
        <Fieldset legend="Address">
          <CField name="slug" label="Page address" hint="Changing it keeps old links working (they are redirected).">
            <TextInput id="slug" name="slug" defaultValue={p.slug} maxLength={80} />
          </CField>
        </Fieldset>
      </EntityForm>
    </>
  );
}
