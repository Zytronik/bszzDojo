import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScoreBody } from './dto/score.body';
import { ScoreDetailResponse, ScoreResponse } from './dto/score.response';
import { ScoresService } from './scores.service';

@ApiTags('scores')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  /** Records a round for the logged-in user; with an `id` already recorded, returns that round. */
  @Post()
  @ApiBadRequestResponse({ description: 'German messages for every invalid field' })
  @ApiConflictResponse({ description: "The `id` belongs to someone else's round" })
  create(@CurrentUser() user: AuthUser, @Body() body: ScoreBody): Promise<ScoreResponse> {
    return this.scores.create(user.id, body);
  }

  /** Any archer's round, with how it compares to their other rounds. */
  @Get(':id')
  @ApiNotFoundResponse({ description: 'No such round' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<ScoreDetailResponse> {
    return this.scores.findOne(id);
  }

  /** Deletes one of the logged-in user's rounds. */
  @Delete(':id')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: "No such round, or it's someone else's" })
  delete(
    @CurrentUser() user: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.scores.delete(user.id, id);
  }
}
