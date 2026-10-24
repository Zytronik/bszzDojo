import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RANKS, type RankId } from '@bszz-dojo/shared';
import { rankBadge } from 'styled-system/recipes';

type RankBadgeSize = 'control' | 'inline';

/** Spelled out so Panda's static extraction sees every variant. */
const RANK_STYLES: Record<RankBadgeSize, Record<RankId, string>> = {
  control: {
    roteFeder: rankBadge({ rank: 'roteFeder' }),
    goldeneFeder: rankBadge({ rank: 'goldeneFeder' }),
    weisserPfeil: rankBadge({ rank: 'weisserPfeil' }),
    blauerPfeil: rankBadge({ rank: 'blauerPfeil' }),
    roterPfeil: rankBadge({ rank: 'roterPfeil' }),
    goldenerPfeil: rankBadge({ rank: 'goldenerPfeil' }),
  },
  inline: {
    roteFeder: rankBadge({ rank: 'roteFeder', size: 'inline' }),
    goldeneFeder: rankBadge({ rank: 'goldeneFeder', size: 'inline' }),
    weisserPfeil: rankBadge({ rank: 'weisserPfeil', size: 'inline' }),
    blauerPfeil: rankBadge({ rank: 'blauerPfeil', size: 'inline' }),
    roterPfeil: rankBadge({ rank: 'roterPfeil', size: 'inline' }),
    goldenerPfeil: rankBadge({ rank: 'goldenerPfeil', size: 'inline' }),
  },
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
  /** `control` next to inputs, `inline` next to a line of text */
  readonly size = input<RankBadgeSize>('control');

  protected readonly rank = computed(() => RANKS[this.rankId()]);
  protected readonly styles = computed(() => RANK_STYLES[this.size()][this.rankId()]);
}
