import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { css } from 'styled-system/css';
import { FriendRow } from '../friends/friend-row';
import { FriendsStore } from '../friends/friends.store';
import { EmptyState } from '../ui/empty-state';
import { LoadingFrame } from '../ui/loading-frame';
import { PageTitle } from '../ui/page-title';
import { Section } from '../ui/section';

@Component({
  selector: 'app-friends-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageTitle, Section, LoadingFrame, EmptyState, FriendRow],
  templateUrl: './friends-page.html',
})
export class FriendsPage {
  protected readonly friends = inject(FriendsStore);
  protected readonly hintStyles = css({
    textStyle: 'body.small',
    layerStyle: 'muted',
    marginBlockStart: '15',
  });
}
