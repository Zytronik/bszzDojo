import type { MessageResponse } from '@bszz-dojo/shared';

export class MessageResult implements MessageResponse {
  /** German, shown to the user as is. */
  message: string;
}
