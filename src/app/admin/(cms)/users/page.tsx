import type { Metadata } from 'next';
import { Button } from '@/components/admin/Button/Button';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Field, Fieldset, TextInput } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import { PageHeader } from '@/components/admin/PageHeader/PageHeader';
import { PASSWORD_MIN_LENGTH } from '@/lib/auth/password';
import { requireUser } from '@/lib/auth/session';
import { noticeFrom } from '@/lib/cms/notices';
import { prisma } from '@/lib/db';
import { addUser, changeOwnPassword, setUserActive, setUserPassword } from './actions';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Users' };

const dateTime = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Kigali' });

/** CMS logins: your own password, everyone's accounts, and adding a new user. */
export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireUser();
  const [users, query] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }], select: { id: true, name: true, email: true, active: true, lastLoginAt: true, createdAt: true } }),
    searchParams,
  ]);
  const { notice, error } = noticeFrom(query);
  const pw = { type: 'password', minLength: PASSWORD_MIN_LENGTH, maxLength: 200, required: true, autoComplete: 'new-password' } as const;

  return (
    <>
      <PageHeader title="Users" description="Everyone who can log in to this content manager. Every user can manage everything." />
      {notice && <Notice tone="success">{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className={styles.grid}>
        <Fieldset legend="Your password" description={`Logged in as ${me.name} (${me.email}). Changing it logs you out on your other devices.`}>
          <form action={changeOwnPassword} className={styles.form}>
            <Field label="Current password" htmlFor="current">
              <TextInput id="current" name="current" type="password" required autoComplete="current-password" />
            </Field>
            <Field label="New password" htmlFor="password" hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}>
              <TextInput id="password" name="password" {...pw} />
            </Field>
            <Field label="New password again" htmlFor="confirm">
              <TextInput id="confirm" name="confirm" {...pw} />
            </Field>
            <Button type="submit" variant="primary">
              Change my password
            </Button>
          </form>
        </Fieldset>

        <Fieldset legend="Add a user" description="Choose a password for them and share it privately (not by email). They can change it after logging in.">
          <form action={addUser} className={styles.form}>
            <Field label="Name" htmlFor="new-name">
              <TextInput id="new-name" name="name" required maxLength={80} autoComplete="off" />
            </Field>
            <Field label="Email (used to log in)" htmlFor="new-email">
              <TextInput id="new-email" name="email" type="email" required maxLength={200} autoComplete="off" />
            </Field>
            <Field label="Password" htmlFor="new-password" hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}>
              <TextInput id="new-password" name="password" {...pw} />
            </Field>
            <Button type="submit" variant="primary">
              Add user
            </Button>
          </form>
        </Fieldset>
      </div>

      <h2 className={styles.heading}>All users</h2>
      <ul className={styles.list}>
        {users.map((u) => (
          <li key={u.id} className={styles.user} data-inactive={!u.active || undefined}>
            <div className={styles.who}>
              <p className={styles.name}>
                {u.name}
                {u.id === me.id && <span className={styles.tag}>You</span>}
                {!u.active && <span className={styles.tag}>Deactivated</span>}
              </p>
              <p className={styles.meta}>
                {u.email} · last login {u.lastLoginAt ? dateTime.format(u.lastLoginAt) : 'never'} · added {dateTime.format(u.createdAt)}
              </p>
            </div>
            <div className={styles.actions}>
              <details className={styles.reset}>
                <summary>Set a new password</summary>
                <form action={setUserPassword.bind(null, u.id)} className={styles.inline}>
                  <label className={styles.srOnly} htmlFor={`pw-${u.id}`}>
                    New password for {u.name}
                  </label>
                  <TextInput id={`pw-${u.id}`} name="password" placeholder={`New password (${PASSWORD_MIN_LENGTH}+ characters)`} {...pw} />
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </form>
              </details>
              {u.id !== me.id &&
                (u.active ? (
                  <form action={setUserActive.bind(null, u.id, false)}>
                    <ConfirmButton size="sm" variant="danger" confirm={`Deactivate ${u.name}? They are logged out and can no longer log in.`}>
                      Deactivate
                    </ConfirmButton>
                  </form>
                ) : (
                  <form action={setUserActive.bind(null, u.id, true)}>
                    <Button type="submit" size="sm">
                      Reactivate
                    </Button>
                  </form>
                ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
