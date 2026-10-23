import { defineSlotRecipe } from '@pandacss/dev';

export const modal = defineSlotRecipe({
  className: 'modal',
  slots: ['backdrop', 'content', 'close', 'title'],
  base: {
    backdrop: {
      position: 'fixed',
      inset: '0',
      zIndex: 'modal',
      display: 'flex',
      // Not `center`: a dialog taller than the screen would lose its top. The content's auto
      // margins center it whenever it fits.
      alignItems: 'flex-start',
      justifyContent: 'center',
      overflow: 'auto',
      py: '15',
      layerStyle: 'backdrop',
      animation: 'fadeIn',
    },
    content: {
      layerStyle: 'surface',
      marginBlock: 'auto',
      width: '80%',
      maxWidth: 'container.sm',
      p: '15',
      borderRadius: 'sm',
    },
    close: {
      float: 'right',
      bg: 'transparent',
      border: 'none',
      color: 'inherit',
      fontSize: 'xl',
      fontWeight: 'bold',
      lineHeight: 'none',
      cursor: 'pointer',
      _hover: { opacity: 'muted' },
    },
    title: { textStyle: 'heading.section', marginBlockEnd: '10', pe: '25' },
  },
  variants: {
    /** `form`: the page's background, so inputs (on the surface color) stand out. */
    tone: {
      default: {},
      form: { content: { layerStyle: 'canvas', width: '90%' } },
    },
  },
  defaultVariants: { tone: 'default' },
});
