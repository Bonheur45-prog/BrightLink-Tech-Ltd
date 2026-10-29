'use client';

import { mergeAttributes, Node, type JSONContent } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, FontFamily, TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, type ReactNode } from 'react';
import { MediaPicker } from '@/components/admin/MediaPicker/MediaPicker';
import { CALLOUT_TONES, HIGHLIGHTS, TEXT_COLORS } from '@/lib/blog/render';
import { FONTS } from '@/lib/fonts';
import styles from './RichEditor.module.css';

// The article editor. Admin only: visitors get the HTML rendered on save (src/lib/blog/render.ts),
// which accepts only what this editor can produce.

const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes: () => ({ tone: { default: 'info', parseHTML: (el) => el.getAttribute('data-tone') ?? 'info', renderHTML: (a) => ({ 'data-tone': a.tone }) } }),
  parseHTML: () => [{ tag: 'aside[data-tone]' }],
  renderHTML: ({ HTMLAttributes }) => ['aside', mergeAttributes(HTMLAttributes, { class: 'callout' }), 0],
});

/** Photos keep their media library id: the saved HTML is built from the library (sizes, alt text). */
const LibraryImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), mediaId: { default: null, parseHTML: (el) => el.getAttribute('data-media-id'), renderHTML: (a) => (a.mediaId ? { 'data-media-id': a.mediaId } : {}) } };
  },
});

