import { defineSlotRecipe } from '@pandacss/dev';

/** A label with a custom 25px box; the real input stays in the DOM for forms and screen readers. */
export const checkbox = defineSlotRecipe({
  className: 'checkbox',
  slots: ['root', 'input', 'control'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '15',
      mb: 'stack',
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
      width: 'checkbox',
      height: 'checkbox',
      layerStyle: 'surface',
      borderRadius: 'sm',
      transitionProperty: 'background-color',
      transitionDuration: 'normal',
      _groupHover: { bg: 'accent.default' },
      _after: {
        content: '""',
        position: 'absolute',
        display: 'none',
        left: '35%',
        top: '20%',
        width: '8px',
        height: '13px',
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
