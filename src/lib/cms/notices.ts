// Messages shown after an action redirects (?notice=… or ?error=…). Only these codes are shown,
// so a crafted link cannot put arbitrary text on a CMS page.
export const NOTICES = {
  created: 'Draft created. Add photos and details, then publish.',
  published: 'Published. It is now on the website.',
  unpublished: 'Unpublished. It is hidden from the website and kept as a draft.',
  trashed: 'Moved to the trash. You can restore it from Trash.',
  restored: 'Restored as a draft. Publish it again when ready.',
  deleted: 'Deleted for good, with its photos and videos.',
  saved: 'Saved.',
  discarded: 'Unpublished changes thrown away. The editor shows what is live again.',
  'version-restored': 'That version is now in the draft. Check it, then publish to put it live.',
  'settings-saved': 'Settings saved. The website shows them now.',
  'status-new': 'Marked as new.',
  'email-sent': 'Email sent.',
  'status-contacted': 'Marked as contacted.',
  'status-closed': 'Closed. It stays in the inbox under “Closed”.',
  'deleted-category': 'Category deleted.',
  'deleted-collection': 'Collection deleted. The pieces in it were not touched.',
  'deleted-service': 'Service deleted. Its projects were kept; they no longer have a service.',
  'user-added': 'User added. Give them their email and password; they can change the password after logging in.',
  'password-set': 'Password changed. That user was logged out everywhere.',
  'own-password': 'Your password was changed. You were logged out on your other devices.',
  'user-off': 'User deactivated and logged out. They can no longer log in.',
  'user-on': 'User reactivated. They can log in again.',
} as const;

export const ERRORS = {
  'missing-title': 'Add an English name before publishing.',
  'missing-media': 'Add at least one photo or video before publishing.',
  'in-trash': 'Restore it from the trash first.',
  'not-found': 'It no longer exists. It may have been deleted in another window.',
  'email-failed': 'The email could not be sent. The reason is shown below.',
  'not-empty': 'This cannot be deleted while it still contains pieces. Move them to another category first.',
  'protected-service': 'The construction service cannot be deleted: the Construction page uses it. You can hide it instead.',
  'bad-email': 'Use a valid email address.',
  'bad-name': 'Add a name (at most 80 characters).',
  'short-password': 'Use a password of at least 10 characters (at most 200).',
  'email-taken': 'A user with this email already exists. Reset their password instead.',
  'wrong-password': 'Your current password is not correct.',
  'mismatch': 'The two new passwords are not the same.',
  'self': 'You cannot deactivate your own account.',
  'last-user': 'At least one active user must remain.',
} as const;

export type NoticeCode = keyof typeof NOTICES;
export type ErrorCode = keyof typeof ERRORS;

export function noticeFrom(params: Record<string, string | string[] | undefined>) {
  const notice = params.notice;
  const error = params.error;
  return {
    notice: typeof notice === 'string' && notice in NOTICES ? NOTICES[notice as NoticeCode] : null,
    error: typeof error === 'string' && error in ERRORS ? ERRORS[error as ErrorCode] : null,
  };
}
