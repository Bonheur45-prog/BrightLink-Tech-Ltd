'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import styles from './LocaleTabs.module.css';

export type LocaleTab = { code: string; label: string; note?: string; hasError?: boolean; panel: ReactNode };

/**
 * One tab per language. Every panel stays in the page (hidden ones too), so all languages are
 * submitted together with the form. Arrow keys move between tabs.
 */
export function LocaleTabs({ tabs }: { tabs: LocaleTab[] }) {
  const id = useId();
  const [active, setActive] = useState(tabs[0]?.code ?? '');

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    if (next) {
      setActive(next.code);
      document.getElementById(`${id}-tab-${next.code}`)?.focus();
    }
  };

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label="Language" className={styles.list}>
        {tabs.map((tab, index) => (
          <button
            key={tab.code}
            id={`${id}-tab-${tab.code}`}
            type="button"
            role="tab"
            aria-selected={active === tab.code}
            aria-controls={`${id}-panel-${tab.code}`}
            tabIndex={active === tab.code ? 0 : -1}
            className={styles.tab}
            data-error={tab.hasError || undefined}
            onClick={() => setActive(tab.code)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {tab.label}
            {tab.hasError && <span className={styles.errorMark}> (needs attention)</span>}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.code}
          id={`${id}-panel-${tab.code}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${tab.code}`}
          hidden={active !== tab.code}
          className={styles.panel}
        >
          {tab.note && <p className={styles.note}>{tab.note}</p>}
          {tab.panel}
        </div>
      ))}
    </div>
  );
}
