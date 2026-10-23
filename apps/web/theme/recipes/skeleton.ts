import { defineSlotRecipe } from '@pandacss/dev';

/**
 * Placeholder shapes while a list or chart loads, laid out like `record` rows so the page doesn't
 * jump when the data arrives.
 */
export const skeleton = defineSlotRecipe({
  className: 'skeleton',
  slots: ['row', 'rank', 'body', 'line', 'title', 'meta', 'chart'],
  base: {
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      py: '10',
      layerStyle: 'divider',
      _first: { pt: '0' },
    },
    rank: {
      layerStyle: 'skeleton',
      flexShrink: '0',
      width: 'skeletonRank',
      height: 'skeletonLine',
    },
    body: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8' },
    line: { layerStyle: 'skeleton', height: 'skeletonLine', width: '70%' },
    title: { layerStyle: 'skeleton', height: 'skeletonLine', width: '45%' },
    meta: { layerStyle: 'skeleton', height: 'skeletonMeta', width: '30%' },
    // Chart.js keeps a 2:1 canvas by default.
    chart: { layerStyle: 'skeleton', width: 'full', aspectRatio: '2 / 1' },
  },
});
