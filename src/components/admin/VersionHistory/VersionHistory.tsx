import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import type { VersionRow } from '@/lib/cms/drafts';
import styles from './VersionHistory.module.css';

const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' });

type Props = {
  versions: VersionRow[];
  /** Server action bound to the page: (versionId) => restore into the draft. */
  restore: (versionId: string) => Promise<void>;
  discard?: () => Promise<void>;
  hasUnpublishedChanges: boolean;
};

/** Every published version of a page; any of them can be copied back into the draft. */
export function VersionHistory({ versions, restore, discard, hasUnpublishedChanges }: Props) {
  return (
    <details className={styles.history}>
      <summary className={styles.summary}>
        Version history <span className={styles.count}>({versions.length} published {versions.length === 1 ? 'version' : 'versions'})</span>
      </summary>
      <div className={styles.body}>
        {hasUnpublishedChanges && discard && (
          <form action={discard} className={styles.discard}>
            <p>The draft has changes that are not live. Throw them away and go back to what visitors see now?</p>
            <ConfirmButton size="sm" variant="danger" confirm="Throw away all unpublished changes on this page?">
              Discard unpublished changes
            </ConfirmButton>
          </form>
        )}
        {versions.length === 0 ? (
          <p className={styles.muted}>Nothing has been published yet.</p>
        ) : (
          <ol className={styles.list}>
            {versions.map((v, i) => (
              <li key={v.id} className={styles.row}>
                <div>
                  <p className={styles.when}>
                    {when.format(v.createdAt)}
                    {i === 0 && <span className={styles.live}> · live now</span>}
                  </p>
                  <p className={styles.muted}>
                    {v.by ?? 'Someone'}
                    {v.note && `: ${v.note}`}
                  </p>
                </div>
                {i > 0 && (
                  <form action={restore.bind(null, v.id)}>
                    <ConfirmButton size="sm" confirm="Copy this version into the draft? Your current draft is replaced. Nothing changes on the website until you publish.">
                      Restore into draft
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </details>
  );
}
