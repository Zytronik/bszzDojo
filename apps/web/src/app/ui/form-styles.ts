import { css } from 'styled-system/css';
import { button, field, input } from 'styled-system/recipes';

/** Classes every form template uses; templates can't call recipes themselves. */
export const formStyles = {
  field: field(),
  input: input(),
  button: button(),
  /** The link under a form, e.g. "Passwort vergessen?" */
  bottomLink: css({ display: 'block', mt: '15' }),
  lead: css({ mb: '10' }),
};

export type FormStyles = typeof formStyles;
