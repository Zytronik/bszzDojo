import { defineSlotRecipe } from '@pandacss/dev';

/**
 * The label above a custom box as high as an input, like a `field`, so both line up in a row. The
 * real input stays in the DOM for forms and screen readers.
 */
export const checkbox = defineSlotRecipe({
  className: 'checkbox',
  slots: ['root', 'input', 'control'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '5',
      cursor: 'pointer',
      userSelect: 'none',
      position: 'relative',
    },
    input: {
      position: 'absolute',
      opacity: '0',
      width: '0',
      height: '0',
    },
    control: {
      display: 'block',
      position: 'relative',
      flexShrink: '0',
      width: 'control',
      height: 'control',
      layerStyle: 'surface',
      borderRadius: 'sm',
      transitionProperty: 'background-color',
      transitionDuration: 'normal',
      _groupHover: { bg: 'accent.default' },
      _after: {
        content: '""',
        position: 'absolute',
        display: 'none',
        left: '36%',
        top: '16%',
        width: '28%',
        height: '52%',
        borderStyle: 'solid',
        borderColor: 'fg.onAccent',
        borderWidth: '0 3px 3px 0',
        transform: 'rotate(45deg)',
      },
      'input:checked ~ &': {
        bg: 'accent.default',
        _after: { display: 'block' },
      },
      'input:focus-visible ~ &': {
        outlineWidth: 'thick',
        outlineStyle: 'solid',
        outlineColor: 'fg.default',
      },
    },
  },
});
