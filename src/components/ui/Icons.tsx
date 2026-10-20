import type { JSX, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = (props: IconProps): IconProps => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
})

export const PhoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
)
export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
)
export const MenuIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)
export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)
export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)
export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)
export const ArrowRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const PauseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5v14M16 5v14" />
  </svg>
)
export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5Z" />
  </svg>
)

/* ---------------------------------------------------------------- social */
const FacebookIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V2h-2.5A4.5 4.5 0 0 0 10 6.5v2H7V12h3v10h4V12h2.7l.6-3.5Z" />
  </svg>
)
const LinkedinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10.5V16M8 7.6v.1M12 16v-5.5M12 13c0-1.5 1-2.5 2.2-2.5S16 11.400 16 13v3" />
  </svg>
)
const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16M20 4 4 20" />
  </svg>
)
const InstagramIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.500 6.500v.01" />
  </svg>
)
const YoutubeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2.500" y="5" width="19" height="14" rx="4" />
    <path d="m10 9 5 3-5 3Z" />
  </svg>
)
const TiktokIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3v11.500a3.500 3.500 0 1 1-3.500-3.500M14 3c.4 2.600 2 4.200 4.500 4.400" />
  </svg>
)
const WhatsappIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 21l1.600-4.700A8.500 8.500 0 1 1 8 19.400Z" />
    <path d="M9 9.500c0 3 2.500 5.500 5.500 5.500l1-1.500-2-1-1 .8a4 4 0 0 1-1.800-1.800l.8-1-1-2Z" />
  </svg>
)

const SOCIAL: Record<string, (p: IconProps) => JSX.Element> = {
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
}

export const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
}

export function SocialIcon({ platform, ...props }: IconProps & { platform: string }) {
  const Icon = SOCIAL[platform]
  return Icon ? <Icon {...props} /> : null
}

/* ---------------------------------------------------------------- content icons */
export const CodeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
  </svg>
)
export const GlobeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </svg>
)
export const MegaphoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l8 4V6L6 10H4a1 1 0 0 0-1 1Z" />
    <path d="M17.5 9a4 4 0 0 1 0 6M7 14l1 5h2.5l-1-4.5" />
  </svg>
)
export const HeadsetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="3" y="14" width="4" height="6" rx="1.5" />
    <rect x="17" y="14" width="4" height="6" rx="1.5" />
    <path d="M19 20a3 3 0 0 1-3 2h-3" />
  </svg>
)
export const SmartphoneIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18h2" />
  </svg>
)
export const BarChartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 20v-9M12 20V4M19 20v-6" />
  </svg>
)
export const NetworkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="5" r="2.5" />
    <circle cx="5" cy="19" r="2.5" />
    <circle cx="19" cy="19" r="2.5" />
    <path d="M12 7.5v4M12 11.5l-7 5M12 11.5l7 5" />
  </svg>
)
export const ShieldIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)
export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </svg>
)
export const RocketIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 15l-3-3c1-4 4-8 11-8 0 7-4 10-8 11Z" />
    <path d="M9 12H5l-2 2 4 1M12 15v4l-2 2-1-4" />
  </svg>
)
export const TargetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)
export const LightbulbIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
  </svg>
)
export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const MapPinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
)
export const ArrowUpRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m21 3-9 18-2.5-7.5L2 11ZM21 3 9.5 13.5" />
  </svg>
)

export const ICON_KEYS = () => Object.keys(BY_KEY)

const BY_KEY: Record<string, (p: IconProps) => JSX.Element> = {
  code: CodeIcon,
  globe: GlobeIcon,
  megaphone: MegaphoneIcon,
  headset: HeadsetIcon,
  smartphone: SmartphoneIcon,
  'bar-chart': BarChartIcon,
  network: NetworkIcon,
  shield: ShieldIcon,
  users: UsersIcon,
  rocket: RocketIcon,
  target: TargetIcon,
  lightbulb: LightbulbIcon,
  check: CheckIcon,
  clock: ClockIcon,
}

/** Draws the icon an editor picked in the CMS (falls back to a check mark). */
export function IconByKey({ name, ...props }: IconProps & { name: string }) {
  const Icon = BY_KEY[name] ?? CheckIcon
  return <Icon {...props} />
}
