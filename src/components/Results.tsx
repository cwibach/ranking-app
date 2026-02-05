import { useState, useEffect } from 'react'
import FinalItemList from './FinalRankingList.tsx'

interface Item {
  [key: string]: string
}

interface Props {
  sessionId: string
  onNewRanking: () => void
  sortedItems: Item[]
}

export default function Results({ sessionId, onNewRanking, sortedItems }: Props) {
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  // const [comparisons, setComparisons] = useState(0)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    setResults(sortedItems)
  }, [])

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/api/save-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'ranked_results.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error downloading results: ' + (error as Error).message)
    }
  }

  const handleExit = () => {
    fetch(`${API_URL}/api/cleanup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    }).catch(() => {})
  }

  return (
    <div className="container">
      <div className="header success">
        <h1>Ranking Complete! ✓</h1>
        <p>You completed the ranking</p>
      </div>

      <div className="content">
        <div className="card results-header">
          <div className="card-title">🏆 Your Ranked Results</div>
          <div className="card-description">Items ranked from most to least preferred</div>
        </div>

        <div className="itemlist">
          <FinalItemList itemList={sortedItems}/>
        </div>

        <div className="btn-group">
          <button className="btn-accent" onClick={handleDownload}>
            💾 Save Results to CSV
          </button>
          <button className="btn-primary" onClick={onNewRanking}>
            🔄 New Ranking
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              handleExit()
              onNewRanking()
            }}
          >
            ❌ Exit
          </button>
        </div>
      </div>
    </div>
  )
}
