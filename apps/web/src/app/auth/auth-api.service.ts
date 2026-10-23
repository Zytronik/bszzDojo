import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthSession, LoginRequest, RegisterRequest } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../core/api-url';

/** `withCredentials` so the refresh token cookie is sent and stored. */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(apiUrl('auth/login'), credentials, { withCredentials: true }),
    );
  }

  register(request: RegisterRequest): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(apiUrl('auth/register'), request, { withCredentials: true }),
    );
  }

  refresh(): Promise<AuthSession> {
    return firstValueFrom(
      this.http.post<AuthSession>(apiUrl('auth/refresh'), null, { withCredentials: true }),
    );
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post(apiUrl('auth/logout'), null, { withCredentials: true }));
  }
}
