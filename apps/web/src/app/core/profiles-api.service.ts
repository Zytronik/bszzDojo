import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Profile, ProfileHistory, ProfileHistoryQuery } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ProfilesApiService {
  private readonly http = inject(HttpClient);

  get(username: string): Promise<Profile> {
    return firstValueFrom(
      this.http.get<Profile>(apiUrl(`profiles/${encodeURIComponent(username)}`)),
    );
  }

  history(username: string, offset: number): Promise<ProfileHistory> {
    const query: ProfileHistoryQuery = { offset };
    return firstValueFrom(
      this.http.get<ProfileHistory>(
        apiUrl(`profiles/${encodeURIComponent(username)}/history`),
        { params: { ...query } },
      ),
    );
  }
}
