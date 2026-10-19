import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Field.module.css';

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

/** Label + control + hint/error. The control must use the same id as `htmlFor`. */
export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className={styles.field} data-invalid={error ? 'true' : undefined}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && <span className={styles.required}> (required)</span>}
      </label>
      {children}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria-describedby value linking a control to its Field hint and error. */
export function describedBy(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={[styles.control, props.className].filter(Boolean).join(' ')} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={5} {...props} className={[styles.control, styles.textarea, props.className].filter(Boolean).join(' ')} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={[styles.control, styles.select, props.className].filter(Boolean).join(' ')} />;
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; hint?: string };

export function Checkbox({ label, hint, ...props }: CheckboxProps) {
  return (
    <label className={styles.check}>
      <input type="checkbox" {...props} className={styles.checkbox} />
      <span>
        <span className={styles.checkLabel}>{label}</span>
        {hint && <span className={styles.checkHint}>{hint}</span>}
      </span>
    </label>
  );
}

/** Groups related fields under a heading. */
export function Fieldset({ legend, children, description }: { legend: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.stack}>{children}</div>
    </fieldset>
  );
}
