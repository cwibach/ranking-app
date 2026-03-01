import { useState } from 'react'
import FileSelection from './components/FileSelection'
import RankingOptions from './components/RankingOptions'
import RankingScreen from './components/RankingScreen'
import Results from './components/Results'

type AppState = 'file-selection' | 'ranking-options' | 'ranking' | 'results'

interface Item {
  [key: string]: string
}

// mirror the response shape used by the server for the ranking endpoint
// (we also include `ready-to-insert` which is returned when a resumed
// session needs to perform the pending insertion before continuing).
interface RankingResponse {
  status: 'ranking' | 'complete' | 'ready-to-insert'
  sessionId: string
  leftItem?: Item
  rightItem?: Item
  itemsDone?: number
  totalItems?: number
  comparisons?: number
  fieldnames?: string[]
  sortedItems?: Item[]
  binaryLow?: number
  binaryHigh?: number
  sortedCount?: number
}

function App() {
  const [appState, setAppState] = useState<AppState>('file-selection')
  const [sessionId, setSessionId] = useState<string>('')
  const [itemCount, setItemCount] = useState<number>(0)
  const [fieldnames, setFieldnames] = useState<string[]>([])
  const [sortedItems, setSortedItems] = useState<Item[]>([])
  const [initialRanking, setInitialRanking] = useState<RankingResponse | undefined>(undefined)

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

  const handleStartRanking = (rankingResponse?: RankingResponse) => {
    if (rankingResponse) {
      setInitialRanking(rankingResponse)
    }
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
  }

  return (
    <div className="app">
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
