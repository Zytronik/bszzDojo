import {
  BOW_TYPE_IDS,
  TARGET_SIZES,
  type ArcherySetup,
  type BowTypeId,
  type TargetSize,
  type Theme,
  type UserSettings,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';

export class ArcherySetupResponse implements ArcherySetup {
  @ApiProperty({ enum: BOW_TYPE_IDS })
  bowType: BowTypeId;

  /**
   * Meters
   * @example 18
   */
  distance: number;

  @ApiProperty({ enum: TARGET_SIZES })
  targetSize: TargetSize;

  /** @example true */
  isSpot: boolean;
}

export class UserSettingsResponse implements UserSettings {
  /** @example 'dark' */
  theme: Theme;

  /** What new rounds and duels start from; null until one is picked */
  setup: ArcherySetupResponse | null;

  /** The last setups used, newest first, the current one included */
  recentSetups: ArcherySetupResponse[];
}
