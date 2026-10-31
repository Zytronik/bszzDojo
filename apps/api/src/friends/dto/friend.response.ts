import { RANK_IDS, type Friend, type RankId } from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class FriendResponse implements Friend {
  /** @example 'robin_hood' */
  username: string;

  /**
   * Shown instead of the username when set.
   * @example 'Robin Hood'
   */
  displayName: string | null;

  /** Their club badge ("Abzeichen") */
  @ApiProperty({ enum: RANK_IDS, nullable: true })
  rank: RankId | null;
}
