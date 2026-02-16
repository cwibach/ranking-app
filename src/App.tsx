import { useState } from 'react'
import FileSelection from './components/FileSelection'
import RankingOptions from './components/RankingOptions'
import RankingScreen from './components/RankingScreen'
import Results from './components/Results'

type AppState = 'file-selection' | 'ranking-options' | 'ranking' | 'results'

interface Item {
  [key: string]: string
}

function App() {
  const [appState, setAppState] = useState<AppState>('file-selection')
  const [sessionId, setSessionId] = useState<string>('')
  const [itemCount, setItemCount] = useState<number>(0)
  const [fieldnames, setFieldnames] = useState<string[]>([])
  const [sortedItems, setSortedItems] = useState<Item[]>([])

  const handleFileSelect = (newSessionId: string, count: number, fields: string[]) => {
    setSessionId(newSessionId)
    setItemCount(count)
    setFieldnames(fields)
    setAppState('ranking-options')
  }

  const handleSortedItems = (sortedItems: Item[]) => {
    setSortedItems(sortedItems)
  }

  const handleStartRanking = () => {
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
          itemCount={itemCount}
          setSortedItems={handleSortedItems}
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
