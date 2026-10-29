'use client'

import Image from 'next/image'

import { IconByKey } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { BlogPost } from '@/lib/content/types'
import { CAT } from './theme'
import { formatDate } from '@/i18n/ui'
import { useUi } from '@/components/i18n/useUi'
import { useLocale } from '@/components/i18n/LocaleProvider'

/** Picture of the article, or brand artwork in the category colour until one is uploaded. */
export function PostCover({ post, sizes, className = '' }: { post: BlogPost; sizes: string; className?: string }) {
  const color = post.category?.color ?? 'blue'
  return (
    <div className={`relative overflow-hidden bg-brand-navy-deep ${className}`}>
      {post.image ? (
        <Image
          src={post.image.url}
          alt={post.image.alt || post.title}
          fill
          sizes={sizes}
          className="object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 ${CAT[color].art}`}>
          <div className="absolute -right-10 -top-10 size-44 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:18px_18px]" />
          <span className="absolute bottom-4 left-4 grid size-12 place-items-center rounded-2xl bg-white/90 text-brand-navy-deep shadow-lg">
            <IconByKey name={post.category?.icon ?? 'code'} width={24} height={24} />
          </span>
        </div>
      )}
    </div>
  )
}

export function CategoryChip({ post }: { post: BlogPost }) {
  if (!post.category) return null
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${CAT[post.category.color].chip}`}>
      {post.category.name}
    </span>
  )
}

export function PostMeta({ post }: { post: BlogPost }) {
  const locale = useLocale()
  const t = useUi()
  return (
    <p className="text-sm text-slate-500">
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
      <span aria-hidden> · </span>
      {post.readingMinutes} {t.minRead}
    </p>
  )
}

/** One article card. `large` is used for the lead story of the magazine grid. */
export function PostCard({ post, large = false }: { post: BlogPost; large?: boolean }) {
  const t = useUi()
  const color = post.category?.color ?? 'blue'
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-brand-navy/15 ${CAT[color].ring}`}
    >
      <PostCover
        post={post}
        sizes={large ? '(min-width: 1024px) 720px, 100vw' : '(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw'}
        className={large ? 'aspect-[16/10] lg:aspect-auto lg:min-h-[18rem] lg:flex-1' : 'aspect-[16/10]'}
      />
      <div className={`flex flex-col ${large ? 'p-7 lg:p-8' : 'flex-1 p-6'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CategoryChip post={post} />
          <PostMeta post={post} />
        </div>
        <h3 className={`mt-4 font-display font-semibold leading-snug text-brand-navy-deep ${large ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
          <SmartLink href={post.url} className="after:absolute after:inset-0 hover:text-brand-blue">
            {post.title}
          </SmartLink>
        </h3>
        <p className={`mt-3 leading-relaxed text-slate-600 ${large ? 'line-clamp-3 text-base' : 'line-clamp-3 text-[0.95rem]'}`}>{post.excerpt}</p>
        <p className="mt-auto pt-5 text-sm font-semibold text-brand-blue">
          {t.readArticle} <span aria-hidden className="inline-block transition group-hover:translate-x-1.5">→</span>
        </p>
      </div>
    </article>
  )
}

/** Compact horizontal card for the "more stories" column next to the lead story. */
export function PostRow({ post }: { post: BlogPost }) {
  const color = post.category?.color ?? 'blue'
  return (
    <article
      className={`group relative flex h-full overflow-hidden rounded-3xl bg-white shadow-lg shadow-brand-navy/8 ring-1 ring-brand-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-navy/15 ${CAT[color].ring}`}
    >
      <PostCover post={post} sizes="(min-width: 1024px) 200px, 40vw" className="w-2/5 shrink-0 sm:w-[38%]" />
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryChip post={post} />
        </div>
        <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-brand-navy-deep">
          <SmartLink href={post.url} className="after:absolute after:inset-0 hover:text-brand-blue">
            {post.title}
          </SmartLink>
        </h3>
        <div className="mt-auto pt-3">
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  )
}
