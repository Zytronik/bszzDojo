import { defineSemanticTokens } from '@pandacss/dev';

/** What components use. `_light` applies with `data-theme="light"` on `<html>`. */
export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      /** Page background */
      canvas: { value: { base: '{colors.gray.900}', _light: '{colors.gray.50}' } },
      /** Header, footer, inputs, tabs, cards */
      surface: { value: { base: '{colors.gray.800}', _light: '{colors.gray.200}' } },
      /** Behind dialogs */
      overlay: { value: '{colors.blackAlpha.80}' },
    },
    fg: {
      default: { value: { base: '{colors.white}', _light: '{colors.black}' } },
      onAccent: { value: '{colors.white}' },
    },
    accent: {
      default: { value: '{colors.vermilion.500}' },
    },
    border: {
      subtle: { value: '{colors.bg.surface}' },
    },
    status: {
      error: { value: '{colors.vermilion.500}' },
      success: { value: '{colors.green.600}' },
    },
    medal: {
      gold: { value: '{colors.gold}' },
      silver: { value: '{colors.silver}' },
      bronze: { value: '{colors.bronze}' },
    },
    /**
     * The group's marks on the target face: colors none of its rings have, the same in both
     * themes like the face. `TargetCanvas` reads them back, the legend shows them.
     */
    group: {
      // Dark in the light theme, where white would vanish next to the face.
      center: { value: { base: '{colors.white}', _light: '{colors.black}' } },
      half: { value: '{colors.green.400}' },
      area: { value: '{colors.magenta.400}' },
    },
    /** Backgrounds of the club badges ("Abzeichen") */
    rank: {
      red: { value: '{colors.red.400}' },
      gold: { value: '{colors.yellow.300}' },
      white: { value: '{colors.white}' },
      blue: { value: '{colors.blue.400}' },
    },
  },
  spacing: {
    /** Horizontal page padding, Bootstrap's 15px gutter */
    gutter: { value: '{spacing.15}' },
    /** Vertical padding of a page section */
    section: { value: '{spacing.20}' },
    /** Between form rows and list blocks */
    stack: { value: '{spacing.15}' },
    /** Between the header's icons */
    nav: { value: '{spacing.25}' },
    /** Offset below the fixed header (its height), for the page and the search overlay */
    header: { value: '{sizes.header}' },
  },
});
