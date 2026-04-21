import { useState } from 'react'
import { Box, Switch, Typography } from '@mui/material'
import FileSelection from './components/FileSelection'
import RankingOptions from './components/RankingOptions'
import RankingScreen from './components/RankingScreen'
import Results from './components/Results'

type AppState = 'file-selection' | 'ranking-options' | 'ranking' | 'results'

interface Item {
  [key: string]: string
}

// mirror the response shape used by the server for the ranking endpoint
interface RankingResponse {
  status: 'ranking' | 'complete'
  sessionId: string
  leftItem?: Item
  rightItem?: Item
  itemsDone?: number
  totalItems?: number
  comparisons?: number
  fieldnames?: string[]
  sortedItems?: Item[]
}

interface AppProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  usingSystemPreference: boolean
  systemPrefersDark: boolean
}

function App({ isDarkMode, onToggleTheme, usingSystemPreference, systemPrefersDark }: AppProps) {
  const [appState, setAppState] = useState<AppState>('file-selection')
  const [sessionId, setSessionId] = useState<string>('')
  const [itemCount, setItemCount] = useState<number>(0)
  const [fieldnames, setFieldnames] = useState<string[]>([])
  const [sortedItems, setSortedItems] = useState<Item[]>([])
  const [initialRanking, setInitialRanking] = useState<RankingResponse | undefined>(undefined)
  const [hideRemainingComparisons, setHideRemainingComparisons] = useState(false)

  const handleFileSelect = (
    newSessionId: string,
    count: number,
    fields: string[],
    initialState?: 'file-selection' | 'ranking-options' | 'ranking' | 'results',
    initialSortedItems?: Item[],
    rankingResponse?: RankingResponse
  ) => {
    setSessionId(newSessionId)
    setItemCount(count)
    setFieldnames(fields)

    if (initialSortedItems && initialSortedItems.length > 0) {
      setSortedItems(initialSortedItems)
    }

    if (rankingResponse) {
      setInitialRanking(rankingResponse)
    } else {
      setInitialRanking(undefined)
    }

    if (initialState === 'ranking') {
      setAppState('ranking')
      return
    }

    if (initialState === 'results') {
      setAppState('results')
      return
    }

    setAppState('ranking-options')
  }

  const handleSortedItems = (sortedItems: Item[]) => {
    setSortedItems(sortedItems)
  }

  const handleStartRanking = (rankingResponse: RankingResponse, hideRemaining: boolean) => {
    setInitialRanking(rankingResponse)
    setHideRemainingComparisons(hideRemaining)
    setAppState('ranking')
  }

  const handleRankingComplete = () => {
    setAppState('results')
  }

  const handleNewRanking = () => {
    setAppState('file-selection')
    setSessionId('')
    setItemCount(0)
    setFieldnames([])
    setSortedItems([])
    setInitialRanking(undefined)
  }

  return (
    <div className="app">
      <Box className="theme-toggle">
        <Typography variant="caption" className="theme-toggle-label">
          {isDarkMode ? 'Dark' : 'Light'} Mode
        </Typography>
        <Switch checked={isDarkMode} onChange={onToggleTheme} inputProps={{ 'aria-label': 'Toggle light and dark theme' }} />
        {usingSystemPreference && (
          <Typography variant="caption" className="theme-toggle-hint">
            System default: {systemPrefersDark ? 'dark' : 'light'}
          </Typography>
        )}
      </Box>

      {appState === 'file-selection' && (
        <FileSelection onFileSelect={handleFileSelect} />
      )}
      {appState === 'ranking-options' && (
        <RankingOptions
          itemCount={itemCount}
          onStart={handleStartRanking}
          onBack={() => setAppState('file-selection')}
          sessionId={sessionId}
        />
      )}
      {appState === 'ranking' && (
        <RankingScreen
          sessionId={sessionId}
          onComplete={handleRankingComplete}
          fieldnames={fieldnames}
          setSortedItems={handleSortedItems}
          initialRanking={initialRanking}
          onExit={handleNewRanking}
          hideRemainingComparisons={hideRemainingComparisons}
        />
      )}
      {appState === 'results' && (
        <Results
          sessionId={sessionId}
          onNewRanking={handleNewRanking}
          sortedItems={sortedItems}
        />
      )}
    </div>
  )
}

export default App
