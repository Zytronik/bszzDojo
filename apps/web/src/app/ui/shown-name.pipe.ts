import { Pipe, type PipeTransform } from '@angular/core';
import { shownName, type UserName } from '@bszz-dojo/shared';

/** `{{ user | shownName }}`: the display name if set, else the username. */
@Pipe({ name: 'shownName' })
export class ShownNamePipe implements PipeTransform {
  transform(user: UserName | null | undefined): string {
    return user ? shownName(user) : '';
  }
}
