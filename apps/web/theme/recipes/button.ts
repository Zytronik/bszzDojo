import { defineRecipe } from '@pandacss/dev';

export const button = defineRecipe({
  className: 'button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8',
    bg: 'accent.default',
    color: 'fg.onAccent',
    border: 'none',
    borderRadius: 'sm',
    py: '10',
    px: '15',
    cursor: 'pointer',
    transitionProperty: 'opacity',
    transitionDuration: 'normal',
    _hover: { opacity: 'muted' },
    _focusVisible: {
      outlineWidth: 'thick',
      outlineStyle: 'solid',
      outlineColor: 'fg.default',
      outlineOffset: '2px',
    },
    _disabled: { opacity: 'inactive', cursor: 'not-allowed', _hover: { opacity: 'inactive' } },
  },
  variants: {
    /** `block`: full width with space above, like every form button of the old app. */
    size: {
      block: { width: 'full', mt: '10' },
      inline: { py: '5', px: '15' },
    },
    tone: {
      accent: {},
      neutral: { bg: 'bg.canvas', color: 'fg.default' },
      /** A second choice on the page, where `neutral` would vanish into the background */
      subtle: { bg: 'bg.surface', color: 'fg.default' },
    },
  },
  defaultVariants: { size: 'block', tone: 'accent' },
});
