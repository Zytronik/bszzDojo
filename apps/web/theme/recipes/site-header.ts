import { defineSlotRecipe } from '@pandacss/dev';

export const siteHeader = defineSlotRecipe({
  className: 'site-header',
  slots: ['root', 'bar', 'home', 'logo', 'nav', 'link', 'status'],
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
    /** A strip under the bar while there's no connection, instead of a toast on every page */
    status: {
      position: 'absolute',
      insetBlockStart: '100%',
      insetX: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8',
      py: '5',
      layerStyle: 'surface',
      borderBlockStartWidth: 'thick',
      borderBlockStartStyle: 'solid',
      borderColor: 'bg.canvas',
      textStyle: 'body.small',
    },
  },
  variants: {
    /** The white logo on dark, the dark logo on light */
    logo: {
      dark: { logo: { _light: { display: 'none' } } },
      light: { logo: { display: 'none', _light: { display: 'block' } } },
    },
  },
});
