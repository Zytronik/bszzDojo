import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileDuelsResponse } from '../duels/dto/duel.response';
import { DuelsService } from '../duels/duels.service';
import { ProfileHistoryQueryParams } from './dto/profile-history.query';
import { ProfileHistoryResponse } from './dto/profile-history.response';
import { ProfileResponse } from './dto/profile.response';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profiles: ProfilesService,
    private readonly duels: DuelsService,
  ) {}

  /** A user's public profile: stats, records, progress, placings and recent rounds. */
  @Get(':username')
  @ApiNotFoundResponse({ description: 'No user with that name' })
  get(@Param('username') username: string): Promise<ProfileResponse> {
    return this.profiles.profile(username);
  }

  /** Older rounds than the profile's history, newest first, a page at a time. */
  @Get(':username/history')
  @ApiNotFoundResponse({ description: 'No user with that name' })
  history(
    @Param('username') username: string,
    @Query() query: ProfileHistoryQueryParams,
  ): Promise<ProfileHistoryResponse> {
    return this.profiles.history(username, query.offset);
  }

  /** A user's duel record, the viewer's record against them, and their latest duels. */
  @Get(':username/duels')
  @ApiNotFoundResponse({ description: 'No user with that name' })
  duelsOf(
    @CurrentUser() user: AuthUser,
    @Param('username') username: string,
  ): Promise<ProfileDuelsResponse> {
    return this.duels.profile(user.id, username);
  }
}
