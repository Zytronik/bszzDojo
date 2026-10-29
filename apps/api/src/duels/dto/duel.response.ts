import {
  BOW_TYPE_IDS,
  DUEL_FORMATS,
  DUEL_STATUSES,
  TARGET_SIZES,
  type BowTypeId,
  type Duel,
  type DuelArrow,
  type DuelFormat,
  type DuelList,
  type DuelPlayer,
  type DuelRecord,
  type DuelSide,
  type DuelStatus,
  type DuelSummary,
  type ProfileDuels,
  type SidePair,
  type TargetSize,
  type UserName,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { ShotResponse } from '../../scores/dto/score.response';

const SIDES: DuelSide[] = ['challenger', 'opponent'];

export class DuelArrowResponse implements DuelArrow {
  /** 0 (a miss) to 10 */
  points: number;

  /** The inner 10 */
  x: boolean;

  /** Where it hit, when entered on the target */
  @ApiProperty({ type: ShotResponse, nullable: true })
  shot: ShotResponse | null;
}

export class DuelPlayerResponse implements DuelPlayer {
  username: string;

  @ApiProperty({ type: String, nullable: true })
  displayName: string | null;

  /** `null` while the opponent hasn't accepted */
  @ApiProperty({ enum: BOW_TYPE_IDS, nullable: true })
  bowType: BowTypeId | null;

  /** The ends both have shot, plus the viewer's own next one: 3 `DuelArrow`s each */
  @ApiProperty({ type: 'array', items: { type: 'array', items: { type: 'object' } } })
  ends: DuelArrowResponse[][];

  shootOffs: DuelArrowResponse[];

  /** Has shot an end the viewer hasn't yet; its arrows stay hidden until then */
  ahead: boolean;
}

class DuelSettingsResponse {
  @ApiProperty({ enum: DUEL_FORMATS })
  format: DuelFormat;

  /** Meters */
  distance: number;

  @ApiProperty({ enum: TARGET_SIZES })
  targetSize: TargetSize;

  isSpot: boolean;
}

export class DuelResponse extends DuelSettingsResponse implements Duel {
  id: string;

  @ApiProperty({ enum: DUEL_STATUSES })
  status: DuelStatus;

  /** The viewer's side, `null` for an archer who only watches */
  @ApiProperty({ enum: SIDES, nullable: true })
  you: DuelSide | null;

  challenger: DuelPlayerResponse;

  opponent: DuelPlayerResponse;

  @ApiProperty({ enum: SIDES, nullable: true })
  winner: DuelSide | null;

  /** Who gave up, if the duel ended that way */
  @ApiProperty({ enum: SIDES, nullable: true })
  forfeitedBy: DuelSide | null;

  /** ISO timestamp */
  createdAt: string;

  /** ISO timestamp of the last answer or end */
  updatedAt: string;
}

class UserNameResponse implements UserName {
  username: string;

  @ApiProperty({ type: String, nullable: true })
  displayName: string | null;
}

class SideScoreResponse implements SidePair<number> {
  challenger: number;

  opponent: number;
}

export class DuelSummaryResponse extends DuelSettingsResponse implements DuelSummary {
  id: string;

  @ApiProperty({ enum: DUEL_STATUSES })
  status: DuelStatus;

  /** The side of whose list this row is in */
  @ApiProperty({ enum: SIDES })
  you: DuelSide;

  /** The other archer */
  rival: UserNameResponse;

  /** Set points, or totals × 100 (× factor percent when the bows differ) */
  score: SideScoreResponse;

  /** An invitation to answer, or the next end to shoot */
  yourTurn: boolean;

  @ApiProperty({ enum: SIDES, nullable: true })
  winner: DuelSide | null;

  /** ISO timestamp */
  updatedAt: string;
}

export class DuelListResponse implements DuelList {
  /** Invitations to accept or decline */
  invitations: DuelSummaryResponse[];

  /** Sent and unanswered, and active */
  open: DuelSummaryResponse[];
}

export class DuelRecordResponse implements DuelRecord {
  wins: number;

  losses: number;
}

export class ProfileDuelsResponse implements ProfileDuels {
  record: DuelRecordResponse;

  /** The viewer's record against this archer; `null` on the viewer's own profile */
  @ApiProperty({ type: DuelRecordResponse, nullable: true })
  againstYou: DuelRecordResponse | null;

  /** Latest duels, from the profile owner's side */
  recent: DuelSummaryResponse[];
}
