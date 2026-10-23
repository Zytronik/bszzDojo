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
      800: { value: 'rgb(40, 40, 40)' },
      900: { value: 'rgb(20, 20, 20)' },
    },
    /** The torii red of the logo, the app's accent. */
    vermilion: {
      500: { value: '#e43811' },
      a20: { value: 'rgba(228, 56, 17, 0.2)' },
    },
    green: {
      600: { value: '#0c940c' },
      a20: { value: 'rgba(12, 148, 12, 0.2)' },
    },
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
    25: { value: '25px' },
    30: { value: '30px' },
  },
  sizes: {
    full: { value: '100%' },
    dot: { value: '12px' },
    checkbox: { value: '25px' },
    rankBadge: { value: '30px' },
    header: { value: '60px' },
    footer: { value: '40px' },
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
    '3xl': { value: '170%' },
    '4xl': { value: '180%' },
    '5xl': { value: '200%' },
  },
  fontWeights: {
    normal: { value: '400' },
    medium: { value: '500' },
    bold: { value: '700' },
  },
  lineHeights: {
    none: { value: '1' },
    tight: { value: '1.1' },
    snug: { value: '1.2' },
    normal: { value: '1.42857143' },
  },
  borderWidths: {
    thick: { value: '2px' },
  },
  borders: {
    none: { value: 'none' },
  },
  opacity: {
    inactive: { value: '0.4' },
    muted: { value: '0.7' },
    full: { value: '1' },
  },
  durations: {
    normal: { value: '0.3s' },
  },
  easings: {
    default: { value: 'ease' },
  },
  animations: {
    fadeIn: { value: 'fadeIn {durations.normal} {easings.default}' },
  },
  zIndex: {
    header: { value: '1000' },
    modal: { value: '1100' },
    banner: { value: '1200' },
  },
});
