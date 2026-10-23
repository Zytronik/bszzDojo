import { defineRecipe } from '@pandacss/dev';

/**
 * "Keine … vorhanden." in place of a list: a centered panel that fills the list's area (inside a
 * `LoadingFrame` that's at least the skeleton's height).
 */
export const emptyState = defineRecipe({
  className: 'emptyState',
  base: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    p: '25',
    bg: 'bg.surface',
    color: 'fg.default',
    rounded: 'md',
    animation: 'fadeIn',
  },
});
