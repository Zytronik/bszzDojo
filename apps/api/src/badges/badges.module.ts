import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BadgeRequestEntity } from './badge-request.entity';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';

@Module({
  imports: [TypeOrmModule.forFeature([BadgeRequestEntity]), AuthModule],
  controllers: [BadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}
