import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'md' | 'sm';

type Common = { variant?: Variant; size?: Size; children: ReactNode; className?: string };
type AsLink = Common & { href: string; /** open in a new tab, e.g. the public website */ newTab?: boolean };
type AsButton = Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

/** CMS button. Pass `href` to render a link that looks like a button. */
export function Button(props: AsLink | AsButton) {
  const { variant = 'secondary', size = 'md', children, className } = props;
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
  if (props.href !== undefined) {
    // Links leaving the CMS (WhatsApp, phone, email, other sites) are plain links; web ones open in a new tab.
    if (/^(https?:|tel:|mailto:)/.test(props.href) || props.newTab) {
      const web = props.newTab || props.href.startsWith('http');
      return (
        <a href={props.href} className={classes} {...(web && { target: '_blank', rel: 'noopener noreferrer' })}>
          {children}
        </a>
      );
    }
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }
  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, type = 'button', ...rest } = props as AsButton;
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
