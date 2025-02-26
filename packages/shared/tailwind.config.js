/* eslint-disable @typescript-eslint/no-var-requires */
const colors = require('./tailwind/colors');
const overlay = require('./tailwind/overlay');
const boxShadow = require('./tailwind/boxShadow');
const caret = require('./tailwind/caret');
const typography = require('./tailwind/typography');
const buttons = require('./tailwind/buttons');

module.exports = {
  mode: 'jit',
  theme: {
    colors: {
      ...colors,
      overlay,
      theme: {
        active: 'var(--theme-active)',
        focus: 'var(--theme-focus)',
        float: 'var(--theme-float)',
        hover: 'var(--theme-hover)',
        bg: {
          primary: 'var(--theme-background-primary)',
          secondary: 'var(--theme-background-secondary)',
          tertiary: 'var(--theme-background-tertiary)',
          bun: 'var(--theme-background-bun)',
          onion: 'var(--theme-background-onion)',
        },
        label: {
          primary: 'var(--theme-label-primary)',
          secondary: 'var(--theme-label-secondary)',
          tertiary: 'var(--theme-label-tertiary)',
          quaternary: 'var(--theme-label-quaternary)',
          disabled: 'var(--theme-label-disabled)',
          link: 'var(--theme-label-link)',
          invert: 'var(--theme-label-invert)',
          bacon: 'var(--theme-label-bacon)',
        },
        divider: {
          primary: 'var(--theme-divider-primary)',
          secondary: 'var(--theme-divider-secondary)',
          tertiary: 'var(--theme-divider-tertiary)',
          quaternary: 'var(--theme-divider-quaternary)',
        },
        overlay: {
          quaternary: 'var(--theme-overlay-quaternary)',
        },
        status: {
          error: 'var(--theme-status-error)',
          help: 'var(--theme-status-help)',
          success: 'var(--theme-status-success)',
          warning: 'var(--theme-status-warning)',
          cabbage: 'var(--theme-status-cabbage)',
        },
        'post-disabled': 'var(--theme-post-disabled)',
      },
      white: '#ffffff',
      transparent: 'transparent',
    },
    boxShadow,
    opacity: {
      0: '0',
      40: '0.4',
      50: '0.5',
      64: '0.64',
      100: '1',
    },
    zIndex: {
      0: '0',
      1: '1',
      2: '2',
      3: '3',
      rank: '3',
      '-1': '-1',
    },
    fontFamily: {
      sans: [
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        'Roboto',
        'Helvetica',
        'Ubuntu',
        'Segoe UI',
        'Arial',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
      ],
    },
    screens: {
      mobileL: '420px',
      tablet: '656px',
      laptop: '1020px',
      laptopL: '1360px',
      laptopXL: '1668px',
      desktop: '1976px',
      desktopL: '2156px',
      mouse: { raw: '(pointer: fine)' },
      responsiveModalBreakpoint: '420px',
    },
    extend: {
      borderRadius: {
        2: '0.125rem',
        3: '0.1875rem',
        6: '0.375rem',
        8: '0.5rem',
        10: '0.625rem',
        12: '0.75rem',
        14: '0.875rem',
        16: '1rem',
        26: '1.625rem',
      },
      opacity: {
        24: '0.24',
        32: '0.32',
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['group-hover'],
      visibility: ['group-hover'],
    },
  },
  plugins: [caret, typography, buttons],
  corePlugins: {
    invert: false,
  },
};
