import { defineTokens } from '@pandacss/dev';

/**
 * Raw values. Components never use these directly but the semantic tokens built from them
 * (`semantic-tokens.ts`), so the light theme only has to remap those.
 */
export const tokens = defineTokens({
  colors: {
    white: { value: '#ffffff' },
    black: { value: '#000000' },
    gray: {
      50: { value: 'rgb(230, 230, 230)' },
      200: { value: 'rgb(200, 200, 200)' },
      400: { value: 'rgb(160, 160, 160)' },
      600: { value: 'rgb(100, 100, 100)' },
      800: { value: 'rgb(40, 40, 40)' },
      900: { value: 'rgb(20, 20, 20)' },
    },
    /** The torii red of the logo, the app's accent. */
    vermilion: {
      500: { value: '#e43811' },
    },
    green: {
      400: { value: '#3ee86a' },
      600: { value: '#0c940c' },
    },
    magenta: { 400: { value: '#ff4df0' } },
    red: { 400: { value: '#ec4231' } },
    yellow: { 300: { value: '#faf000' } },
    blue: { 400: { value: '#00a4e2' } },
    gold: { value: '#ffd700' },
    silver: { value: '#c0c0c0' },
    bronze: { value: '#cd7f32' },
    blackAlpha: { 80: { value: 'rgba(0, 0, 0, 0.8)' } },
  },
  // Named after their pixel value: the old design was built on a 5px grid plus 8px.
  spacing: {
    0: { value: '0' },
    5: { value: '5px' },
    8: { value: '8px' },
    10: { value: '10px' },
    15: { value: '15px' },
    20: { value: '20px' },
    25: { value: '25px' },
  },
  sizes: {
    full: { value: '100%' },
    dot: { value: '12px' },
    /** Follows the text size of the button it's in. */
    spinner: { value: '1em' },
    /** Placeholder heights: a line of body text, a line of small text, and the `#1` column */
    skeletonLine: { value: '18px' },
    skeletonMeta: { value: '12px' },
    skeletonRank: { value: '28px' },
    /** Inputs, selects and what sits next to them (the Abzeichen) */
    control: { value: '36px' },
    /** The Abzeichen next to a line of body text */
    textLine: { value: '26px' },
    /** Scorecard columns with a word in their head (Passe, Summe, Total) */
    scoreLabel: { value: '50px' },
    stepNumber: { value: '28px' },
    header: { value: '60px' },
    footer: { value: '30px' },
    // Bootstrap 3's container widths, which the old layout used.
    container: {
      sm: { value: '750px' },
      md: { value: '970px' },
      lg: { value: '1170px' },
    },
    canvas: { value: '500px' },
  },
  radii: {
    sm: { value: '5px' },
    md: { value: '10px' },
    full: { value: '9999px' },
  },
  fonts: {
    avenir: { value: 'Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif' },
  },
  fontSizes: {
    root: { value: '18px' },
    sm: { value: '80%' },
    md: { value: '100%' },
    lg: { value: '120%' },
    xl: { value: '130%' },
    '2xl': { value: '140%' },
    /** The header's icons, which are `1em` */
    headerIcon: { value: '150%' },
    '4xl': { value: '180%' },
    '5xl': { value: '200%' },
  },
  fontWeights: {
    normal: { value: '400' },
    bold: { value: '700' },
  },
  lineHeights: {
    none: { value: '1' },
    snug: { value: '1.2' },
    normal: { value: '1.42857143' },
  },
  borderWidths: {
    thick: { value: '2px' },
  },
  opacity: {
    inactive: { value: '0.4' },
    muted: { value: '0.7' },
    /** A row whose data isn't on the server yet */
    pending: { value: '0.5' },
    full: { value: '1' },
  },
  durations: {
    normal: { value: '0.3s' },
    spin: { value: '0.8s' },
    pulse: { value: '1.5s' },
  },
  easings: {
    default: { value: 'ease' },
  },
  animations: {
    fadeIn: { value: 'fadeIn {durations.normal} {easings.default}' },
    spin: { value: 'spin {durations.spin} linear infinite' },
    pulse: { value: 'pulse {durations.pulse} {easings.default} infinite' },
  },
  shadows: {
    toast: { value: '0 6px 24px rgba(0, 0, 0, 0.5)' },
  },
  zIndex: {
    header: { value: '1000' },
    modal: { value: '1100' },
    toast: { value: '1300' },
  },
});
