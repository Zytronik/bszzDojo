import type { ProfileHistoryQuery } from '@bszz-dojo/shared';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ProfileHistoryQueryParams implements ProfileHistoryQuery {
  /** Rounds to skip, newest first */
  @Type(() => Number)
  @IsInt({ message: 'Der Offset muss eine ganze Zahl ab 0 sein.' })
  @Min(0, { message: 'Der Offset muss eine ganze Zahl ab 0 sein.' })
  offset: number;
}
