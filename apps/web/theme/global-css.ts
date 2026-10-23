import { defineGlobalStyles } from '@pandacss/dev';

export const globalCss = defineGlobalStyles({
  html: {
    colorScheme: 'dark',
    '&[data-theme=light]': { colorScheme: 'light' },
  },
  'html, body': {
    layerStyle: 'canvas',
    fontFamily: 'avenir',
    fontSize: 'root',
    lineHeight: 'normal',
    overflowX: 'clip',
    WebkitTapHighlightColor: 'transparent',
  },
  a: { color: 'inherit', textDecoration: 'none' },
  'a:hover': { opacity: 'muted' },
  h1: { textStyle: 'heading.page', mb: '5' },
  h2: { textStyle: 'heading.section', mb: '5' },
  h3: { textStyle: 'heading.sub' },
  // Keeps the visible focus ring for keyboard users only.
  ':focus:not(:focus-visible)': { outline: 'none' },
});
