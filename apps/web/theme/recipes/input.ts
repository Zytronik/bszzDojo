import { defineRecipe } from '@pandacss/dev';

/** Text inputs and selects */
export const input = defineRecipe({
  className: 'input',
  base: {
    layerStyle: 'surface',
    width: 'full',
    height: 'control',
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
    // iOS Safari draws date fields natively: centered, with its own width and height. Only there
    // (the selector matches no other browser), so Chrome keeps its calendar icon.
    '@supports (-webkit-touch-callout: none)': {
      '&[type=date]': {
        appearance: 'none',
        display: 'block',
        minWidth: '0',
        textAlign: 'start',
        '&::-webkit-date-and-time-value': { textAlign: 'start' },
      },
    },
  },
});
