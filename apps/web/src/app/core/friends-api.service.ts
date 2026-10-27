import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Friend } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class FriendsApiService {
  private readonly http = inject(HttpClient);

  list(): Promise<Friend[]> {
    return firstValueFrom(this.http.get<Friend[]>(apiUrl('users/me/friends')));
  }

  async add(username: string): Promise<void> {
    await firstValueFrom(
      this.http.put(apiUrl(`users/me/friends/${encodeURIComponent(username)}`), null),
    );
  }

  async remove(username: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(apiUrl(`users/me/friends/${encodeURIComponent(username)}`)),
    );
  }
}
