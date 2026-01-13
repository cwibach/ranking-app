import { useState, useEffect } from 'react'

interface Item {
  [key: string]: string
}

interface Props {
  sessionId: string
  onNewRanking: () => void
}

export default function Results({ sessionId, onNewRanking }: Props) {
  const [results, setResults] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [comparisons, setComparisons] = useState(0)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    // Results are fetched from the final compare response
    // In a real app, you'd fetch them from the server
    setLoading(false)
  }

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

  if (loading) {
    return (
      <div className="container">
        <div className="header success">
          <h1>Ranking Complete! ✓</h1>
        </div>
        <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Loading results...</p>
        </div>
      </div>
    )
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

        <div className="scrollable" style={{ marginBottom: '20px' }}>
          <div className="result-item">
            <div className="result-rank">#1</div>
            <div className="result-content">
              <div className="result-field">
                <span className="result-field-label">Sample Item</span>
              </div>
            </div>
          </div>
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
