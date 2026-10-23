import { defineSlotRecipe } from '@pandacss/dev';

/** The user search that slides open under the header */
export const searchOverlay = defineSlotRecipe({
  className: 'search-overlay',
  slots: ['root', 'panel', 'topbar', 'close', 'results', 'result', 'empty'],
  base: {
    root: {
      layerStyle: 'canvas',
      position: 'fixed',
      top: 'header',
      insetX: '0',
      zIndex: 'header',
      height: '0',
      overflow: 'hidden',
      visibility: 'hidden',
      opacity: '0',
      pointerEvents: 'none',
      transitionProperty: 'opacity, height, visibility',
      transitionDuration: 'normal',
    },
    panel: {
      height: 'full',
      pt: '15',
      display: 'flex',
      flexDirection: 'column',
    },
    topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    close: {
      bg: 'transparent',
      border: 'none',
      color: 'inherit',
      fontSize: '5xl',
      lineHeight: 'none',
      mb: '15',
      cursor: 'pointer',
      _hover: { opacity: 'muted' },
    },
    results: {
      mt: '15',
      pb: '15',
      display: 'flex',
      flexDirection: 'column',
      gap: '15',
      overflowY: 'auto',
    },
    result: {
      display: 'block',
      layerStyle: 'surface',
      py: '8',
      px: '15',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
    },
    empty: { layerStyle: 'muted' },
  },
  variants: {
    open: {
      true: {
        root: {
          height: 'calc(100dvh - token(sizes.header))',
          visibility: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
        },
      },
    },
  },
});
