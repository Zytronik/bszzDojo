import {
  BOW_TYPE_IDS,
  TARGET_SIZES,
  type AcceptDuelRequest,
  type BowTypeId,
  type TargetSize,
} from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';

export class AcceptDuelBody implements AcceptDuelRequest {
  /** The opponent's bow; ends are compared with both bows' factors */
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS, { message: 'Ungültige Bogenart.' })
  bowType: BowTypeId;

  /** The opponent's face, cm */
  @ApiProperty({ enum: TARGET_SIZES })
  @IsIn(TARGET_SIZES, { message: 'Ungültige Scheibengrösse.' })
  targetSize: TargetSize;

  @IsBoolean({ message: 'Spot muss ja oder nein sein.' })
  isSpot: boolean;
}
