import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadgeRequestResponse } from '../badges/dto/badge.response';
import { MessageResult } from '../common/message.response';
import { AdminService } from './admin.service';
import {
  ApproveBadgeBody,
  GiveBadgeBody,
  RemoveBadgeBody,
  RemoveRankBody,
  SetRankBody,
} from './dto/admin.body';
import { AdminUserResponse } from './dto/admin-user.response';

@ApiTags('admin')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or expired access token' })
@ApiForbiddenResponse({ description: 'Not an admin' })
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('users')
  listUsers(): Promise<AdminUserResponse[]> {
    return this.admin.listUsers();
  }

  /** Deletes the account with all its rounds, badges and requests. */
  @Delete('users/:id')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'No such user' })
  deleteUser(
    @CurrentUser() admin: AuthUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.admin.deleteUser(admin.id, id);
  }

  /** Gives a user a club badge ("Abzeichen"), replacing the one they had. */
  @Put('users/rank')
  async setRank(@Body() body: SetRankBody): Promise<MessageResult> {
    await this.admin.setRank(body.username, body.rank);
    return { message: 'Abzeichen erfolgreich vergeben.' };
  }

  @Post('users/rank/remove')
  @HttpCode(200)
  async removeRank(@Body() body: RemoveRankBody): Promise<MessageResult> {
    await this.admin.setRank(body.username, null);
    return { message: 'Abzeichen erfolgreich entfernt.' };
  }

  /** Pending requests, oldest first. */
  @Get('badge-requests')
  listBadgeRequests(): Promise<BadgeRequestResponse[]> {
    return this.admin.listBadgeRequests();
  }

  /** Records the requested placing for the given year and closes the request. */
  @Post('badge-requests/:id/approve')
  @HttpCode(200)
  async approveBadgeRequest(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: ApproveBadgeBody,
  ): Promise<MessageResult> {
    await this.admin.approveBadgeRequest(id, body.year);
    return { message: 'Auszeichnung erfolgreich vergeben.' };
  }

  @Delete('badge-requests/:id')
  @HttpCode(204)
  @ApiNoContentResponse()
  rejectBadgeRequest(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.admin.rejectBadgeRequest(id);
  }

  /** Records a tournament placing ("Auszeichnung"). */
  @Post('badges')
  async giveBadge(@Body() body: GiveBadgeBody): Promise<MessageResult> {
    await this.admin.giveBadge(body);
    return { message: 'Auszeichnung erfolgreich vergeben.' };
  }

  @Post('badges/remove')
  @HttpCode(200)
  async removeBadge(@Body() body: RemoveBadgeBody): Promise<MessageResult> {
    await this.admin.removeBadge(body);
    return { message: 'Auszeichnung erfolgreich entfernt.' };
  }
}
