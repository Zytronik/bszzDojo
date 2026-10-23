import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Rankings } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class RankingsApiService {
  private readonly http = inject(HttpClient);

  get(): Promise<Rankings> {
    return firstValueFrom(this.http.get<Rankings>(apiUrl('rankings')));
  }
}
