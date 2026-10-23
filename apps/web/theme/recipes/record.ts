import { defineSlotRecipe } from '@pandacss/dev';

/** A row in one of the lists: leaderboards, records, history, badges, users, requests. */
export const record = defineSlotRecipe({
  className: 'record',
  slots: ['root', 'rank', 'body', 'title', 'results', 'highlight', 'info', 'meta', 'actions', 'action'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      py: '10',
      layerStyle: 'divider',
      _first: { pt: '0' },
    },
    rank: { flexShrink: '0' },
    body: { flex: '1', minWidth: '0' },
    title: { overflowWrap: 'anywhere' },
    results: { mb: '5' },
    highlight: { color: 'accent.default' },
    info: {},
    meta: { textStyle: 'body.small', layerStyle: 'muted' },
    actions: { display: 'flex', gap: '10', flexShrink: '0' },
    action: {
      bg: 'transparent',
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      py: '10',
      pl: '10',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
    },
  },
});
