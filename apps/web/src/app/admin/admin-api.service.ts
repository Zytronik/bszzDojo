import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AdminUser } from '@bszz-dojo/shared';
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
}
