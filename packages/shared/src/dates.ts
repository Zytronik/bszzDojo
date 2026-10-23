/** The club's calendar: "today", "this month" and the leaderboards' months use this zone. */
export const CLUB_TIME_ZONE = 'Europe/Zurich';

/** A calendar day as `YYYY-MM-DD`, the format of `<input type="date">` and Postgres `date`. */
export type IsoDate = string;

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

export interface CalendarMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export function todayInClub(now: Date = new Date()): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CLUB_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function currentClubMonth(now: Date = new Date()): CalendarMonth {
  const [year, month] = todayInClub(now).split('-').map(Number);
  return { year: year ?? 1970, month: month ?? 1 };
}

/** First and last day of the month, inclusive. */
export function monthRange({ year, month }: CalendarMonth): { from: IsoDate; to: IsoDate } {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(lastDay).padStart(2, '0')}` };
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

/**
 * "Montag, 05. Januar 2024". Calendar days are formatted in UTC so they never shift; timestamps
 * (e.g. when an account was created) in the club's zone.
 */
export function formatGermanDate(value: IsoDate | Date): string {
  const isDay = typeof value === 'string' && ISO_DATE_PATTERN.test(value);
  const date = typeof value === 'string' ? new Date(isDay ? `${value}T00:00:00Z` : value) : value;
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: isDay ? 'UTC' : CLUB_TIME_ZONE,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
