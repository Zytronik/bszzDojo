import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BOW_TYPES, adjustedResult, isInnerTen, type ScoreDetail } from '@bszz-dojo/shared';
import { css } from 'styled-system/css';

interface Figure {
  label: string;
  value: string;
}

/** The result, how it compares to the archer's other rounds, and its key figures. */
@Component({
  selector: 'app-score-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="styles.hero">
      <span [class]="styles.total">{{ score().result }}</span>
      <div [class]="styles.comparison">
        @if (versusAverage(); as line) {
          <span [class]="line.better ? styles.better : ''">{{ line.text }}</span>
        }
        <span [class]="record().isRecord ? styles.record : ''">{{ record().text }}</span>
        @if (basis(); as basis) {
          <span [class]="styles.basis">{{ basis }}</span>
        }
      </div>
    </div>
    <dl [class]="figures().length % 3 === 0 ? styles.figures.thirds : styles.figures.halves">
      @for (figure of figures(); track figure.label) {
        <div [class]="styles.figure">
          <dt [class]="styles.label">{{ figure.label }}</dt>
          <dd [class]="styles.value">{{ figure.value }}</dd>
        </div>
      }
    </dl>
  `,
})
export class ScoreSummary {
  readonly score = input.required<ScoreDetail>();

  /** Compared with rounds of the same bow type, distance and arrow count */
  private readonly sameKind = computed(() => {
    const { bowType, distance, arrows } = this.score();
    return `${BOW_TYPES[bowType].name}, ${distance}m, ${arrows} Pfeile`;
  });

  protected readonly versusAverage = computed((): { text: string; better: boolean } | null => {
    const { result, comparison } = this.score();
    if (comparison.average === null) return null;
    const difference = result - comparison.average;
    if (difference === 0)
      return { text: `Genau im Schnitt (${comparison.average})`, better: false };
    return difference > 0
      ? { text: `+${difference} über dem Schnitt (${comparison.average})`, better: true }
      : { text: `−${-difference} unter dem Schnitt (${comparison.average})`, better: false };
  });

  protected readonly record = computed((): { text: string; isRecord: boolean } => {
    const { result, comparison } = this.score();
    if (comparison.best === null) {
      return { text: `Erster Score mit ${this.sameKind()}`, isRecord: false };
    }
    if (result > comparison.best) return { text: 'Persönlicher Rekord', isRecord: true };
    if (result === comparison.best) return { text: 'Gleich wie der Rekord', isRecord: true };
    return { text: `Rekord: ${comparison.best}`, isRecord: false };
  });

  protected readonly basis = computed(() => {
    const { rounds } = this.score().comparison;
    if (rounds === 0) return null;
    const scores = rounds === 1 ? 'einem anderen Score' : `${rounds} anderen Scores`;
    return `Verglichen mit ${scores} (${this.sameKind()})`;
  });

  protected readonly figures = computed((): Figure[] => {
    const score = this.score();
    const figures: Figure[] = [
      { label: 'pro Pfeil', value: (score.result / score.arrows).toFixed(1) },
    ];
    if (score.shots) {
      const xs = score.shots.filter((shot) => isInnerTen(shot, score.isSpot)).length;
      figures.push({ label: 'X', value: String(xs) });
    }
    figures.push(
      { label: '10er', value: String(score.tens) },
      { label: '9er', value: String(score.nines) },
    );
    if (score.shots) {
      // Outside the face is a miss: the shots that scored nothing.
      const misses = score.shots.filter((shot) => Math.hypot(shot.x, shot.y) >= 1).length;
      figures.push({ label: 'Fehlschüsse', value: String(misses) });
    }
    figures.push({
      label: 'mit Handicap',
      value: String(adjustedResult(score.result, score.bowType)),
    });
    return figures;
  });

  protected readonly styles = {
    hero: css({ display: 'flex', alignItems: 'center', gap: '15', flexWrap: 'wrap' }),
    total: css({ fontSize: '5xl', fontWeight: 'bold', color: 'accent.default' }),
    comparison: css({ display: 'flex', flexDir: 'column' }),
    better: css({ color: 'status.success' }),
    record: css({ color: 'medal.gold', fontWeight: 'bold' }),
    basis: css({ textStyle: 'body.small', layerStyle: 'muted' }),
    // Rows that come out even: six figures (with shots) in threes, four in twos.
    figures: {
      thirds: css({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10',
        marginBlockStart: '15',
        sm: { gridTemplateColumns: 'repeat(6, 1fr)' },
      }),
      halves: css({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10',
        marginBlockStart: '15',
        sm: { gridTemplateColumns: 'repeat(4, 1fr)' },
      }),
    },
    // The label comes first for screen readers, the value is shown on top.
    figure: css({
      layerStyle: 'surface',
      rounded: 'sm',
      p: '10',
      display: 'flex',
      flexDir: 'column-reverse',
      alignItems: 'center',
    }),
    value: css({ fontSize: 'xl', fontWeight: 'bold', m: '0' }),
    label: css({ textStyle: 'body.small', layerStyle: 'muted' }),
  };
}
