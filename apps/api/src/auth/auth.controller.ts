import { Body, Controller, HttpCode, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { MessageResult } from '../common/message.response';
import { AuthService } from './auth.service';
import { AuthSessionResponse } from './dto/auth-session.response';
import { ForgotPasswordBody } from './dto/forgot-password.body';
import { LoginBody } from './dto/login.body';
import { RegisterBody } from './dto/register.body';
import { ResetPasswordBody } from './dto/reset-password.body';
import { clearRefreshCookie, readRefreshCookie, setRefreshCookie } from './refresh-cookie';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  /** Creates an account and logs in. Sets the refresh token cookie. */
  @Post('register')
  @ApiConflictResponse({ description: 'Username or email already used' })
  async register(
    @Body() body: RegisterBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const issued = await this.auth.register(body);
    setRefreshCookie(response, issued.refreshToken, this.config);
    return issued.session;
  }

  /** Sets the refresh token cookie. */
  @Post('login')
  @HttpCode(200)
  @ApiUnauthorizedResponse({ description: 'Wrong username or password' })
  async login(
    @Body() body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const issued = await this.auth.login(body);
    setRefreshCookie(response, issued.refreshToken, this.config);
    return issued.session;
  }

  /** New access token from the refresh token cookie, which is rotated. */
  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'No valid session' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthSessionResponse> {
    const refreshToken = readRefreshCookie(request);
    try {
      if (refreshToken === null) throw new UnauthorizedException('Nicht eingeloggt.');
      const issued = await this.auth.refresh(refreshToken);
      setRefreshCookie(response, issued.refreshToken, this.config);
      return issued.session;
    } catch (error: unknown) {
      clearRefreshCookie(response, this.config);
      throw error;
    }
  }

  /** Ends this device's session. */
  @Post('logout')
  @HttpCode(204)
  @ApiCookieAuth()
  @ApiNoContentResponse()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const refreshToken = readRefreshCookie(request);
    if (refreshToken !== null) await this.auth.logout(refreshToken);
    clearRefreshCookie(response, this.config);
  }

  /** Mails a reset link if an account uses that address; the answer is the same either way. */
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: ForgotPasswordBody): Promise<MessageResult> {
    await this.auth.requestPasswordReset(body.email);
    return {
      message:
        'Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen geschickt.',
    };
  }

  /** Sets a new password from a reset link and logs out every device. */
  @Post('reset-password')
  @HttpCode(200)
  @ApiUnauthorizedResponse({ description: 'Invalid or expired link' })
  async resetPassword(@Body() body: ResetPasswordBody): Promise<MessageResult> {
    await this.auth.resetPassword(body.token, body.password);
    return { message: 'Passwort erfolgreich zurückgesetzt. Du kannst dich jetzt einloggen.' };
  }
}
