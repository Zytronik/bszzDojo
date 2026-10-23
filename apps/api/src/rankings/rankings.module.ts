import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ScoreEntity } from '../scores/score.entity';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreEntity]), AuthModule],
  controllers: [RankingsController],
  providers: [RankingsService],
})
export class RankingsModule {}
