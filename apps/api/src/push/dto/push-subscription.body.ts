import type { PushSubscriptionRequest, PushUnsubscribeRequest } from '@bszz-dojo/shared';
import { Type } from 'class-transformer';
import { IsString, IsUrl, Length, MaxLength, ValidateNested } from 'class-validator';

const ENDPOINT = 'Ungültige Push-Adresse.';
const KEYS = 'Ungültige Push-Schlüssel.';

export class PushKeysBody {
  /** The browser's P-256 public key, base64url */
  @IsString({ message: KEYS })
  @Length(80, 100, { message: KEYS })
  p256dh: string;

  /** The browser's auth secret, base64url */
  @IsString({ message: KEYS })
  @Length(16, 50, { message: KEYS })
  auth: string;
}

export class PushSubscriptionBody implements PushSubscriptionRequest {
  /** The push service URL the browser got; only the browsers' own push services are accepted. */
  @IsUrl({ protocols: ['https'], require_protocol: true }, { message: ENDPOINT })
  @MaxLength(1000, { message: ENDPOINT })
  endpoint: string;

  @ValidateNested()
  @Type(() => PushKeysBody)
  keys: PushKeysBody;
}

export class PushUnsubscribeBody implements PushUnsubscribeRequest {
  @IsString({ message: ENDPOINT })
  @MaxLength(1000, { message: ENDPOINT })
  endpoint: string;
}
