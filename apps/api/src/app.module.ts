import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { BadgesModule } from './badges/badges.module';
import { DuelsModule } from './duels/duels.module';
import { typeOrmOptions } from './database/typeorm-options';
import { ProfilesModule } from './profiles/profiles.module';
import { RankingsModule } from './rankings/rankings.module';
import { ScoresModule } from './scores/scores.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...typeOrmOptions(config.getOrThrow<string>('DATABASE_URL')),
        // Migrations run before the app starts (the build on Vercel, `npm run dev` locally),
        // never on a serverless cold start. One function instance serves many requests
        // (Fluid compute), so a small pool is enough and keeps Neon's connection count low.
        migrationsRun: false,
        extra: { max: 5 },
      }),
    }),
    AuthModule,
    UsersModule,
    ScoresModule,
    RankingsModule,
    ProfilesModule,
    BadgesModule,
    DuelsModule,
    AdminModule,
  ],
})
export class AppModule {}
