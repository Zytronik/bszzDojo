import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  BOW_TYPES,
  adjustedResult,
  isInnerTen,
  shotPoints,
  type ScoreDetail,
} from '@bszz-dojo/shared';
import { css, cx } from 'styled-system/css';
import { card } from 'styled-system/recipes';

interface Figure {
  label: string;
  value: string;
}

interface Reference {
  label: string;
  value: number;
  difference: string;
  better: boolean;
}

function signed(difference: number): string {
  if (difference === 0) return '±0';
  return difference > 0 ? `+${difference}` : `−${-difference}`;
}

const figureGrid = css({ display: 'grid', gap: '10', marginBlockStart: '10' });

/** The result, how it compares to the archer's other rounds, and its key figures. */
@Component({
  selector: 'app-score-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.panel">
      <div [class]="styles.result">
        <span [class]="styles.total">{{ score().result }}</span>
        @if (badge(); as badge) {
          <span [class]="styles.badge">{{ badge }}</span>
        } @else {
          <span [class]="styles.caption">Punkte</span>
        }
      </div>
      @if (references().length > 0) {
        <dl [class]="styles.references">
          @for (reference of references(); track reference.label) {
            <dt [class]="styles.caption">{{ reference.label }}</dt>
            <dd [class]="styles.reference">{{ reference.value }}</dd>
            <dd [class]="reference.better ? styles.better : styles.caption">
              {{ reference.difference }}
            </dd>
          }
        </dl>
      } @else {
        <p [class]="styles.caption">Erster Score mit {{ sameKind() }}</p>
      }
    </div>
    <dl [class]="figures().length % 3 === 0 ? styles.figures.thirds : styles.figures.halves">
      @for (figure of figures(); track figure.label) {
        <div [class]="styles.figure">
          <dt [class]="styles.caption">{{ figure.label }}</dt>
          <dd [class]="styles.value">{{ figure.value }}</dd>
        </div>
      }
    </dl>
  `,
})
export class ScoreSummary {
  readonly score = input.required<ScoreDetail>();

  protected readonly sameKind = computed(() => {
    const { bowType, distance, arrows } = this.score();
    return `${BOW_TYPES[bowType].name}, ${distance}m, ${arrows} Pfeile`;
  });

  protected readonly references = computed((): Reference[] => {
    const { result, comparison } = this.score();
    const references: Reference[] = [];
    for (const [label, value] of [
      ['Schnitt', comparison.average],
      ['Rekord', comparison.best],
    ] as const) {
      if (value === null) continue;
      references.push({
        label,
        value,
        difference: signed(result - value),
        better: result > value,
      });
    }
    return references;
  });

  protected readonly badge = computed(() => {
    const { result, comparison } = this.score();
    if (comparison.best === null) return null;
    if (result > comparison.best) return 'Persönlicher Rekord';
    return result === comparison.best ? 'Rekord egalisiert' : null;
  });

  protected readonly figures = computed((): Figure[] => {
    const score = this.score();
    const figures: Figure[] = [
      { label: 'pro Pfeil', value: (score.result / score.arrows).toFixed(1) },
    ];
    if (score.shots) {
      const xs = score.shots.filter((shot) => isInnerTen(shot, score.isSpot)).length;
      figures.push({ label: 'Xer', value: String(xs) });
    }
    figures.push(
      { label: '10er', value: String(score.tens) },
      { label: '9er', value: String(score.nines) },
    );
    if (score.shots) {
      const misses = score.shots.filter(
        (shot) => shotPoints(shot, score.isSpot, score.bowType) === 0,
      ).length;
      figures.push({ label: 'Misses', value: String(misses) });
    }
    figures.push({
      label: 'mit Faktor',
      value: String(adjustedResult(score.result, score.bowType)),
    });
    return figures;
  });

  protected readonly styles = {
    panel: cx(
      card({ size: 'md' }),
      css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20',
      }),
    ),
    result: css({ display: 'flex', flexDir: 'column' }),
    total: css({ fontSize: '5xl', fontWeight: 'bold', color: 'accent.default' }),
    caption: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    references: css({
      display: 'grid',
      gridTemplateColumns: 'auto auto auto',
      alignItems: 'baseline',
      columnGap: '15',
      rowGap: '5',
      '& dd': { m: '0', textAlign: 'end' },
    }),
    reference: css({ fontSize: 'xl', fontWeight: 'bold' }),
    better: css({ textStyle: 'body.small', color: 'status.success', fontWeight: 'bold' }),
    badge: css({ textStyle: 'body.small', color: 'medal.gold', fontWeight: 'bold' }),
    // Rows that come out even: six figures (with shots) in threes, four in twos.
    figures: {
      thirds: cx(
        figureGrid,
        css({
          gridTemplateColumns: 'repeat(3, 1fr)',
          sm: { gridTemplateColumns: 'repeat(6, 1fr)' },
        }),
      ),
      halves: cx(
        figureGrid,
        css({
          gridTemplateColumns: 'repeat(2, 1fr)',
          sm: { gridTemplateColumns: 'repeat(4, 1fr)' },
        }),
      ),
    },
    // The label comes first for screen readers, the value is shown on top.
    figure: cx(card(), css({ display: 'flex', flexDir: 'column-reverse', alignItems: 'center' })),
    value: css({ fontSize: 'xl', fontWeight: 'bold', m: '0' }),
  };
}
