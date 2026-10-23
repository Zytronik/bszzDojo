import { defineRecipe } from '@pandacss/dev';

/** Success or error line above a form */
export const message = defineRecipe({
  className: 'message',
  base: {
    py: '10',
    px: '10',
    mb: '10',
    textAlign: 'center',
    borderRadius: 'sm',
    animation: 'fadeIn',
  },
  variants: {
    status: {
      error: { color: 'status.error.fg', bg: 'status.error.bg' },
      success: { color: 'status.success.fg', bg: 'status.success.bg' },
    },
  },
  defaultVariants: { status: 'success' },
});
