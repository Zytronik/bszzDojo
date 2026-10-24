import { defineSlotRecipe } from '@pandacss/dev';

/** A message under the header, on top of everything (also dialogs), filled so it stands out. */
export const toast = defineSlotRecipe({
  className: 'toast',
  slots: ['root', 'text', 'action', 'close'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '10',
      py: '10',
      px: '15',
      borderRadius: 'sm',
      boxShadow: 'toast',
      pointerEvents: 'auto',
      animation: 'fadeIn',
    },
    text: { flex: '1', minW: '0', overflowWrap: 'anywhere' },
    action: { flexShrink: '0' },
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
      success: { root: { bg: 'status.success', color: 'fg.onAccent' } },
      error: { root: { bg: 'status.error', color: 'fg.onAccent' } },
      /** Inverted from the page, e.g. "Eine neue Version ist verfügbar." */
      info: { root: { bg: 'fg.default', color: 'bg.canvas' } },
    },
  },
  defaultVariants: { status: 'success' },
});
