import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AcceptDuelBody } from './dto/accept-duel.body';
import { CreateDuelBody } from './dto/create-duel.body';
import { DuelEndBody } from './dto/duel-end.body';
import { DuelListResponse, DuelResponse } from './dto/duel.response';
import { DuelsService } from './duels.service';

@ApiTags('duels')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('duels')
export class DuelsController {
  constructor(private readonly duels: DuelsService) {}

  /** Challenges another archer; they see the invitation in their list. */
  @Post()
  @ApiBadRequestResponse({ description: 'Invalid settings, or challenging oneself' })
  @ApiNotFoundResponse({ description: 'No user with that name' })
  @ApiConflictResponse({ description: 'The two already have an open duel' })
  create(@CurrentUser() user: AuthUser, @Body() body: CreateDuelBody): Promise<DuelResponse> {
    return this.duels.create(user.id, body);
  }

  /** The logged-in user's invitations and open duels, polled by the app. */
  @Get()
  list(@CurrentUser() user: AuthUser): Promise<DuelListResponse> {
    return this.duels.list(user.id);
  }

  /** A duel, polled every few seconds while it's shot. */
  @Get(':id')
  @ApiNotFoundResponse({ description: 'No such duel' })
  get(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DuelResponse> {
    return this.duels.get(user.id, id);
  }

  /** The challenged archer accepts with the bow they shoot. */
  @Post(':id/accept')
  @HttpCode(200)
  @ApiForbiddenResponse({ description: 'Not the challenged archer' })
  @ApiConflictResponse({ description: 'The invitation is no longer open' })
  accept(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: AcceptDuelBody,
  ): Promise<DuelResponse> {
    return this.duels.accept(user.id, id, body);
  }

  @Post(':id/decline')
  @HttpCode(200)
  @ApiForbiddenResponse({ description: 'Not the challenged archer' })
  @ApiConflictResponse({ description: 'The invitation is no longer open' })
  decline(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DuelResponse> {
    return this.duels.decline(user.id, id);
  }

  /** The challenger withdraws an unanswered invitation. */
  @Post(':id/cancel')
  @HttpCode(200)
  @ApiForbiddenResponse({ description: 'Not the challenger' })
  @ApiConflictResponse({ description: 'The invitation is no longer open' })
  cancel(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DuelResponse> {
    return this.duels.cancel(user.id, id);
  }

  /** Gives up an active duel; the other archer wins. */
  @Post(':id/forfeit')
  @HttpCode(200)
  @ApiForbiddenResponse({ description: 'Not one of the two archers' })
  @ApiConflictResponse({ description: 'The duel is not active' })
  forfeit(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DuelResponse> {
    return this.duels.forfeit(user.id, id);
  }

  /** The archer's next end, or shoot-off arrow. Sending the same one again changes nothing. */
  @Post(':id/ends')
  @HttpCode(200)
  @ApiBadRequestResponse({ description: 'Invalid arrows, or not the next end' })
  @ApiForbiddenResponse({ description: 'Not one of the two archers' })
  @ApiConflictResponse({
    description: 'Not active, already decided, wrong phase, or waiting for the other archer',
  })
  submitEnd(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: DuelEndBody,
  ): Promise<DuelResponse> {
    return this.duels.submitEnd(user.id, id, body);
  }
}
