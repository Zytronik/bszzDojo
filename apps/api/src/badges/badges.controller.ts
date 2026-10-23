import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { BadgesService } from './badges.service';
import { BadgeBody } from './dto/badge.body';
import { BadgeResponse } from './dto/badge.response';

@ApiTags('badges')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('users/me/badges')
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  /** Records a placing for the logged-in user; no admin approval. */
  @Post()
  @ApiBadRequestResponse({ description: 'German messages for every invalid field' })
  create(@CurrentUser() user: AuthUser, @Body() body: BadgeBody): Promise<BadgeResponse> {
    return this.badges.create(user.id, body);
  }

  /** Deletes one of the logged-in user's placings. */
  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "No such placing, or it's someone else's" })
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.badges.delete(user.id, id);
  }
}
