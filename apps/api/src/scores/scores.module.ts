import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ScoreEntity } from './score.entity';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScoreEntity]), AuthModule],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}
