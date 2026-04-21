import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { darkTheme } from './theme/darkTheme'
import { lightTheme } from './theme/lightTheme'
import './index.css'
import './App.css'

type ThemeMode = 'light' | 'dark'

const THEME_MODE_STORAGE_KEY = 'ranking-app-theme-mode'

function AppThemeProvider() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_MODE_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') {
      return saved
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const handleThemeToggle = () => {
    const nextMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark'
    setThemeMode(nextMode)
    localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode)
  }

  const activeTheme = themeMode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <App
        isDarkMode={themeMode === 'dark'}
        onToggleTheme={handleThemeToggle}
        usingSystemPreference={localStorage.getItem(THEME_MODE_STORAGE_KEY) === null}
        systemPrefersDark={prefersDarkMode}
      />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppThemeProvider />
  </StrictMode>,
)
