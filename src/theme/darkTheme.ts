import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64b5f6',
      light: '#9be7ff',
      dark: '#2286c3'
    },
    secondary: {
      main: '#ffb74d',
      light: '#ffe97d',
      dark: '#c88719'
    },
    success: {
      main: '#81c784',
      light: '#b2fab4',
      dark: '#519657'
    },
    error: {
      main: '#ef5350',
      light: '#ff867c',
      dark: '#b61827'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0'
    },
    divider: '#3f3f3f'
  },
  shape: {
    borderRadius: 4
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--primary-blue': '#64b5f6',
          '--primary-blue-hover': '#4f9ad9',
          '--success-green': '#81c784',
          '--success-green-hover': '#6aac6f',
          '--accent-orange': '#ffb74d',
          '--accent-orange-hover': '#e39b31',
          '--prefer-left-pink': '#ce93d8',
          '--prefer-left-pink-hover': '#ba68c8',
          '--bg-light-purple': '#3e2b46',
          '--danger-red': '#ef5350',
          '--danger-red-hover': '#d23b38',
          '--secondary-gray': '#9e9e9e',
          '--secondary-gray-hover': '#858585',
          '--bg-light': '#121212',
          '--bg-card': '#1e1e1e',
          '--bg-light-green': '#1e2f22',
          '--bg-light-orange': '#33271a',
          '--text-dark': '#e0e0e0',
          '--text-light': '#b0b0b0',
          '--text-white': '#f5f5f5',
          '--header-subtext': '#b0c8de',
          '--header-success-subtext': '#a5d6a7',
          '--border-default': '#3f3f3f',
          '--result-item-bg': '#1a1a1a',
          '--page-bg': '#121212',
          '--dashed-border': '1px dashed #6f6f6f'
        },
        body: {
          margin: 0,
          minWidth: '320px',
          minHeight: '100vh',
          backgroundColor: 'var(--page-bg)',
          color: 'var(--text-dark)',
          fontFamily: 'Arial, sans-serif'
        },
        '#root': {
          minHeight: '100vh'
        }
      }
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained'
      }
    }
  }
})