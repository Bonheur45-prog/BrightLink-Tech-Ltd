import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm/LoginForm';
import { getCurrentUser } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/settings';
import { login } from './actions';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Log in' };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect('/admin');
  const settings = await getSiteSettings();

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>{settings.businessName}</p>
        <h1 className={styles.title}>Content manager</h1>
        <LoginForm action={login} />
        <p className={styles.help}>
          Forgot your password? Ask your developer to reset it.
        </p>
      </div>
    </main>
  );
}
