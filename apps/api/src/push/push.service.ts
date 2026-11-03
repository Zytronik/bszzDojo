import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import type { PushConfig, PushMessage, PushSubscriptionRequest } from '@bszz-dojo/shared';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { WebPushError, sendNotification, type RequestOptions } from 'web-push';
import { isPushEndpoint } from './push-endpoints';
import { PushSubscriptionEntity } from './push-subscription.entity';

/** How long a push service keeps a message for a device that's offline, in seconds */
const TIME_TO_LIVE = 12 * 60 * 60;
const REQUEST_TIMEOUT_MS = 5000;

type PushOutcome = 'sent' | 'gone' | 'failed';
type VapidDetails = NonNullable<RequestOptions['vapidDetails']>;

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  /** `null` without the VAPID env vars: then nothing is sent and the app offers no push. */
  private readonly vapid: VapidDetails | null;

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
    const payload = JSON.stringify(message);
    const outcomes = await Promise.all(
      targets.map((target) => this.sendTo(target, payload, vapid)),
    );
    const gone = targets.filter((_, index) => outcomes[index] === 'gone').map(({ id }) => id);
    if (gone.length > 0) await this.subscriptions.delete({ id: In(gone) });
  }

  /** `gone`: the browser unsubscribed or the subscription expired, so it's forgotten. */
  private async sendTo(
    target: PushSubscriptionEntity,
    payload: string,
    vapidDetails: VapidDetails,
  ): Promise<PushOutcome> {
    if (!isPushEndpoint(target.endpoint)) return 'gone';
    try {
      await sendNotification(
        { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
        payload,
        { vapidDetails, TTL: TIME_TO_LIVE, urgency: 'high', timeout: REQUEST_TIMEOUT_MS },
      );
      return 'sent';
    } catch (error: unknown) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        return 'gone';
      }
      this.logger.warn(`Push to ${new URL(target.endpoint).host} failed`);
      return 'failed';
    }
  }
}
