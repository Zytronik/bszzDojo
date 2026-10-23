import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  AdminUser,
  ApproveBadgeRequest,
  BadgeRequest,
  GiveBadgeRequest,
  MessageResponse,
  RemoveBadgeRequest,
  RemoveRankRequest,
  SetRankRequest,
} from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from '../core/api-url';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  users(): Promise<AdminUser[]> {
    return firstValueFrom(this.http.get<AdminUser[]>(apiUrl('admin/users')));
  }

  async deleteUser(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(apiUrl(`admin/users/${id}`)));
  }

  setRank(request: SetRankRequest): Promise<MessageResponse> {
    return firstValueFrom(this.http.put<MessageResponse>(apiUrl('admin/users/rank'), request));
  }

  removeRank(request: RemoveRankRequest): Promise<MessageResponse> {
    return firstValueFrom(
      this.http.post<MessageResponse>(apiUrl('admin/users/rank/remove'), request),
    );
  }

  badgeRequests(): Promise<BadgeRequest[]> {
    return firstValueFrom(this.http.get<BadgeRequest[]>(apiUrl('admin/badge-requests')));
  }

  approveBadgeRequest(id: string, request: ApproveBadgeRequest): Promise<MessageResponse> {
    return firstValueFrom(
      this.http.post<MessageResponse>(apiUrl(`admin/badge-requests/${id}/approve`), request),
    );
  }

  async rejectBadgeRequest(id: string): Promise<void> {
    await firstValueFrom(this.http.delete(apiUrl(`admin/badge-requests/${id}`)));
  }

  giveBadge(request: GiveBadgeRequest): Promise<MessageResponse> {
    return firstValueFrom(this.http.post<MessageResponse>(apiUrl('admin/badges'), request));
  }

  removeBadge(request: RemoveBadgeRequest): Promise<MessageResponse> {
    return firstValueFrom(this.http.post<MessageResponse>(apiUrl('admin/badges/remove'), request));
  }
}
