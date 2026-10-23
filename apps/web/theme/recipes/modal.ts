import { defineSlotRecipe } from '@pandacss/dev';

export const modal = defineSlotRecipe({
  className: 'modal',
  slots: ['backdrop', 'content', 'close'],
  base: {
    backdrop: {
      position: 'fixed',
      inset: '0',
      zIndex: 'modal',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      layerStyle: 'backdrop',
      animation: 'fadeIn',
    },
    content: {
      layerStyle: 'surface',
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
  },
});
