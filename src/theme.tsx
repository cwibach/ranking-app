import { createTheme } from "@mui/material"

export const customTheme = createTheme({
  palette: {
    primary: {
      main: '#9c00e5',
      light: '#b66be4',
      dark: '#460464'
    },
    secondary: {
      main: '#037628'
    }
  }, components: {
    MuiButton: {
      defaultProps: {
        variant: "contained"
      }
    },
  }
})