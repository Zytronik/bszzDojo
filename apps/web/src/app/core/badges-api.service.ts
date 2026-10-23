import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { BadgeRequestInput, MessageResponse } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class BadgesApiService {
  private readonly http = inject(HttpClient);

  request(request: BadgeRequestInput): Promise<MessageResponse> {
    return firstValueFrom(this.http.post<MessageResponse>(apiUrl('badge-requests'), request));
  }
}
