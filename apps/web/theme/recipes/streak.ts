import { defineSlotRecipe } from '@pandacss/dev';

/** The training streak on the dashboard: the flame, the weeks in a row and the last weeks */
export const streak = defineSlotRecipe({
  className: 'streak',
  slots: ['root', 'icon', 'count', 'status', 'weeks', 'week', 'best'],
  base: {
    root: {
      layerStyle: 'surface',
      rounded: 'sm',
      p: '15',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      alignItems: 'center',
      columnGap: '15',
      rowGap: '10',
    },
    icon: {
      fontSize: '5xl',
      layerStyle: 'muted',
      // Lit once this week is done; grey while the streak still needs this week's training.
      '[data-done] &': { color: 'accent.default', opacity: 'full' },
    },
    count: { m: '0', fontSize: '2xl', fontWeight: 'bold', lineHeight: 'snug' },
    status: { m: '0', layerStyle: 'muted' },
    weeks: {
      gridColumn: '1 / -1',
      display: 'flex',
      gap: '8',
      listStyle: 'none',
      m: '0',
      p: '0',
    },
    week: {
      w: 'dot',
      h: 'dot',
      rounded: 'full',
      bg: 'border.subtle',
      '&[data-trained]': { bg: 'accent.default' },
      // This week, still open while it isn't trained
      '&[data-current]': {
        outlineWidth: 'thick',
        outlineStyle: 'solid',
        outlineColor: 'fg.muted',
        outlineOffset: '2px',
      },
    },
    best: { gridColumn: '1 / -1', m: '0', textStyle: 'body.small', layerStyle: 'muted' },
  },
});
