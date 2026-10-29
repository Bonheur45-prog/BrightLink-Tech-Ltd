import type { Metadata } from 'next'

import { ClosingCta } from '@/components/about/ClosingCta'
import { CategoryNav } from '@/components/blog/CategoryNav'
import { FeaturedPost } from '@/components/blog/FeaturedPost'
import { Pagination } from '@/components/blog/Pagination'
import { PostCard, PostRow } from '@/components/blog/PostCard'
import { SubscribeBand } from '@/components/blog/SubscribeBand'
import { JsonLd } from '@/components/ui/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getAllPosts, getBlogCategories, getBlogPage, getSiteSettings } from '@/lib/content'
import { localizeHref } from '@/i18n/config'
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, getServerUrl } from '@/lib/seo'

const PATH = '/blog'
type Props = { searchParams: Promise<{ page?: string; q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, q } = await searchParams
  const [settings, blog] = await Promise.all([getSiteSettings(), getBlogPage()])
  const meta = buildMetadata({
    settings,
    title: blog.seo.metaTitle || 'Blog',
    description: blog.seo.metaDescription || blog.banner.intro,
    image: blog.seo.ogImage ?? blog.banner.image,
    path: PATH,
    // search results and page 2+ are not worth indexing separately
    noIndex: Boolean(q) || (Number(page) || 1) > 1,
  })
  return { ...meta, alternates: { ...meta.alternates, types: { 'application/rss+xml': absoluteUrl('/blog/feed.xml') } } }
}

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam, q: rawQ } = await searchParams
  const q = (rawQ ?? '').trim().slice(0, 80)
  const [settings, blog, all, categories] = await Promise.all([getSiteSettings(), getBlogPage(), getAllPosts(), getBlogCategories()])

  const matches = q
    ? all.filter((p) => [p.title, p.excerpt, p.category?.name ?? '', ...p.tags].join(' ').toLowerCase().includes(q.toLowerCase()))
    : all
  const lead = !q ? (matches.find((p) => p.featured) ?? matches[0]) : undefined
  const rest = lead ? matches.filter((p) => p.id !== lead.id) : matches
  const totalPages = Math.max(1, Math.ceil(rest.length / blog.postsPerPage))
  const page = Math.min(Math.max(1, Math.round(Number(pageParam) || 1)), totalPages)
  const pageItems = rest.slice((page - 1) * blog.postsPerPage, page * blog.postsPerPage)
  const magazine = page === 1 && !q && pageItems.length >= 3
  const bento = magazine ? pageItems.slice(0, 3) : []
  const grid = magazine ? pageItems.slice(3) : pageItems

  const schema: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${absoluteUrl(PATH, settings.locale)}#blog`,
      url: absoluteUrl(PATH, settings.locale),
      name: `${settings.companyName} Blog`,
      description: blog.seo.metaDescription || blog.banner.intro,
      publisher: { '@id': `${getServerUrl()}/#organization` },
      blogPost: all.slice(0, 10).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: absoluteUrl(p.url, settings.locale),
        datePublished: p.publishedAt,
      })),
    },
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: PATH },
    ], settings.locale),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <PageBanner
        eyebrow={blog.banner.eyebrow}
        title={blog.banner.heading}
        intro={blog.banner.intro}
        image={blog.banner.image}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />

      {/* browse by topic + search */}
      <section aria-label="Browse the blog" className="bg-white pb-4 pt-14">
        <div className="container-x">
          <p className="mb-6 text-center font-display text-sm font-bold uppercase tracking-[0.16em] text-brand-blue">Browse by topic</p>
          <CategoryNav categories={categories} total={all.length} />
          <form action={localizeHref('/blog', settings.locale)} role="search" className="mx-auto mt-10 flex max-w-xl gap-2">
            <label htmlFor="blog-search" className="sr-only">
              Search articles
            </label>
            <input
              id="blog-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search articles…"
              className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-base outline-none transition focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
        </div>
      </section>

      <section id="articles" aria-labelledby="latest-heading" className="bg-white pb-20 pt-12 lg:pb-28">
        <div className="container-x">
          {lead && page === 1 && (
            <div className="mb-16">
              <FeaturedPost post={lead} />
            </div>
          )}

          {matches.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-brand-blue/30 bg-slate-50 p-10 text-center">
              <p className="font-display text-xl font-semibold text-brand-navy-deep">No articles found{q ? ` for “${q}”` : ''}</p>
              <p className="mt-2 text-slate-600">Try another word, or browse a topic above.</p>
            </div>
          ) : (
            <>
              <SectionHeading id="latest-heading" eyebrow={q ? 'Search results' : 'Journal'} title={q ? `Results for “${q}”` : blog.latestHeading} />

              {bento.length === 3 && (
                <div className="mt-10 grid gap-7 lg:grid-cols-12">
                  <Reveal className="lg:col-span-7">
                    <PostCard post={bento[0]} large />
                  </Reveal>
                  <div className="grid gap-7 lg:col-span-5">
                    <Reveal delay={100}>
                      <PostRow post={bento[1]} />
                    </Reveal>
                    <Reveal delay={200}>
                      <PostRow post={bento[2]} />
                    </Reveal>
                  </div>
                </div>
              )}

              {grid.length > 0 && (
                <ul className={`${bento.length ? 'mt-7' : 'mt-10'} grid gap-7 sm:grid-cols-2 lg:grid-cols-3`}>
                  {grid.map((p, i) => (
                    <Reveal as="li" key={p.id} delay={(i % 3) * 100}>
                      <PostCard post={p} />
                    </Reveal>
                  ))}
                </ul>
              )}

              <Pagination page={page} totalPages={totalPages} basePath={PATH} query={q ? { q } : {}} />
            </>
          )}
        </div>
      </section>

      <SubscribeBand data={blog.subscribe} />
      <ClosingCta
        data={{
          enabled: true,
          heading: 'Want a solution like the ones we write about?',
          text: 'Tell us what you need and we will discuss how to build it.',
          primaryCta: { label: 'Start a conversation', url: '/#get-in-touch', newTab: false },
          secondaryCta: { label: 'See our projects', url: '/our-projects', newTab: false },
        }}
      />
    </>
  )
}
