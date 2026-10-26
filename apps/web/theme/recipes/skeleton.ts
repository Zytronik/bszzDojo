import { defineSlotRecipe } from '@pandacss/dev';

/**
 * Placeholder shapes while a list, a chart or a round's page loads, laid out like the real elements
 * so the page doesn't jump when the data arrives.
 */
export const skeleton = defineSlotRecipe({
  className: 'skeleton',
  slots: ['row', 'rank', 'body', 'line', 'title', 'meta', 'tab', 'chart', 'block', 'square'],
  base: {
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      py: '10',
      layerStyle: 'divider',
      // Of type: the screen reader text before the rows is a span.
      _firstOfType: { pt: '0' },
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
    // Sized by its text like a `tabs` trigger, so the chart's distance tabs take the same height.
    tab: {
      layerStyle: 'skeleton',
      display: 'inline-block',
      py: '8',
      px: '15',
      borderBottomRadius: '0',
      color: 'transparent',
    },
    // Chart.js keeps a 2:1 canvas by default.
    chart: { layerStyle: 'skeleton', width: 'full', aspectRatio: '2 / 1' },
    // Holds invisible text in the real element's text styles, so it takes that element's height.
    block: { layerStyle: 'skeleton', color: 'transparent', userSelect: 'none' },
    // The target face (`TargetCanvas`)
    square: {
      layerStyle: 'skeleton',
      display: 'block',
      w: 'full',
      maxW: 'canvas',
      aspectRatio: '1',
      mx: 'auto',
    },
  },
});
