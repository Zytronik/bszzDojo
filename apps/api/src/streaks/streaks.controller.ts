import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingStreakResponse } from './dto/training-streak.response';
import { StreaksService } from './streaks.service';

@ApiTags('users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('users/me/streak')
export class StreaksController {
  constructor(private readonly streaks: StreaksService) {}

  /** The logged-in user's weeks in a row with a round or a duel end, for the dashboard. */
  @Get()
  get(@CurrentUser() user: AuthUser): Promise<TrainingStreakResponse> {
    return this.streaks.streak(user.id);
  }
}
