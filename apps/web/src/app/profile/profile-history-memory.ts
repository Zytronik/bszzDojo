import { Injectable } from '@angular/core';
import { usernameKey, type ProfileHistory } from '@bszz-dojo/shared';

/**
 * The older rounds a profile had loaded with "Mehr laden" when it was left, so going back to it
 * (e.g. from one of those rounds) shows them again and can scroll to where it was.
 */
@Injectable({ providedIn: 'root' })
export class ProfileHistoryMemory {
  private readonly pages = new Map<string, ProfileHistory>();

  save(username: string, older: ProfileHistory | null): void {
    if (older) this.pages.set(usernameKey(username), older);
    else this.pages.delete(usernameKey(username));
  }

  /** Once: a later visit that isn't a return starts with the first page again. */
  take(username: string): ProfileHistory | null {
    const key = usernameKey(username);
    const older = this.pages.get(key) ?? null;
    this.pages.delete(key);
    return older;
  }
}
