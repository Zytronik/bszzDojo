import type { Badge, BadgeRequest } from '@bszz-dojo/shared';
import type { BadgeRequestEntity } from './badge-request.entity';
import type { BadgeEntity } from './badge.entity';

export function toBadge(badge: BadgeEntity): Badge {
  return { id: badge.id, name: badge.name, year: badge.year, place: badge.place };
}

/** Needs the `user` relation loaded. */
export function toBadgeRequest(request: BadgeRequestEntity): BadgeRequest {
  return {
    id: request.id,
    username: request.user.username,
    name: request.name,
    place: request.place,
    createdAt: request.createdAt.toISOString(),
  };
}
