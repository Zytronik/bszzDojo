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
import { ScoreBody } from './dto/score.body';
import { ScoreResponse } from './dto/score.response';
import { ScoresService } from './scores.service';

@ApiTags('scores')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('scores')
export class ScoresController {
  constructor(private readonly scores: ScoresService) {}

  /** Records a round for the logged-in user. */
  @Post()
  @ApiBadRequestResponse({ description: 'German messages for every invalid field' })
  create(@CurrentUser() user: AuthUser, @Body() body: ScoreBody): Promise<ScoreResponse> {
    return this.scores.create(user.id, body);
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
