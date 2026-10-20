import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CField, EntityForm } from '@/components/admin/EntityForm/EntityForm';
import { Button } from '@/components/admin/Button/Button';
import { Fieldset, Select, TextInput } from '@/components/admin/Field/Field';
import { MediaField } from '@/components/admin/MediaPicker/MediaPicker';
import { ICON_KEYS } from '@/components/ui/Icons';
import { requireUser } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { saveService } from '../../collection-actions';
import { EditorHeader, HomeCheckbox, PublishBox, SEO_FIELDS, TranslationTabs, enabledLocales, pickedMedia, type Search } from '../../_collections/shared';

export const metadata: Metadata = { title: 'Edit service' };

export default async function ServiceEditor({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  await requireUser();
  const { id } = await params;
  const s = await prisma.service.findFirst({ where: { id, deletedAt: null }, include: { translations: true } });
  if (!s) notFound();
  const [locales, media] = await Promise.all([enabledLocales(), pickedMedia([s.coverMediaId])]);
  const values = Object.fromEntries(s.translations.map((t) => [t.locale, { ...t, features: (t.features as string[]) ?? [] }]));
  const title = s.translations.find((t) => t.locale === 'en')?.title || s.slug;

  return (
    <>
      <EditorHeader kind="services" id={s.id} title={title} back="All services" searchParams={searchParams} viewHref={s.status === 'PUBLISHED' ? `/our-services/${s.slug}` : undefined} />
      <EntityForm
        action={saveService.bind(null, s.id)}
        aside={
          <>
            <PublishBox status={s.status} sortOrder={s.sortOrder}>
              <HomeCheckbox checked={s.showOnHome} />
            </PublishBox>
            <Fieldset legend="Service page">
              <p>The sections of this service’s own page (overview, offerings, FAQs…) are edited in the page builder.</p>
              <Button href={`/admin/pages/service-${s.id}`}>Edit page sections</Button>
            </Fieldset>
            <Fieldset legend="Picture and icon">
              <MediaField name="coverMediaId" label="Cover photo" initial={s.coverMediaId ? (media.get(s.coverMediaId) ?? null) : null} />
              <CField name="icon" label="Icon">
                <Select id="icon" name="icon" defaultValue={s.icon}>
                  <option value="">(none)</option>
                  {ICON_KEYS().map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </Select>
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
              { field: 'shortDescription', label: 'Short description', type: 'textarea', hint: 'Shown on cards and as the page intro. Required to publish.' },
              { field: 'features', label: 'Key points', type: 'lines' },
              ...SEO_FIELDS,
            ]}
          />
        </Fieldset>
        <Fieldset legend="Address">
          <CField name="slug" label="Page address" hint="Changing it keeps old links working (they are redirected).">
            <TextInput id="slug" name="slug" defaultValue={s.slug} maxLength={80} />
          </CField>
        </Fieldset>
      </EntityForm>
    </>
  );
}
