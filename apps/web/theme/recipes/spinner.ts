import { defineRecipe } from '@pandacss/dev';

/** Turning ring in the text color, e.g. inside a submit button while its request runs */
export const spinner = defineRecipe({
  className: 'spinner',
  base: {
    display: 'inline-block',
    flexShrink: '0',
    width: 'spinner',
    height: 'spinner',
    borderRadius: 'full',
    borderWidth: 'thick',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    borderTopColor: 'transparent',
    animation: 'spin',
  },
});
