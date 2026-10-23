import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RankingsResponse } from './dto/rankings.response';
import { RankingsService } from './rankings.service';

@ApiTags('rankings')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@UseGuards(JwtAuthGuard)
@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankings: RankingsService) {}

  /** The dashboard's leaderboards: all time, this month and medals. */
  @Get()
  get(): Promise<RankingsResponse> {
    return this.rankings.rankings();
  }
}
