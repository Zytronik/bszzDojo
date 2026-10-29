import type { ProfileHistory } from '@bszz-dojo/shared';
import { ScoreResponse } from '../../scores/dto/score.response';

export class ProfileHistoryResponse implements ProfileHistory {
  /** Newest first, `PROFILE_HISTORY_SIZE` at most */
  scores: ScoreResponse[];

  /** Whether there are older rounds still */
  hasMore: boolean;
}
