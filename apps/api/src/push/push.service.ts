import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { PushConfig, PushMessage, PushSubscriptionRequest } from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { PushSubscriptionEntity } from './push-subscription.entity';
import { isPushEndpoint, sendPush, type VapidKeys } from './web-push';

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  /** `null` without the VAPID env vars: then nothing is sent and the app offers no push. */
  private readonly vapid: VapidKeys | null;

  constructor(
    @InjectRepository(PushSubscriptionEntity)
    private readonly subscriptions: Repository<PushSubscriptionEntity>,
    config: ConfigService,
  ) {
    const publicKey = config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY');
    const subject = config.get<string>('VAPID_SUBJECT');
    this.vapid = publicKey && privateKey && subject ? { publicKey, privateKey, subject } : null;
  }

  config(): PushConfig {
    return { publicKey: this.vapid?.publicKey ?? null };
  }

  /** A browser that was subscribed for someone else (another login on it) moves to this user. */
  async subscribe(userId: string, { endpoint, keys }: PushSubscriptionRequest): Promise<void> {
    if (!isPushEndpoint(endpoint)) throw new BadRequestException('Ungültige Push-Adresse.');
    const existing = await this.subscriptions.findOneBy({ endpoint });
    await this.subscriptions.save({
      id: existing?.id ?? randomUUID(),
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await this.subscriptions.delete({ userId, endpoint });
  }

  /**
   * To every browser of these users. Awaited by the caller, because a serverless function may be
   * frozen once its response is sent; failures are only logged, the action itself succeeded.
   */
  async send(userIds: readonly string[], message: PushMessage): Promise<void> {
    const vapid = this.vapid;
    if (!vapid || userIds.length === 0) return;
    const targets = await this.subscriptions.findBy({ userId: In([...userIds]) });
    const outcomes = await Promise.allSettled(
      targets.map((target) => sendPush(target, message, vapid)),
    );
    const gone: string[] = [];
    outcomes.forEach((outcome, index) => {
      const target = targets[index];
      if (!target) return;
      if (outcome.status === 'fulfilled' && outcome.value === 'gone') gone.push(target.id);
      else if (outcome.status === 'rejected' || outcome.value === 'failed') {
        this.logger.warn(`Push to ${new URL(target.endpoint).host} failed`);
      }
    });
    if (gone.length > 0) await this.subscriptions.delete({ id: In(gone) });
  }
}
