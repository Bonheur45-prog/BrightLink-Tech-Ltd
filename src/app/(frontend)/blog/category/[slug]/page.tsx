import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CategoryNav } from '@/components/blog/CategoryNav'
import { Pagination } from '@/components/blog/Pagination'
import { PostCard } from '@/components/blog/PostCard'
import { SubscribeBand } from '@/components/blog/SubscribeBand'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { Reveal } from '@/components/ui/Reveal'
import { getAllPosts, getBlogCategories, getBlogPage, getSiteSettings } from '@/lib/content'
import { ui } from '@/i18n/ui'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, { page }] = await Promise.all([params, searchParams])
  const [settings, categories] = await Promise.all([getSiteSettings(), getBlogCategories()])
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return { title: 'Category not found', robots: { index: false } }
  return buildMetadata({
    settings,
    title: cat.seo.metaTitle || `${cat.name} — Blog`,
    description: cat.seo.metaDescription || cat.description || `Articles about ${cat.name} from ${settings.companyName}.`,
    path: cat.url,
    noIndex: (Number(page) || 1) > 1,
  })
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams])
  const [settings, blog, all, categories] = await Promise.all([getSiteSettings(), getBlogPage(), getAllPosts(), getBlogCategories()])
  const t = ui(settings.locale)
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()

  const posts = all.filter((p) => p.category?.slug === slug)
  const totalPages = Math.max(1, Math.ceil(posts.length / blog.postsPerPage))
  const page = Math.min(Math.max(1, Math.round(Number(pageParam) || 1)), totalPages)
  const items = posts.slice((page - 1) * blog.postsPerPage, page * blog.postsPerPage)

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${absoluteUrl(cat.url, settings.locale)}#webpage`,
      url: absoluteUrl(cat.url, settings.locale),
      name: `${cat.name} — ${settings.companyName} Blog`,
      description: cat.description,
      isPartOf: { '@id': `${getServerUrl()}/#website` },
    },
    breadcrumbJsonLd([
      { name: t.home, path: '/' },
      { name: t.blog, path: '/blog' },
      { name: cat.name, path: cat.url },
    ], settings.locale),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={t.blogCategory}
        title={cat.name}
        intro={cat.description}
        image={null}
        crumbs={[{ label: t.home, href: '/' }, { label: t.blog, href: '/blog' }, { label: cat.name }]}
      />
      <section className="bg-white py-14 lg:py-20">
        <div className="container-x">
          <CategoryNav categories={categories} active={slug} total={all.length} />
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} basePath={cat.url} />
        </div>
      </section>
      <SubscribeBand data={blog.subscribe} />
    </>
  )
}
