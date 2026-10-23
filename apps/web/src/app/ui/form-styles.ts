import { css } from 'styled-system/css';

/** Classes form templates use besides `FormField` and `FormButton`. */
export const formStyles = {
  lead: css({ mb: '10' }),
};

export type FormStyles = typeof formStyles;
