import { Body, Controller, Delete, Get, HttpCode, Put, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PushConfigResponse } from './dto/push-config.response';
import { PushSubscriptionBody, PushUnsubscribeBody } from './dto/push-subscription.body';
import { PushService } from './push.service';

@ApiTags('push')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('push')
export class PushController {
  constructor(private readonly push: PushService) {}

  /** The key browsers subscribe with, or `null` when the server sends no push messages. */
  @Get('config')
  config(): PushConfigResponse {
    return this.push.config();
  }

  /** Push messages for the logged-in user to this browser (duel invitations, ends, results). */
  @Put('subscription')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ description: "Not a browser's push service, or invalid keys" })
  subscribe(@CurrentUser() user: AuthUser, @Body() body: PushSubscriptionBody): Promise<void> {
    return this.push.subscribe(user.id, body);
  }

  /** No more push messages to this browser; unknown endpoints change nothing. */
  @Delete('subscription')
  @HttpCode(204)
  @ApiNoContentResponse()
  unsubscribe(@CurrentUser() user: AuthUser, @Body() body: PushUnsubscribeBody): Promise<void> {
    return this.push.unsubscribe(user.id, body.endpoint);
  }
}
