import { defineSlotRecipe } from '@pandacss/dev';

/** A row in one of the lists: leaderboards, records, history, badges, users. */
export const record = defineSlotRecipe({
  className: 'record',
  slots: [
    'root',
    'rank',
    'body',
    'title',
    'results',
    'highlight',
    'info',
    'meta',
    'actions',
    'pending',
    'action',
  ],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      py: '10',
      layerStyle: 'divider',
      _first: { pt: '0' },
      // A round saved offline, until it's uploaded.
      '&[data-pending]': { opacity: 'pending' },
    },
    // Says it for screen readers; the dimmed row shows it.
    pending: { srOnly: true },
    rank: { flexShrink: '0' },
    body: {
      flex: '1',
      minWidth: '0',
      // A link to the row's detail page, like a score's.
      '&:is(a)': {
        transitionProperty: 'opacity',
        transitionDuration: 'normal',
        _hover: { opacity: 'muted' },
      },
    },
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
