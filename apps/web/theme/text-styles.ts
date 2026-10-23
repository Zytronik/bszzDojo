import { defineTextStyles } from '@pandacss/dev';

// Headings are bold because the old app's Bootstrap build left them at the browser default.
export const textStyles = defineTextStyles({
  heading: {
    page: {
      value: { fontSize: '4xl', lineHeight: 'snug', fontWeight: 'bold' },
    },
    section: {
      value: { fontSize: '2xl', lineHeight: 'snug', fontWeight: 'bold' },
    },
    sub: {
      value: { fontSize: 'lg', lineHeight: 'snug', fontWeight: 'bold' },
    },
  },
  body: {
    small: {
      value: { fontSize: 'sm', lineHeight: 'normal' },
    },
  },
});