function Tool({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: ReactNode; disabled?: boolean }) {
  return (
    <button type="button" className={styles.tool} aria-pressed={active ?? undefined} aria-label={label} title={label} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={on}>
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [picking, setPicking] = useState(false);
  const c = () => editor.chain().focus();
  const block = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : editor.isActive('heading', { level: 4 }) ? 'h4' : 'p';
  const font = (editor.getAttributes('textStyle').fontFamily as string | undefined)?.match(/--font-([a-z-]+)/)?.[1] ?? '';
  const inTable = editor.isActive('table');

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link address (a page like /our-services, or https://…). Leave empty to remove the link.', prev ?? '');
    if (url === null) return;
    if (!url.trim()) c().extendMarkRange('link').unsetLink().run();
    else c().extendMarkRange('link').setLink({ href: url.trim(), target: /^https?:/i.test(url.trim()) ? '_blank' : null }).run();
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
      <select
        className={styles.select}
        aria-label="Text style"
        value={block}
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'p') c().setParagraph().run();
          else c().setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
        }}
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading</option>
        <option value="h3">Sub-heading</option>
        <option value="h4">Small heading</option>
      </select>
      <Tool label="Bold" active={editor.isActive('bold')} on={() => c().toggleBold().run()}><b>B</b></Tool>
      <Tool label="Italic" active={editor.isActive('italic')} on={() => c().toggleItalic().run()}><i>I</i></Tool>
      <Tool label="Underline" active={editor.isActive('underline')} on={() => c().toggleUnderline().run()}><u>U</u></Tool>
      <Tool label="Strikethrough" active={editor.isActive('strike')} on={() => c().toggleStrike().run()}><s>S</s></Tool>
      <Tool label="Link" active={editor.isActive('link')} on={setLink}>🔗</Tool>
      <span className={styles.sep} />
      <Tool label="Bulleted list" active={editor.isActive('bulletList')} on={() => c().toggleBulletList().run()}>•≡</Tool>
      <Tool label="Numbered list" active={editor.isActive('orderedList')} on={() => c().toggleOrderedList().run()}>1≡</Tool>
      <Tool label="Quote" active={editor.isActive('blockquote')} on={() => c().toggleBlockquote().run()}>❝</Tool>
      <Tool label="Code" active={editor.isActive('codeBlock')} on={() => c().toggleCodeBlock().run()}>{'</>'}</Tool>
      <select
        className={styles.select}
        aria-label="Callout box"
        value=""
        onChange={(e) => {
          const tone = e.target.value;
          if (!tone) return;
          if (editor.isActive('callout')) c().lift('callout').run();
          if (tone !== 'remove') c().wrapIn('callout', { tone }).run();
        }}
      >
        <option value="">Box…</option>
        {CALLOUT_TONES.map((t) => (
          <option key={t} value={t}>{t === 'info' ? 'Note box' : t === 'tip' ? 'Tip box' : 'Warning box'}</option>
        ))}
        {editor.isActive('callout') && <option value="remove">Remove box</option>}
      </select>
      <Tool label="Line" on={() => c().setHorizontalRule().run()}>―</Tool>
      <Tool label="Photo from the media library" on={() => setPicking(true)}>🖼</Tool>
      {editor.isActive('image') && (
        <Tool
          label="Photo caption"
          on={() => {
            const t = window.prompt('Caption under the photo (optional)', (editor.getAttributes('image').title as string) ?? '');
            if (t !== null) c().updateAttributes('image', { title: t.trim() || null }).run();
          }}
        >
          Caption
        </Tool>
      )}
      <span className={styles.sep} />
      <Tool label="Insert table" on={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>▦</Tool>
      {inTable && (
        <>
          <Tool label="Add row" on={() => c().addRowAfter().run()}>+row</Tool>
          <Tool label="Add column" on={() => c().addColumnAfter().run()}>+col</Tool>
          <Tool label="Delete row" on={() => c().deleteRow().run()}>−row</Tool>
          <Tool label="Delete column" on={() => c().deleteColumn().run()}>−col</Tool>
          <Tool label="Delete table" on={() => c().deleteTable().run()}>✕table</Tool>
        </>
      )}
      <span className={styles.sep} />
      {(['left', 'center', 'right'] as const).map((a) => (
        <Tool key={a} label={`Align ${a}`} active={editor.isActive({ textAlign: a })} on={() => c().setTextAlign(a).run()}>
          {a === 'left' ? '⇤' : a === 'center' ? '↔' : '⇥'}
        </Tool>
      ))}
      <select className={styles.select} aria-label="Text colour" value={(editor.getAttributes('textStyle').color as string) ?? ''} onChange={(e) => (e.target.value ? c().setColor(e.target.value).run() : c().unsetColor().run())}>
        <option value="">Colour</option>
        {TEXT_COLORS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
      </select>
      <select className={styles.select} aria-label="Highlight" value="" onChange={(e) => (e.target.value === 'none' ? c().unsetHighlight().run() : e.target.value && c().setHighlight({ color: e.target.value }).run())}>
        <option value="">Highlight</option>
        {HIGHLIGHTS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
        <option value="none">No highlight</option>
      </select>
      <select className={styles.select} aria-label="Font" value={font} onChange={(e) => (e.target.value ? c().setFontFamily(`var(--font-${e.target.value})`).run() : c().unsetFontFamily().run())}>
        <option value="">Site font</option>
        {FONTS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
      </select>
      <span className={styles.sep} />
      <Tool label="Undo" disabled={!editor.can().undo()} on={() => c().undo().run()}>↶</Tool>
      <Tool label="Redo" disabled={!editor.can().redo()} on={() => c().redo().run()}>↷</Tool>
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(m) => {
          setPicking(false);
          if (m.thumbUrl) c().insertContent({ type: 'image', attrs: { src: m.thumbUrl, alt: m.alt, mediaId: m.id } }).run();
        }}
        title="Add a photo to the article"
      />
    </div>
  );
}

export default function RichEditor({ initial, onChange, label }: { initial: JSONContent; onChange: (doc: JSONContent) => void; label: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true, defaultProtocol: 'https' } }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LibraryImage.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Callout,
    ],
    content: initial,
    editorProps: { attributes: { class: styles.content, 'aria-label': label, role: 'textbox', 'aria-multiline': 'true' } },
    // ProseMirror builds node attributes with Object.create(null). A server action cannot receive such objects
    // as data (React sends them as placeholders and the server crashes reading them), so hand over plain JSON.
    onUpdate: ({ editor: e }) => onChange(JSON.parse(JSON.stringify(e.getJSON())) as JSONContent),
  });
  if (!editor) return <div className={styles.loading}>Loading the editor…</div>;
  return (
    <div className={styles.editor}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
