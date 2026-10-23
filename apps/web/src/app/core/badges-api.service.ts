import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Badge, BadgeInput } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

/** The logged-in user's own placings ("Auszeichnungen"). */
@Injectable({ providedIn: 'root' })
export class BadgesApiService {
  private readonly http = inject(HttpClient);

  create(badge: BadgeInput): Promise<Badge> {
    return firstValueFrom(this.http.post<Badge>(apiUrl('users/me/badges'), badge));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(apiUrl(`users/me/badges/${id}`)));
  }
}
