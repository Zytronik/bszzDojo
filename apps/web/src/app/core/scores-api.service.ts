import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Score, ScoreInput } from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ScoresApiService {
  private readonly http = inject(HttpClient);

  create(score: ScoreInput): Promise<Score> {
    return firstValueFrom(this.http.post<Score>(apiUrl('scores'), score));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(apiUrl(`scores/${id}`)));
  }
}
