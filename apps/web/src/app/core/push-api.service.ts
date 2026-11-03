import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  PushConfig,
  PushSubscriptionRequest,
  PushUnsubscribeRequest,
} from '@bszz-dojo/shared';
import { firstValueFrom } from 'rxjs';
import { apiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class PushApiService {
  private readonly http = inject(HttpClient);

  config(): Promise<PushConfig> {
    return firstValueFrom(this.http.get<PushConfig>(apiUrl('push/config')));
  }

  async subscribe(subscription: PushSubscriptionRequest): Promise<void> {
    await firstValueFrom(this.http.put(apiUrl('push/subscription'), subscription));
  }

  async unsubscribe(body: PushUnsubscribeRequest): Promise<void> {
    await firstValueFrom(this.http.delete(apiUrl('push/subscription'), { body }));
  }
}
