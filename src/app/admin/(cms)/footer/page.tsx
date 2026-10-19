import type { Metadata } from 'next';
import { DocEditorPage } from '../DocEditorPage';

export const metadata: Metadata = { title: 'Footer' };

export default function FooterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <DocEditorPage kind="footer" searchParams={searchParams} />;
}
