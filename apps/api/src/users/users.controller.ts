import { Body, Controller, Get, Patch, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileBody } from './dto/update-profile.body';
import { UserProfileResponse } from './dto/user-profile.response';
import { UserSearchQueryParams } from './dto/user-search.query';
import { UserSearchResultResponse } from './dto/user-search-result.response';
import { UserSettingsBody } from './dto/user-settings.body';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Usernames containing the query, for the search in the header. */
  @Get('search')
  search(@Query() query: UserSearchQueryParams): Promise<UserSearchResultResponse[]> {
    return this.users.search(query.q);
  }

  @Get('me')
  getMe(@CurrentUser() user: AuthUser): Promise<UserProfileResponse> {
    return this.users.getProfile(user.id);
  }

  /** Changes username, email and/or password; email and password need the current password. */
  @Patch('me')
  @ApiBadRequestResponse({ description: 'Invalid value or wrong current password' })
  @ApiConflictResponse({ description: 'Username or email already used' })
  updateMe(
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProfileBody,
  ): Promise<UserProfileResponse> {
    return this.users.updateProfile(user.id, body);
  }

  /** Replaces all settings of the logged-in user. */
  @Put('me/settings')
  updateSettings(
    @CurrentUser() user: AuthUser,
    @Body() body: UserSettingsBody,
  ): Promise<UserSettingsBody> {
    return this.users.updateSettings(user.id, body);
  }
}
