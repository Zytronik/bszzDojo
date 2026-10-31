import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AcceptDuelRequest,
  CreateDuelRequest,
  Duel,
  DuelEndRequest,
  DuelList,
  ProfileDuels,
} from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class DuelsApiService {
  private readonly http = inject(HttpClient);

  list(): Promise<DuelList> {
    return firstValueFrom(this.http.get<DuelList>(apiUrl('duels')));
  }

  get(id: string): Promise<Duel> {
    return firstValueFrom(this.http.get<Duel>(this.url(id)));
  }

  create(request: CreateDuelRequest): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(apiUrl('duels'), request));
  }

  accept(id: string, request: AcceptDuelRequest): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(this.url(id, 'accept'), request));
  }

  decline(id: string): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(this.url(id, 'decline'), {}));
  }

  cancel(id: string): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(this.url(id, 'cancel'), {}));
  }

  forfeit(id: string): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(this.url(id, 'forfeit'), {}));
  }

  submitEnd(id: string, request: DuelEndRequest): Promise<Duel> {
    return firstValueFrom(this.http.post<Duel>(this.url(id, 'ends'), request));
  }

  ofProfile(username: string): Promise<ProfileDuels> {
    return firstValueFrom(
      this.http.get<ProfileDuels>(apiUrl(`profiles/${encodeURIComponent(username)}/duels`)),
    );
  }

  private url(id: string, action?: string): string {
    const base = `duels/${encodeURIComponent(id)}`;
    return apiUrl(action ? `${base}/${action}` : base);
  }
}
