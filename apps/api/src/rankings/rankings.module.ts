import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BadgeEntity } from '../badges/badge.entity';
import { PushModule } from '../push/push.module';
import { ScoreEntity } from '../scores/score.entity';
import { CronController } from './cron.controller';
import { MonthEndService } from './month-end.service';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreEntity, BadgeEntity]), AuthModule, PushModule],
  controllers: [RankingsController, CronController],
  providers: [RankingsService, MonthEndService],
})
export class RankingsModule {}
