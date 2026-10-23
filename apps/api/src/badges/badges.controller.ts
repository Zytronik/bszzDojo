import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessageResult } from '../common/message.response';
import { BadgesService } from './badges.service';
import { BadgeRequestBody } from './dto/badge-request.body';

@ApiTags('badges')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('badge-requests')
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  /** Asks the admins to record a placing (tournaments the club has no results for). */
  @Post()
  async request(
    @CurrentUser() user: AuthUser,
    @Body() body: BadgeRequestBody,
  ): Promise<MessageResult> {
    await this.badges.request(user.id, body);
    return { message: 'Anfrage erfolgreich eingereicht.' };
  }
}
