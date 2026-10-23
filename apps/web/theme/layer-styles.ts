import { defineLayerStyles } from '@pandacss/dev';

export const layerStyles = defineLayerStyles({
  /** Raised from the page: header, footer, inputs, tabs, dialogs */
  surface: {
    value: { bg: 'bg.surface', color: 'fg.default' },
  },
  canvas: {
    value: { bg: 'bg.canvas', color: 'fg.default' },
  },
  /** The 2px line under tab bars and between list rows */
  divider: {
    value: { borderBottomWidth: 'thick', borderBottomStyle: 'solid', borderColor: 'border.subtle' },
  },
  /** Secondary text, e.g. dates */
  muted: {
    value: { opacity: 'muted' },
  },
  backdrop: {
    value: { bg: 'bg.overlay' },
  },
  /** A pulsing placeholder block (`skeleton` recipe) */
  skeleton: {
    value: {
      bg: 'bg.surface',
      borderRadius: 'sm',
      animation: 'pulse',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    },
  },
});
