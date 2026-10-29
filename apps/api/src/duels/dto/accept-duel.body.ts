import { BOW_TYPE_IDS, type AcceptDuelRequest, type BowTypeId } from '@bszz-dojo/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class AcceptDuelBody implements AcceptDuelRequest {
  /** The opponent's bow; ends are compared with both bows' factors */
  @ApiProperty({ enum: BOW_TYPE_IDS })
  @IsIn(BOW_TYPE_IDS, { message: 'Ungültige Bogenart.' })
  bowType: BowTypeId;
}
