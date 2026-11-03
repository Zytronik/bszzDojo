import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StreaksController } from './streaks.controller';
import { StreaksService } from './streaks.service';

@Module({
  imports: [AuthModule],
  controllers: [StreaksController],
  providers: [StreaksService],
  // Profiles show everyone's streak.
  exports: [StreaksService],
})
export class StreaksModule {}
