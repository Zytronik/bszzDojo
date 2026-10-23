import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RANKS, type RankId } from '@bszz-dojo/shared';
import { rankBadge } from 'styled-system/recipes';

/** Spelled out so Panda's static extraction sees every variant. */
const RANK_STYLES: Record<RankId, string> = {
  roteFeder: rankBadge({ rank: 'roteFeder' }),
  goldeneFeder: rankBadge({ rank: 'goldeneFeder' }),
  weisserPfeil: rankBadge({ rank: 'weisserPfeil' }),
  blauerPfeil: rankBadge({ rank: 'blauerPfeil' }),
  roterPfeil: rankBadge({ rank: 'roterPfeil' }),
  goldenerPfeil: rankBadge({ rank: 'goldenerPfeil' }),
};

@Component({
  selector: 'app-rank-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles()" [title]="rank().name">
      <img [src]="'/img/ranks/' + rank().icon + '.png'" [alt]="rank().name" />
    </div>
  `,
})
export class RankBadge {
  readonly rankId = input.required<RankId>();

  protected readonly rank = computed(() => RANKS[this.rankId()]);
  protected readonly styles = computed(() => RANK_STYLES[this.rankId()]);
}
