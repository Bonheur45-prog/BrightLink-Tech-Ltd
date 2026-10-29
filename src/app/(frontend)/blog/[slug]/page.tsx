import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ClosingCta } from '@/components/about/ClosingCta'
import { ArticleHtml, TableOfContents } from '@/components/blog/ArticleHtml'
import { PostCard, PostCover, CategoryChip } from '@/components/blog/PostCard'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { ShareBar } from '@/components/blog/ShareBar'
import { SubscribeBand } from '@/components/blog/SubscribeBand'
import { CAT, formatDate } from '@/components/blog/theme'
import { JsonLd } from '@/components/ui/JsonLd'
import { Reveal } from '@/components/ui/Reveal'
import { ChevronRightIcon, MailIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getAllPosts, getBlogPage, getPostBySlug, getSiteSettings } from '@/lib/content'
import { absoluteUrl, blogPostingJsonLd, breadcrumbJsonLd, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [settings, post] = await Promise.all([getSiteSettings(), getPostBySlug(slug)])
  if (!post) return { title: 'Article not found', robots: { index: false } }
  const meta = buildMetadata({
    settings,
    title: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription || post.excerpt,
    image: post.seo.ogImage ?? post.image,
    path: post.url,
    type: 'article',
    noIndex: post.seo.noIndex,
  })
  return {
    ...meta,
    // A custom canonical (the article first appeared elsewhere) replaces this site's language versions.
    alternates: post.seo.canonicalUrl ? { canonical: post.seo.canonicalUrl } : meta.alternates,
    keywords: [post.seo.focusKeyword, ...post.tags].filter(Boolean),
    authors: [{ name: post.author.name }],
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      section: post.category?.name,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const [settings, blog, all] = await Promise.all([getSiteSettings(), getBlogPage(), getAllPosts()])
  const others = all.filter((p) => p.id !== post.id)
  const related = [
    ...others.filter((p) => p.category?.slug && p.category.slug === post.category?.slug),
    ...others.filter((p) => !p.category?.slug || p.category.slug !== post.category?.slug),
  ].slice(0, 3)
  const color = post.category?.color ?? 'blue'
  const url = absoluteUrl(post.url, settings.locale)

  const schema: Record<string, unknown>[] = [
    blogPostingJsonLd({
      title: post.title,
      description: post.seo.metaDescription || post.excerpt,
      path: post.url,
      image: (post.seo.ogImage ?? post.image)?.url,
      published: post.publishedAt,
      authorName: post.author.name,
      keywords: [post.seo.focusKeyword, ...post.tags].filter(Boolean),
      section: post.category?.name,
      settings,
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      ...(post.category ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }] : []),
      { name: post.title, path: post.url },
    ], settings.locale),
  ]

  return (
    <>
      <JsonLd data={schema} />
      <ReadingProgress targetId="article-body" />

      {/* headline */}
      <header className="relative overflow-hidden bg-slate-50 pb-10 pt-12 lg:pb-14 lg:pt-16">
        <div aria-hidden className={`absolute inset-x-0 top-0 h-1.5 ${CAT[color].art}`} />
        <div aria-hidden className="absolute -right-24 -top-24 size-[26rem] rounded-full bg-brand-yellow/20 blur-3xl" />
        <div className="container-x relative max-w-4xl">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
              <li>
                <SmartLink href="/" className="hover:text-brand-blue">Home</SmartLink>
              </li>
              <ChevronRightIcon width={14} height={14} className="text-slate-300" />
              <li>
                <SmartLink href="/blog" className="hover:text-brand-blue">Blog</SmartLink>
              </li>
              {post.category && (
                <>
                  <ChevronRightIcon width={14} height={14} className="text-slate-300" />
                  <li>
                    <SmartLink href={`/blog/category/${post.category.slug}`} className="hover:text-brand-blue">{post.category.name}</SmartLink>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <div className="mt-6">
            <CategoryChip post={post} />
          </div>
          <h1 className="hero-reveal mt-5 font-display text-[clamp(2rem,3.4vw+1rem,3.5rem)] font-bold leading-[1.1] tracking-tight text-brand-navy-deep">{post.title}</h1>
          <p className="hero-reveal mt-5 text-xl leading-relaxed text-slate-600 [animation-delay:120ms]">{post.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              {post.author.photo ? (
                <Image src={post.author.photo.url} alt="" width={44} height={44} className="size-11 rounded-full object-cover" />
              ) : (
                <span aria-hidden className="grid size-11 place-items-center rounded-full bg-brand-cool font-display text-sm font-bold text-white">
                  {initials(post.author.name)}
                </span>
              )}
              <p className="leading-tight">
                <span className="block font-semibold text-brand-navy-deep">{post.author.name}</span>
                {post.author.role && <span className="block text-sm text-slate-500">{post.author.role}</span>}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span aria-hidden> · </span>
              {post.readingMinutes} min read
            </p>
          </div>
        </div>
      </header>

      {/* cover picture space */}
      <div className="container-x -mt-1 max-w-5xl pt-8">
        <Reveal>
          <PostCover post={post} sizes="(min-width: 1024px) 1000px, 100vw" className="aspect-[16/8] rounded-3xl shadow-2xl shadow-brand-navy/15" />
        </Reveal>
      </div>

      {/* article + sidebar */}
      <div className="container-x grid gap-12 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
        <article id="article-body" className="mx-auto w-full max-w-3xl lg:col-span-8 lg:mx-0">
          <ArticleHtml html={post.html} locale={settings.locale} />

          {post.tags.length > 0 && (
            <ul aria-label="Tags" className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <li key={t}>
                  <SmartLink href={`/blog?q=${encodeURIComponent(t)}`} className="rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-brand-blue hover:text-white">
                    #{t}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            <p className="font-display font-semibold text-brand-navy-deep">Found this useful? Share it</p>
            <ShareBar url={url} title={post.title} />
          </div>

          {/* author box */}
          <aside className="mt-10 flex gap-5 rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
            {post.author.photo ? (
              <Image src={post.author.photo.url} alt="" width={64} height={64} className="size-16 shrink-0 rounded-full object-cover" />
            ) : (
              <span aria-hidden className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-cool font-display text-lg font-bold text-white">
                {initials(post.author.name)}
              </span>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Written by</p>
              <p className="font-display text-lg font-semibold text-brand-navy-deep">{post.author.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                BrightLink Technologies Ltd builds software, websites and digital solutions, and provides IT support, from Kigali, Rwanda.{' '}
                <SmartLink href="/about-us" className="font-semibold text-brand-blue hover:text-brand-navy">About us →</SmartLink>
              </p>
            </div>
          </aside>
        </article>

        <aside className="lg:col-span-4">
          <div className="space-y-6 lg:sticky lg:top-28">
            <TableOfContents toc={post.toc} />
            <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-navy">Share</p>
              <div className="mt-3">
                <ShareBar url={url} title={post.title} vertical />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#001a45,#00327f_70%,#0057a3)] p-6 text-white">
              <div aria-hidden className="absolute -right-8 -top-8 size-32 rounded-full bg-brand-orange/30 blur-2xl" />
              <MailIcon width={26} height={26} className="relative text-brand-yellow" />
              <p className="relative mt-3 font-display text-lg font-semibold !text-white">Need help with a project?</p>
              <p className="relative mt-1.5 text-sm text-white/80">Tell us what you want to build and we will get back to you.</p>
              <SmartLink href="/#get-in-touch" className="btn btn-primary relative mt-4">Talk to us</SmartLink>
            </div>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="bg-slate-50 py-16 lg:py-24">
          <div className="container-x">
            <SectionHeading id="related-heading" eyebrow="Keep reading" title="More from the journal" />
            <ul className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 100}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <SubscribeBand data={blog.subscribe} />
      <ClosingCta
        data={{
          enabled: true,
          heading: 'Ready to build something?',
          text: 'Talk to the team behind the solutions you have just read about.',
          primaryCta: { label: 'Start a conversation', url: '/#get-in-touch', newTab: false },
          secondaryCta: { label: 'Explore our services', url: '/our-services', newTab: false },
        }}
      />
    </>
  )
}
