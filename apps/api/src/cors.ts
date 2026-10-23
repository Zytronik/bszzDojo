/** Browser origins allowed to call the API, from `CORS_ORIGIN`. On Vercel web and API share one domain, so none are needed. */
export function corsOrigins(): string[] {
  return (process.env['CORS_ORIGIN'] ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
