import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import '@/styles/admin-tokens.css';
import '@/styles/admin.css';
import { allFontVariables } from '@/styles/fonts';

const adminFont = Inter({ subsets: ['latin'], variable: '--font-admin-loaded', display: 'swap' });

// Root layout for the CMS (the public site has its own under (frontend)). English only.
export const metadata: Metadata = {
  title: { default: 'Content manager', template: '%s | Content manager' },
  robots: { index: false, follow: false },
};

// Everything in the CMS is per-user and always fresh.
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${adminFont.variable} ${allFontVariables}`}>
      <body>{children}</body>
    </html>
  );
}
