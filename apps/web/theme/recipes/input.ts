import { defineRecipe } from '@pandacss/dev';

/** Text inputs and selects */
export const input = defineRecipe({
  className: 'input',
  base: {
    layerStyle: 'surface',
    width: 'full',
    px: '8',
    py: '5',
    border: 'none',
    borderRadius: 'sm',
    boxShadow: 'none',
    outline: 'none',
    transitionProperty: 'box-shadow',
    transitionDuration: 'normal',
    _focusVisible: { outlineWidth: 'thick', outlineStyle: 'solid', outlineColor: 'accent.default' },
    _placeholder: { color: 'fg.default', opacity: 'inactive' },
    // Set by `FieldControl` once the user touched the field; not `:invalid`, which applies at once.
    '&[aria-invalid=true]': {
      outlineWidth: 'thick',
      outlineStyle: 'solid',
      outlineColor: 'status.error',
    },
  },
});
