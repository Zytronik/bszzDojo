import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProfileResponse } from './dto/profile.response';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  /** A user's public profile: stats, records, progress and recent rounds. */
  @Get(':username')
  @ApiNotFoundResponse({ description: 'No user with that name' })
  get(@Param('username') username: string): Promise<ProfileResponse> {
    return this.profiles.profile(username);
  }
}
