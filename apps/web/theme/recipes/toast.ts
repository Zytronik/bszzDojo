import { defineSlotRecipe } from '@pandacss/dev';

/** A success or error message under the header, on top of everything (also dialogs). */
export const toast = defineSlotRecipe({
  className: 'toast',
  slots: ['root', 'text', 'close'],
  base: {
    root: {
      layerStyle: 'surface',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10',
      py: '10',
      px: '15',
      borderRadius: 'sm',
      borderInlineStartWidth: 'thick',
      borderInlineStartStyle: 'solid',
      boxShadow: 'toast',
      pointerEvents: 'auto',
      animation: 'fadeIn',
    },
    text: { flex: '1', minW: '0', overflowWrap: 'anywhere' },
    close: {
      bg: 'transparent',
      border: 'none',
      color: 'inherit',
      fontSize: 'xl',
      lineHeight: 'none',
      cursor: 'pointer',
      _hover: { opacity: 'muted' },
    },
  },
  variants: {
    status: {
      success: { root: { borderColor: 'status.success' } },
      error: { root: { borderColor: 'status.error' } },
    },
  },
  defaultVariants: { status: 'success' },
});
