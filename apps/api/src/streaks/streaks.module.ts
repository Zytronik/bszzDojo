import { Module } from '@nestjs/common';
import { StreaksService } from './streaks.service';

/** Only used by the profiles, which show everyone's streak */
@Module({
  providers: [StreaksService],
  exports: [StreaksService],
})
export class StreaksModule {}
