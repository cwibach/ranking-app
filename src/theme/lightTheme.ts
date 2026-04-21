import { createTheme } from '@mui/material/styles'

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
      light: '#5e92f3',
      dark: '#003c8f'
    },
    secondary: {
      main: '#f57c00',
      light: '#ffad42',
      dark: '#bb4d00'
    },
    success: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005'
    },
    error: {
      main: '#d32f2f',
      light: '#e57373',
      dark: '#9a0007'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    },
    divider: '#e0e0e0'
  },
  shape: {
    borderRadius: 4
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--primary-blue': '#1565c0',
          '--primary-blue-hover': '#0d47a1',
          '--success-green': '#2e7d32',
          '--success-green-hover': '#1b5e20',
          '--accent-orange': '#f57c00',
          '--accent-orange-hover': '#e65100',
          '--prefer-left-pink': '#8e24aa',
          '--prefer-left-pink-hover': '#6a1b9a',
          '--bg-light-purple': '#f3e5f5',
          '--danger-red': '#d32f2f',
          '--danger-red-hover': '#b71c1c',
          '--secondary-gray': '#757575',
          '--secondary-gray-hover': '#616161',
          '--bg-light': '#f5f5f5',
          '--bg-card': '#ffffff',
          '--bg-light-green': '#e8f5e9',
          '--bg-light-orange': '#fff3e0',
          '--text-dark': '#333333',
          '--text-light': '#666666',
          '--text-white': '#ffffff',
          '--header-subtext': '#e0e0e0',
          '--header-success-subtext': '#c8e6c9',
          '--border-default': '#e0e0e0',
          '--result-item-bg': '#f9f9f9',
          '--page-bg': '#f5f5f5',
          '--dashed-border': '1px dashed #9e9e9e'
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