import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from '../users/user.entity';
import { DuelEndEntity } from './duel-end.entity';
import { DuelEntity } from './duel.entity';
import { DuelsController } from './duels.controller';
import { DuelsService } from './duels.service';

@Module({
  imports: [TypeOrmModule.forFeature([DuelEntity, DuelEndEntity, UserEntity]), AuthModule],
  controllers: [DuelsController],
  providers: [DuelsService],
  // The profiles show each archer's duels.
  exports: [DuelsService],
})
export class DuelsModule {}
