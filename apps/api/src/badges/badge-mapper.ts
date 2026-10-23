import type { Badge } from '@bszz-dojo/shared';
import type { BadgeEntity } from './badge.entity';

export function toBadge(badge: BadgeEntity): Badge {
  return {
    id: badge.id,
    kind: badge.kind,
    place: badge.place,
    year: badge.year,
    bowType: badge.bowType,
    distance: badge.distance,
    location: badge.location,
    eventName: badge.eventName,
    team: badge.team,
    tournamentType: badge.tournamentType,
    ageCategory: badge.ageCategory,
  };
}
