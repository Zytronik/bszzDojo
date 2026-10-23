import type { HealthStatus } from '@bszz-dojo/shared';

export class HealthResponse implements HealthStatus {
  /** @example 'ok' */
  status: 'ok';

  /** ISO 8601 timestamp */
  timestamp: string;
}
