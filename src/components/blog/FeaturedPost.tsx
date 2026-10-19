import { Reveal } from '@/components/ui/Reveal'
import { ArrowRightIcon } from '@/components/ui/Icons'
import { SmartLink } from '@/components/ui/SmartLink'
import type { BlogPost } from '@/lib/content/types'
import { CategoryChip, PostCover, PostMeta } from './PostCard'

/** The big "featured article" panel: picture on one side, headline on the other. */
export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <Reveal>
      <article className="group relative grid overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand-navy/15 ring-1 ring-brand-navy/10 lg:grid-cols-12">
        <PostCover post={post} sizes="(min-width: 1024px) 700px, 100vw" className="aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[26rem]" />
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:col-span-5">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-warm px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand-navy-deep">
            <span aria-hidden>★</span> Featured
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CategoryChip post={post} />
            <PostMeta post={post} />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-brand-navy-deep sm:text-3xl">
            <SmartLink href={post.url} className="after:absolute after:inset-0 hover:text-brand-blue">
              {post.title}
            </SmartLink>
          </h2>
          <p className="mt-4 line-clamp-4 text-lg leading-relaxed text-slate-600">{post.excerpt}</p>
          <p className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-blue">
            Read the article
            <ArrowRightIcon width={18} height={18} className="transition group-hover:translate-x-1.5" />
          </p>
        </div>
      </article>
    </Reveal>
  )
}
