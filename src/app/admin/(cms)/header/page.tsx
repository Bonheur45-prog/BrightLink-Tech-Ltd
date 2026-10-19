import type { Metadata } from 'next';
import { DocEditorPage } from '../DocEditorPage';

export const metadata: Metadata = { title: 'Header' };

export default function HeaderPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <DocEditorPage kind="header" searchParams={searchParams} />;
}
