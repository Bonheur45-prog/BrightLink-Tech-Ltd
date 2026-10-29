'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Logo } from '@/components/ui/Logo'
import { SmartLink } from '@/components/ui/SmartLink'
import { useUi } from '@/components/i18n/useUi'
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  MailIcon,
  MenuIcon,
  PhoneIcon,
  SOCIAL_LABELS,
  SocialIcon,
} from '@/components/ui/Icons'
import type { HeaderData, MediaRef, NavItem, SocialLink } from '@/lib/content/types'
import { localeNames, localizeHref, type Locale } from '@/i18n/config'

type Props = {
  company: {
    name: string
    logo: MediaRef | null
    logoLight: MediaRef | null
    phone: string
    email: string
    socials: SocialLink[]
  }
  header: HeaderData
  locale: Locale
  enabledLocales: Locale[]
  heroEnabled: boolean
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export function HeaderShell({ company, header, locale, enabledLocales, heroEnabled }: Props) {
  const pathname = usePathname()
  const t = useUi()
  const routePath = pathname.replace(/^\/(fr|rw)(?=\/|$)/, '') || '/'
  // The same page in another language (plain addresses: the address alone decides the language).
  const localeHref = (target: Locale) => localizeHref(routePath, target)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const menuBtnRef = useRef<HTMLButtonElement>(null)

  // The header floats over the hero on the home page only; every other page gets a solid header.
  const overlay = routePath === '/' && header.transparentOnHero && heroEnabled
  const solid = !overlay || scrolled

  /* ---- scroll state */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- close menus when the page changes */
  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
  }, [pathname])

  /* ---- dropdown: outside click + Escape */
  useEffect(() => {
    if (openMenu === null) return
    const onPointer = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [openMenu])

  /* ---- mobile drawer: scroll lock, Escape, focus handling */
  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    menuBtnRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMobile()
    document.addEventListener('keydown', onKey)
    // Leaving the mobile breakpoint with the drawer open would trap scroll — close it.
    const mq = window.matchMedia('(min-width: 1024px)')
    const onMq = () => mq.matches && setMobileOpen(false)
    mq.addEventListener('change', onMq)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [mobileOpen, closeMobile])

  const isActive = (item: { url: string; children?: { url: string }[] }): boolean => {
    if (item.children?.length) return item.children.some((c) => isActive(c))
    if (!item.url || !item.url.startsWith('/')) return false
    return item.url === '/' ? routePath === '/' : routePath === item.url || routePath.startsWith(item.url + '/')
  }

  /* ---- top bar content */
  const { topBar } = header
  const showPhone = topBar.showPhone && company.phone
  const showEmail = topBar.showEmail && company.email
  const showSocials = topBar.showSocials && company.socials.length > 0
  const showTopBar = topBar.enabled && Boolean(topBar.message || showPhone || showEmail || showSocials)

  const position = overlay
    ? header.sticky
      ? 'fixed'
      : 'absolute'
    : header.sticky
      ? 'sticky'
      : 'relative'

  const linkTone = solid
    ? 'text-brand-navy-deep hover:text-brand-blue'
    : 'text-white hover:text-brand-yellow'

  return (
    <>
      <header
        className={`${position} inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          solid
            ? 'bg-white/95 shadow-[0_10px_30px_-14px_rgba(0,26,69,0.35)] backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        {/* ------------------------------------------------ top bar */}
        {showTopBar && (
          <div
            className={`hidden grid-rows-[1fr] transition-[grid-template-rows] duration-300 md:grid ${
              scrolled ? '!grid-rows-[0fr]' : ''
            }`}
          >
            <div className="overflow-hidden">
              <div
                className={`border-b text-[0.8rem] ${
                  overlay
                    ? 'border-white/10 bg-brand-navy-deep/45 text-white/85 backdrop-blur-sm'
                    : 'border-white/5 bg-brand-navy-deep text-white/85'
                }`}
              >
                <div className="container-x flex min-h-10 items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    {showPhone && (
                      <a href={telHref(company.phone)} className="inline-flex items-center gap-2 hover:text-brand-yellow">
                        <PhoneIcon width={15} height={15} />
                        {company.phone}
                      </a>
                    )}
                    {showEmail && (
                      <a href={`mailto:${company.email}`} className="inline-flex items-center gap-2 hover:text-brand-yellow">
                        <MailIcon width={15} height={15} />
                        {company.email}
                      </a>
                    )}
                    {topBar.message && <span className="text-white/90">{topBar.message}</span>}
                  </div>
                  {showSocials && (
                    <ul className="flex items-center gap-1" aria-label={t.socialMedia}>
                      {company.socials.map((s) => (
                        <li key={`${s.platform}-${s.url}`}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={SOCIAL_LABELS[s.platform] ?? s.platform}
                            className="grid size-8 place-items-center rounded-full transition hover:bg-white/10 hover:text-brand-yellow"
                          >
                            <SocialIcon platform={s.platform} width={16} height={16} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ main bar */}
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
          <SmartLink href="/" aria-label={`${company.name} — ${t.homeLink}`} className="shrink-0 rounded-lg">
            <Logo
              logo={company.logo}
              logoLight={company.logoLight}
              companyName={company.name}
              tone={solid ? 'default' : 'light'}
              priority
              className="h-10 sm:h-11 lg:h-12"
            />
          </SmartLink>

          {/* desktop navigation */}
          <nav ref={navRef} aria-label={t.mainNav} className="hidden lg:block">
            <ul className="flex items-center gap-1 xl:gap-2">
              {header.navItems.map((item, i) => {
                const active = isActive(item)
                const hasChildren = item.children.length > 0
                const underline =
                  'after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-brand-link after:transition-transform after:duration-300'
                const stateClass = active
                  ? 'after:scale-x-100'
                  : 'after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100'

                return (
                  <li
                    key={`${item.label}-${i}`}
                    className="relative"
                    onMouseEnter={() => hasChildren && setOpenMenu(i)}
                    onMouseLeave={() => hasChildren && setOpenMenu(null)}
                  >
                    {hasChildren ? (
                      <button
                        type="button"
                        aria-expanded={openMenu === i}
                        aria-haspopup="true"
                        onClick={() => setOpenMenu(openMenu === i ? null : i)}
                        className={`relative inline-flex items-center gap-1 rounded-md px-3 py-2 text-[0.95rem] font-medium transition-colors ${linkTone} ${underline} ${stateClass}`}
                      >
                        {item.label}
                        <ChevronDownIcon
                          width={16}
                          height={16}
                          className={`transition-transform duration-200 ${openMenu === i ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <SmartLink
                        href={item.url}
                        newTab={item.newTab}
                        aria-current={active ? 'page' : undefined}
                        className={`relative inline-flex rounded-md px-3 py-2 text-[0.95rem] font-medium transition-colors ${linkTone} ${underline} ${stateClass}`}
                      >
                        {item.label}
                      </SmartLink>
                    )}

                    {hasChildren && (
                      <div
                        className={`absolute left-1/2 top-full w-[min(42rem,calc(100vw-2rem))] -translate-x-1/2 pt-3 transition duration-200 ${
                          openMenu === i ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0'
                        }`}
                      >
                        <ul className="grid max-h-[calc(100dvh-6rem)] grid-cols-2 gap-1 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl shadow-slate-300/50 ring-1 ring-brand-blue/10">
                          {item.children.map((child) => (
                            <li key={`${child.label}-${child.url}`}>
                              <SmartLink
                                href={child.url}
                                tabIndex={openMenu === i ? 0 : -1}
                                className="block rounded-xl px-4 py-3 transition hover:bg-slate-50"
                              >
                                <span className="block text-[0.95rem] font-semibold text-brand-navy-deep">
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span className="mt-0.5 block text-sm text-slate-500">{child.description}</span>
                                )}
                              </SmartLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            {enabledLocales.length > 1 && (
              <nav aria-label={t.language} className="hidden items-center gap-1 lg:flex">
                {enabledLocales.map((target) => <a key={target} href={localeHref(target)} lang={target} aria-current={locale === target ? 'page' : undefined} className={`rounded-md px-2 py-1 text-xs font-semibold uppercase transition ${linkTone} ${locale === target ? 'underline underline-offset-4' : ''}`}>{target}</a>)}
              </nav>
            )}
            {header.cta && (
              <SmartLink
                href={header.cta.url}
                newTab={header.cta.newTab}
                className="btn btn-primary hidden min-h-11 px-5 text-sm lg:inline-flex"
              >
                {header.cta.label}
              </SmartLink>
            )}
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t.openMenu}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className={`grid size-11 place-items-center rounded-full border transition lg:hidden ${
                solid
                  ? 'border-brand-navy-deep/15 text-brand-navy-deep hover:bg-slate-100'
                  : 'border-white/30 text-white hover:bg-white/15'
              }`}
            >
              <MenuIcon width={22} height={22} />
            </button>
          </div>
        </div>

        {/* brand line: the logo's four colours, shown once the header is solid */}
        <div
          aria-hidden
          className={`h-0.5 bg-brand-link transition-opacity duration-300 ${solid ? 'opacity-100' : 'opacity-0'}`}
        />
      </header>

      {/* ---------------------------------------------------- mobile drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.menu}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        className={`fixed inset-0 z-[60] lg:hidden ${mobileOpen ? 'visible' : 'invisible delay-300'}`}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={t.closeMenu}
          onClick={closeMobile}
          className={`absolute inset-0 bg-brand-navy-deep/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-brand-navy-deep text-white shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex h-[4.5rem] shrink-0 items-center justify-between px-5">
            <Logo
              logo={company.logo}
              logoLight={company.logoLight}
              companyName={company.name}
              tone="light"
              className="h-10"
            />
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeMobile}
              aria-label={t.closeMenu}
              className="grid size-11 place-items-center rounded-full border border-white/25 transition hover:bg-white/10"
            >
              <CloseIcon width={22} height={22} />
            </button>
          </div>
          <div aria-hidden className="h-0.5 bg-brand-link" />

          <nav aria-label={t.mobileNav} className="flex-1 px-5 py-6">
            <ul className="space-y-1">
              {header.navItems.map((item: NavItem, i) => {
                const active = isActive(item)
                const hasChildren = item.children.length > 0
                const expanded = mobileExpanded === i
                const rowClass = `flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-display text-xl font-medium transition ${
                  active ? 'bg-white/10 text-brand-yellow' : 'text-white hover:bg-white/5'
                }`
                return (
                  <li key={`${item.label}-${i}`}>
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setMobileExpanded(expanded ? null : i)}
                          className={rowClass}
                        >
                          {item.label}
                          <ChevronDownIcon
                            width={20}
                            height={20}
                            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <div className={`grid transition-[grid-template-rows] duration-300 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                          <ul className="overflow-hidden pl-4">
                            {item.children.map((child) => (
                              <li key={`${child.label}-${child.url}`}>
                                <SmartLink
                                  href={child.url}
                                  tabIndex={expanded ? 0 : -1}
                                  className="block rounded-lg px-4 py-3 text-white/80 hover:text-brand-yellow"
                                >
                                  {child.label}
                                </SmartLink>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <SmartLink
                        href={item.url}
                        newTab={item.newTab}
                        aria-current={active ? 'page' : undefined}
                        className={rowClass}
                      >
                        {item.label}
                      </SmartLink>
                    )}
                  </li>
                )
              })}
            </ul>

            {enabledLocales.length > 1 && (
              <nav aria-label={t.language} className="mt-8 flex items-center gap-3 border-t border-white/10 pt-5">
                {enabledLocales.map((target) => <a key={target} href={localeHref(target)} lang={target} aria-current={locale === target ? 'page' : undefined} className={`rounded-lg px-3 py-2 text-sm font-semibold ${locale === target ? 'bg-white/10 text-brand-yellow' : 'text-white/75 hover:text-white'}`}>{localeNames[target]}</a>)}
              </nav>
            )}

            {header.cta && (
              <SmartLink href={header.cta.url} newTab={header.cta.newTab} className="btn btn-primary mt-6 w-full">
                {header.cta.label}
                <ArrowRightIcon width={18} height={18} />
              </SmartLink>
            )}
          </nav>

          {(company.phone || company.email || company.socials.length > 0) && (
            <div className="shrink-0 space-y-3 border-t border-white/10 px-5 py-6 text-sm text-white/80">
              {company.phone && (
                <a href={telHref(company.phone)} className="flex items-center gap-3 hover:text-brand-yellow">
                  <PhoneIcon width={18} height={18} /> {company.phone}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-brand-yellow">
                  <MailIcon width={18} height={18} /> {company.email}
                </a>
              )}
              {company.socials.length > 0 && (
                <ul className="flex gap-2 pt-1">
                  {company.socials.map((s) => (
                    <li key={`${s.platform}-${s.url}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={SOCIAL_LABELS[s.platform] ?? s.platform}
                        className="grid size-10 place-items-center rounded-full border border-white/20 transition hover:border-brand-yellow hover:text-brand-yellow"
                      >
                        <SocialIcon platform={s.platform} width={18} height={18} />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
