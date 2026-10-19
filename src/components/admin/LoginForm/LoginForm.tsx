'use client';

import { useActionState } from 'react';
import { ConfirmButton } from '@/components/admin/ConfirmButton/ConfirmButton';
import { Field, TextInput } from '@/components/admin/Field/Field';
import { Notice } from '@/components/admin/Notice/Notice';
import type { LoginState } from '@/app/admin/login/actions';
import styles from './LoginForm.module.css';

type Props = { action: (state: LoginState, formData: FormData) => Promise<LoginState> };

export function LoginForm({ action }: Props) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={styles.form} noValidate>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Email" htmlFor="email">
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          required
          autoFocus
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <TextInput id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <ConfirmButton variant="primary" pendingText="Logging in…" className={styles.submit}>
        Log in
      </ConfirmButton>
    </form>
  );
}
