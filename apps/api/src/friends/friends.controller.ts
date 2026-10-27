import { Controller, Delete, Get, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FriendResponse } from './dto/friend.response';
import { FriendsService } from './friends.service';

@ApiTags('friends')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('users/me/friends')
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  /** The users the logged-in user added, sorted by their shown name. */
  @Get()
  list(@CurrentUser() user: AuthUser): Promise<FriendResponse[]> {
    return this.friends.list(user.id);
  }

  /** Adds a user as a friend; no confirmation, and adding them again changes nothing. */
  @Put(':username')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: 'The logged-in user themselves' })
  @ApiNotFoundResponse({ description: 'No such user' })
  add(@CurrentUser() user: AuthUser, @Param('username') username: string): Promise<void> {
    return this.friends.add(user.id, username);
  }

  /** Removes a friend; the other user isn't told. */
  @Delete(':username')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'No such user' })
  remove(@CurrentUser() user: AuthUser, @Param('username') username: string): Promise<void> {
    return this.friends.remove(user.id, username);
  }
}
