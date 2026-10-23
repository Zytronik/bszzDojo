import { defineSlotRecipe } from '@pandacss/dev';

export const tabs = defineSlotRecipe({
  className: 'tabs',
  slots: ['list', 'trigger', 'panel'],
  base: {
    list: {
      display: 'flex',
      gap: '15',
      layerStyle: 'divider',
      mb: 'stack',
      overflowX: 'auto',
      scrollbarWidth: 'none',
    },
    trigger: {
      layerStyle: 'surface',
      opacity: 'inactive',
      py: '8',
      px: '15',
      border: 'none',
      borderTopRadius: 'sm',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      transitionProperty: 'opacity',
      transitionDuration: 'normal',
      _hover: { opacity: 'muted' },
      _selected: { opacity: 'full', _hover: { opacity: 'full' } },
      _focusVisible: { outlineWidth: 'thick', outlineStyle: 'solid', outlineColor: 'accent.default' },
    },
    panel: {
      animation: 'fadeIn',
    },
  },
});
