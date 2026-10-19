'use client';

import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/admin/Button/Button';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Question shown before the form is submitted. Leave out to submit without asking. */
  confirm?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'md' | 'sm';
  pendingText?: string;
};

/** Submit button that can ask "Are you sure?" first, and shows when the form is busy. */
export function ConfirmButton({ confirm, pendingText, children, onClick, ...props }: Props) {
  const { pending } = useFormStatus();
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (confirm && !window.confirm(confirm)) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <Button type="submit" {...props} disabled={pending || props.disabled} aria-busy={pending || undefined} onClick={handleClick}>
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}
