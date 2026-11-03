import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  UpdateProfileRequest,
  UserProfile,
  UserSearchResult,
  UserSettings,
} from '@bszz-dojo/shared';
import { firstValueFrom, type Observable } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<UserSearchResult[]> {
    return this.http.get<UserSearchResult[]>(apiUrl('users/search'), { params: { q: query } });
  }

  updateMe(changes: UpdateProfileRequest): Promise<UserProfile> {
    return firstValueFrom(this.http.patch<UserProfile>(apiUrl('users/me'), changes));
  }

  saveSettings(settings: UserSettings): Promise<UserSettings> {
    return firstValueFrom(this.http.put<UserSettings>(apiUrl('users/me/settings'), settings));
  }
}
