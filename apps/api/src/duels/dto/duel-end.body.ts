import {
  DUEL_ARROWS_PER_END,
  type DuelArrow,
  type DuelEndRequest,
} from '@bszz-dojo/shared';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ShotBody } from '../../scores/dto/score.body';

const ARROW = 'Ungültiger Pfeil.';
/** Shoot-offs go on while both are exactly as close to the center; this only bounds the column. */
const MAX_END_INDEX = 100;

export class DuelArrowBody implements DuelArrow {
  /** 0 (a miss) to 10 */
  @IsInt({ message: ARROW })
  @Min(0, { message: ARROW })
  @Max(10, { message: ARROW })
  points: number;

  /** The inner 10 */
  @IsBoolean({ message: ARROW })
  x: boolean;

  /** Where it hit, when entered on the target, else `null`; required in a shoot-off */
  @IsOptional()
  @ValidateNested()
  @Type(() => ShotBody)
  shot: ShotBody | null;
}

/** The arrows are checked against the duel and the archer's bow with the shared `duelEndErrors`. */
export class DuelEndBody implements DuelEndRequest {
  /** Which end (or shoot-off arrow) this is, from 0 */
  @IsInt({ message: 'Ungültige Passe.' })
  @Min(0, { message: 'Ungültige Passe.' })
  @Max(MAX_END_INDEX, { message: 'Ungültige Passe.' })
  index: number;

  @IsBoolean({ message: 'Ungültige Passe.' })
  shootOff: boolean;

  @IsArray({ message: 'Ungültige Passe.' })
  @ArrayMaxSize(DUEL_ARROWS_PER_END, { message: `Eine Passe hat ${DUEL_ARROWS_PER_END} Pfeile.` })
  @ValidateNested({ each: true })
  @Type(() => DuelArrowBody)
  arrows: DuelArrowBody[];
}
