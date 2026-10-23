import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { BadgeRequestEntity } from '../badges/badge-request.entity';
import { BadgeEntity } from '../badges/badge.entity';
import { UserEntity } from '../users/user.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, BadgeEntity, BadgeRequestEntity]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
