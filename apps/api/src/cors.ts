/** Browser origins allowed to call the API, from `CORS_ORIGIN`. Production needs none: Vercel rewrites `/api` on the web origin. */
export function corsOrigins(): string[] {
  return (process.env['CORS_ORIGIN'] ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
