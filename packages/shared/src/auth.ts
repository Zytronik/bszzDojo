import type { UserSettings } from './settings';

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
/** Letters (including umlauts), digits, spaces, `.`, `_` and `-`; starts with a letter or digit. */
export const USERNAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} ._-]*$/u;
export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt ignores everything after 72 bytes. */
export const PASSWORD_MAX_LENGTH = 72;
export const EMAIL_MAX_LENGTH = 254;
/** Deliberately loose: the real check is whether the reset mail arrives. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** German messages for invalid account fields, the same in the forms and from the API. */
export const ACCOUNT_FIELD_ERRORS = {
  username: `Der Benutzername muss ${USERNAME_MIN_LENGTH}–${USERNAME_MAX_LENGTH} Zeichen lang sein und darf nur Buchstaben, Zahlen, Leerzeichen, ".", "_" und "-" enthalten.`,
  email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
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
  email: string;
  password: string;
}

/** Body of `POST /api/auth/forgot-password` */
export interface ForgotPasswordRequest {
  email: string;
}

/** Body of `POST /api/auth/reset-password`; the token comes from the link in the mail. */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** The logged-in user's own account. */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  settings: UserSettings;
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
  return value.trim().replace(/\s+/g, ' ');
}

export function usernameKey(value: string): string {
  return normalizeUsername(value).toLocaleLowerCase('de-CH');
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidUsername(value: string): boolean {
  const username = normalizeUsername(value);
  return (
    username.length >= USERNAME_MIN_LENGTH &&
    username.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(username)
  );
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  return email.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(email);
}

export function isValidPassword(value: string): boolean {
  return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH;
}
