import type { UserSettings } from './settings';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
/** Letters, digits, `.`, `_` and `-`: no spaces, so it works in profile URLs as it is. */
export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;
export const DISPLAY_NAME_MAX_LENGTH = 40;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt ignores everything after 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;

/** German messages for invalid account fields, the same in the forms and from the API. */
export const ACCOUNT_FIELD_ERRORS = {
  username: `Der Benutzername muss ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} Zeichen lang sein und darf nur Buchstaben, Zahlen, ".", "_" und "-" enthalten (keine Leerzeichen).`,
  displayName: `Der Anzeigename darf höchstens ${DISPLAY_NAME_MAX_LENGTH} Zeichen lang sein.`,
  password: `Das Passwort muss ${PASSWORD_MIN_LENGTH}–${PASSWORD_MAX_LENGTH} Zeichen lang sein.`,
} as const;

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Body of `POST /api/auth/login` */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Body of `POST /api/auth/register` */
export interface RegisterRequest {
  username: string;
  /** Shown instead of the username when set; empty or missing for none. */
  displayName?: string | null;
  password: string;
}

/** The logged-in user's own account. */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string | null;
  role: UserRole;
  settings: UserSettings;
}

/** Anyone shown in the app: identified by `username`, labelled with `shownName`. */
export interface UserName {
  /** For logging in and in profile URLs. */
  username: string;
  /** Optional; shown instead of the username when set. */
  displayName: string | null;
}

/**
 * Response of register, login and refresh. The refresh token is never in the
 * body: it's set as an httpOnly cookie scoped to `/api/auth`.
 */
export interface AuthSession {
  /** Short-lived JWT for `Authorization: Bearer`. */
  accessToken: string;
  user: UserProfile;
}

/** Confirmation text for actions without another result, shown to the user as is. */
export interface MessageResponse {
  message: string;
}

/** Error body NestJS returns for failed requests. */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export function normalizeUsername(value: string): string {
  return value.trim();
}

export function usernameKey(value: string): string {
  return normalizeUsername(value).toLowerCase();
}

/** Trimmed with inner whitespace collapsed; `null` when nothing is left. */
export function normalizeDisplayName(value: string | null | undefined): string | null {
  const name = (value ?? '').trim().replace(/\s+/g, ' ');
  return name.length > 0 ? name : null;
}

/** The name to show for a user: the display name if set, else the username. */
export function shownName(user: UserName): string {
  return user.displayName ?? user.username;
}

export function isValidUsername(value: string): boolean {
  const username = normalizeUsername(value);
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(username)
  );
}

export function isValidDisplayName(value: string | null | undefined): boolean {
  const name = normalizeDisplayName(value);
  return name === null || name.length <= DISPLAY_NAME_MAX_LENGTH;
}

export function isValidPassword(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}
