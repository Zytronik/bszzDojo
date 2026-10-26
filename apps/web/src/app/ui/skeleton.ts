import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { css, cx } from 'styled-system/css';
import { card, skeleton, split, tabs } from 'styled-system/recipes';

/**
 * - `rows`: one list row with `lines` 1–3 of text (title, details, date) and an optional `rank`
 * - `chart`: the progress chart's tabs and block; `bars`: a chart's block alone
 * - `heading`: a page title with a back button and a line of details (the score page)
 * - `summary`: a round's result panel and its six figures (`ScoreSummary`)
 * - `target`: the target with its end tabs next to the group analysis
 */
export type SkeletonShape = 'rows' | 'chart' | 'bars' | 'heading' | 'summary' | 'target';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "ghost() ? null : 'status'",
    '[attr.aria-busy]': 'ghost() ? null : true',
    '[attr.aria-hidden]': 'ghost() || null',
    '[class]': "ghost() ? ghostStyles : ''",
  },
  template: `
    @if (!ghost()) {
      <span [class]="srOnly">Wird geladen…</span>
    }
    @switch (shape()) {
      @case ('chart') {
        <div aria-hidden="true">
          <div [class]="tabStyles.list"><span [class]="styles.tab">18m</span></div>
          <div [class]="styles.chart"></div>
        </div>
      }
      @case ('bars') {
        <div [class]="styles.chart" aria-hidden="true"></div>
      }
      @case ('heading') {
        <div [class]="layout.heading" aria-hidden="true">
          <div [class]="layout.back"></div>
          <div [class]="layout.titles">
            <h1 [class]="styles.block">26. Oktober</h1>
            <p [class]="styles.block">Recurve · 18m</p>
          </div>
        </div>
      }
      @case ('summary') {
        <div aria-hidden="true">
          <div [class]="layout.panel">
            <span [class]="layout.total">000</span>
            <span [class]="layout.caption">Punkte</span>
          </div>
          <div [class]="layout.figures">
            @for (figure of figures; track figure) {
              <div [class]="layout.figure">
                <span [class]="layout.value">0</span>
                <span [class]="layout.caption">Pfeil</span>
              </div>
            }
          </div>
        </div>
      }
      @case ('target') {
        <div [class]="layout.split" aria-hidden="true">
          <div>
            <div [class]="tabStyles.list"><span [class]="styles.tab">Alle</span></div>
            <div [class]="styles.square"></div>
          </div>
          <div [class]="layout.facts">
            @for (fact of facts; track fact.title) {
              <div [class]="layout.fact">
                <p [class]="layout.factTitle">
                  <span [class]="layout.swatch"></span>{{ fact.title }}
                </p>
                <p>{{ fact.text }}</p>
              </div>
            }
          </div>
        </div>
      }
      @default {
        <div [class]="styles.row" aria-hidden="true">
          @if (rank()) {
            <div [class]="styles.rank"></div>
          }
          <div [class]="styles.body">
            <div [class]="styles.title"></div>
            @if (lines() > 1) {
              <div [class]="styles.line"></div>
            }
            @if (lines() > 2) {
              <div [class]="styles.meta"></div>
            }
          </div>
        </div>
      }
    }
  `,
})
export class Skeleton {
  readonly shape = input<SkeletonShape>('rows');
  readonly lines = input<1 | 2 | 3>(2);
  readonly rank = input(false);
  /** Invisible, only holding the space (see `LoadingFrame`). */
  readonly ghost = input(false);

  protected readonly styles = skeleton();
  protected readonly tabStyles = tabs();
  protected readonly figures = [1, 2, 3, 4, 5, 6];
  /** `GroupAnalysis`'s titles and typical texts, so the boxes wrap like the real ones */
  protected readonly facts = [
    { title: 'Lage der Gruppe', text: 'Im Schnitt 0.0 cm links und 0.0 cm hoch.' },
    {
      title: 'Streuung',
      text: 'Die Hälfte der Pfeile liegt innerhalb von 0.0 cm um den Treffpunkt.',
    },
    {
      title: 'Form der Gruppe',
      text: '00 von 00 Pfeilen liegen in einem Bereich von 0.0 cm Höhe und 0.0 cm Breite. Sie streuen eher in der Höhe.',
    },
  ];
  // The real elements' boxes and text styles, filled with the skeleton's color.
  protected readonly layout = {
    heading: css({
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: '15',
    }),
    back: cx(this.styles.block, css({ w: 'control', flexShrink: '0' })),
    titles: css({ display: 'flex', flexDir: 'column', alignItems: 'flex-end' }),
    panel: cx(card({ size: 'md' }), this.styles.block, css({ display: 'flex', flexDir: 'column' })),
    total: css({ fontSize: '5xl', fontWeight: 'bold' }),
    caption: css({ textStyle: 'body.small' }),
    figures: css({
      display: 'grid',
      gap: '10',
      marginBlockStart: '10',
      gridTemplateColumns: 'repeat(3, 1fr)',
      sm: { gridTemplateColumns: 'repeat(6, 1fr)' },
    }),
    figure: cx(
      card(),
      this.styles.block,
      css({ display: 'flex', flexDir: 'column', alignItems: 'center' }),
    ),
    value: css({ fontSize: 'xl', fontWeight: 'bold' }),
    split: split(),
    facts: css({ display: 'flex', flexDir: 'column', gap: '10' }),
    fact: cx(card(), this.styles.block),
    factTitle: css({
      display: 'flex',
      alignItems: 'center',
      gap: '8',
      textStyle: 'body.small',
      marginBlockEnd: '5',
    }),
    swatch: css({ w: 'textLine', h: 'textLine', flexShrink: '0' }),
  };
  protected readonly srOnly = css({ srOnly: true });
  protected readonly ghostStyles = css({ visibility: 'hidden', '& *': { animation: 'none' } });
}
