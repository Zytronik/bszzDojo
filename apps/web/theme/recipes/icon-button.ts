import { defineRecipe } from '@pandacss/dev';

/** A square button or link with only an icon (it needs an `aria-label`), as high as an input. */
export const iconButton = defineRecipe({
  className: 'icon-button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    w: 'control',
    h: 'control',
    layerStyle: 'surface',
    border: 'none',
    rounded: 'sm',
    cursor: 'pointer',
    transitionProperty: 'opacity',
    transitionDuration: 'normal',
    _hover: { opacity: 'muted' },
    _focusVisible: { outlineWidth: 'thick', outlineStyle: 'solid', outlineColor: 'accent.default' },
    _disabled: { opacity: 'inactive', cursor: 'not-allowed' },
    // A toggle that's on, like a friend already added
    '&[aria-pressed=true]': { color: 'accent.default' },
  },
});
