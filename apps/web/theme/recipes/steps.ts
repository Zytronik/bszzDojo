import { defineSlotRecipe } from '@pandacss/dev';

/** A numbered how-to, one step per row with the icon of the button to look for. */
export const steps = defineSlotRecipe({
  className: 'steps',
  slots: ['list', 'step', 'number', 'text', 'icon'],
  base: {
    list: { display: 'flex', flexDir: 'column', gap: '10', listStyle: 'none', m: '0', p: '0' },
    step: {
      layerStyle: 'surface',
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      p: '10',
      borderRadius: 'sm',
    },
    number: {
      flexShrink: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'stepNumber',
      h: 'stepNumber',
      borderRadius: 'full',
      bg: 'accent.default',
      color: 'fg.onAccent',
      fontWeight: 'bold',
    },
    text: { flex: '1', minW: '0' },
    icon: { flexShrink: '0', fontSize: 'headerIcon', color: 'accent.default' },
  },
});
