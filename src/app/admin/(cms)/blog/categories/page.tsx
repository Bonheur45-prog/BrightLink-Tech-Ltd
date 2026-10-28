import type { Metadata } from 'next';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Field, Fieldset, Select, TextInput } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { ICON_KEYS } from '@/components/ui/Icons';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { TranslationTabs, enabledLocales, type Search } from '../../_collections/shared';
import { addStarterCategories, deleteCategory, saveCategory } from '../actions';

export const metadata: Metadata = { title: 'Blog categories' };
const COLORS = ['orange', 'teal', 'blue', 'green', 'navy'];
const FIELDS = [
  { field: 'name', label: 'Name', max: 80, required: true },
  { field: 'description', label: 'Description', type: 'textarea' as const },
  { field: 'metaTitle', label: 'Search title', max: 120 },
  { field: 'metaDescription', label: 'Search description', type: 'textarea' as const },
];

function CategoryFields({ c, locales, values }: { c?: { id: string; slug: string; color: string; icon: string; sortOrder: number }; locales: Awaited<ReturnType<typeof enabledLocales>>; values: Record<string, Record<string, string>> }) {
  const p = c?.id ?? 'new';
  return (
    <>
      <TranslationTabs locales={locales} values={values} fields={FIELDS} />
      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
        <Field label="Address" htmlFor={`slug-${p}`} hint="Empty = from the name.">
          <TextInput id={`slug-${p}`} name="slug" defaultValue={c?.slug ?? ''} maxLength={80} />
        </Field>
        <Field label="Colour" htmlFor={`color-${p}`}>
          <Select id={`color-${p}`} name="color" defaultValue={c?.color ?? 'blue'}>
            {COLORS.map((x) => <option key={x} value={x}>{x}</option>)}
          </Select>
        </Field>
        <Field label="Icon" htmlFor={`icon-${p}`}>
          <Select id={`icon-${p}`} name="icon" defaultValue={c?.icon ?? ''}>
            <option value="">(none)</option>
            {ICON_KEYS().map((k) => <option key={k} value={k}>{k}</option>)}
          </Select>
        </Field>
        <Field label="Order" htmlFor={`order-${p}`}>
          <TextInput id={`order-${p}`} name="sortOrder" type="number" min={0} max={9999} defaultValue={c?.sortOrder ?? 0} />
        </Field>
      </div>
    </>
  );
}

export default async function CategoriesPage({ searchParams }: { searchParams: Search }) {
  await requireUser();
  const [cats, locales] = await Promise.all([
    prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { translations: true, _count: { select: { posts: true } } } }),
    enabledLocales(),
  ]);
  const { notice, error } = noticeFrom(await searchParams);
  return (
    <>
      <PageHeader title="Blog categories" back={{ href: '/admin/blog', label: 'All articles' }} description="Every article belongs to one category. A category can only be deleted when it has no articles." />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}
      {cats.length === 0 && (
        <form action={addStarterCategories} style={{ marginBottom: 'var(--space-5)' }}>
          <ConfirmButton variant="primary">Add the 5 starter categories</ConfirmButton>
        </form>
      )}
      <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
        {cats.map((c) => (
          <details key={c.id}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              {c.translations.find((t) => t.locale === 'en')?.name ?? c.slug} <span style={{ fontWeight: 400 }}>· /blog/category/{c.slug} · {c._count.posts} articles</span>
            </summary>
            <form action={saveCategory.bind(null, c.id)} style={{ display: 'grid', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              <CategoryFields c={c} locales={locales} values={Object.fromEntries(c.translations.map((t) => [t.locale, t]))} />
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <ConfirmButton variant="primary">Save</ConfirmButton>
              </div>
            </form>
            {c._count.posts === 0 && (
              <form action={deleteCategory.bind(null, c.id)} style={{ marginTop: 'var(--space-2)' }}>
                <ConfirmButton variant="danger" size="sm" confirm="Delete this category?">Delete category</ConfirmButton>
              </form>
            )}
          </details>
        ))}
        <Fieldset legend="Add a category">
          <form action={saveCategory.bind(null, null)} style={{ display: 'grid', gap: 'var(--space-3)' }}>
            <CategoryFields locales={locales} values={{}} />
            <div>
              <ConfirmButton variant="primary">Add category</ConfirmButton>
            </div>
          </form>
        </Fieldset>
      </div>
    </>
  );
}
