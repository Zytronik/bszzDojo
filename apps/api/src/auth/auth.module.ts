import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { UserEntity } from '../users/user.entity';
import { AdminGuard } from './admin.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PasswordResetEntity } from './password-reset.entity';
import { RefreshTokenEntity } from './refresh-token.entity';
import { ACCESS_TOKEN_TTL_SECONDS, TokenService } from './token.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshTokenEntity, PasswordResetEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: ACCESS_TOKEN_TTL_SECONDS },
      }),
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtAuthGuard, AdminGuard],
  // AdminGuard reads the users table, so modules using it get the repository through this one.
  exports: [TokenService, JwtAuthGuard, AdminGuard, TypeOrmModule],
})
export class AuthModule {}
