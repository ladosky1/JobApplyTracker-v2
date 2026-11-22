import { createTheme } from '@mantine/core';

export const appTheme = createTheme({
  fontFamily: 'Manrope Variable, sans-serif',

  headings: {
    fontFamily: 'Manrope Variable, sans-serif',
    fontWeight: '700',
  },

  primaryColor: 'brand',
  primaryShade: 6,

  colors: {
    brand: [
      '#F3FFD9',
      '#E7FFB3',
      '#D9FF8A',
      '#CCFF66',
      '#C2FF4D',
      '#BBFF3B',
      '#B6FF2E',
      '#91D51F',
      '#6FA315',
      '#4B700B',
    ],
  },

  defaultRadius: 'md',
});
