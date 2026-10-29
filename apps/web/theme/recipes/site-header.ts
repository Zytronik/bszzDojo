import { defineSlotRecipe } from '@pandacss/dev';

export const siteHeader = defineSlotRecipe({
  className: 'site-header',
  slots: ['root', 'bar', 'home', 'logo', 'nav', 'link', 'back', 'status'],
  base: {
    root: {
      layerStyle: 'surface',
      position: 'fixed',
      top: '0',
      insetX: '0',
      zIndex: 'header',
      height: 'header',
      py: '10',
      fontSize: 'headerIcon',
    },
    bar: {
      height: 'full',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    home: { display: 'flex', alignItems: 'center', height: 'full' },
    logo: { height: 'full', width: 'auto', objectFit: 'contain' },
    nav: { display: 'flex', alignItems: 'center', gap: 'nav', listStyle: 'none', m: '0', p: '0' },
    link: {
      display: 'flex',
      bg: 'transparent',
      border: 'none',
      p: '0',
      color: 'inherit',
      cursor: 'pointer',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
      '&[aria-current=page], &[aria-expanded=true]': { color: 'accent.default' },
    },
    /** Back from a detail page, whose bar shows its own buttons instead of the navigation */
    back: {
      display: 'flex',
      alignItems: 'center',
      gap: '10',
      minW: '0',
      color: 'fg.default',
      textDecoration: 'none',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
      // Back to the body size: the root's is the icons' and sizes are relative.
      '& > span': {
        fontSize: 'root',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    },
    /** A pill on the bar's lower edge while offline or uploading, instead of toasts */
    status: {
      position: 'absolute',
      insetBlockStart: '100%',
      insetInlineStart: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      px: '10',
      layerStyle: 'canvas',
      borderWidth: 'thick',
      borderStyle: 'solid',
      rounded: 'full',
      whiteSpace: 'nowrap',
      fontSize: 'root',
      '& > span': { display: 'flex', alignItems: 'center', gap: '5', textStyle: 'body.small' },
    },
  },
  variants: {
    status: {
      offline: { status: { color: 'fg.muted', borderColor: 'fg.muted' } },
      syncing: {
        status: {
          color: 'accent.default',
          borderColor: 'accent.default',
          '& svg': {
            animation: 'spin',
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          },
        },
      },
    },
    /** The white logo on dark, the dark logo on light */
    logo: {
      dark: { logo: { _light: { display: 'none' } } },
      light: { logo: { display: 'none', _light: { display: 'block' } } },
    },
  },
});
