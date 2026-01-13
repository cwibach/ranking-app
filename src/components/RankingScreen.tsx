import { useState, useEffect } from 'react'

interface Item {
  [key: string]: string
}

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

interface Props {
  sessionId: string
  fieldnames: string[]
  itemCount: number
  onComplete: () => void
}

export default function RankingScreen({ sessionId, fieldnames, itemCount, onComplete }: Props) {
  const [ranking, setRanking] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchNextComparison()
  }, [])

  const fetchNextComparison = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, currentBetter: true })
      })

      const data = await response.json() as RankingResponse
      setRanking(data)

      if (data.status === 'complete') {
        onComplete()
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleChoice = async (currentBetter: boolean) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, currentBetter })
      })

      const data = await response.json() as RankingResponse
      setRanking(data)

      if (data.status === 'complete') {
        onComplete()
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !ranking) {
    return (
      <div className="container">
        <div className="header">
          <h1>Loading...</h1>
        </div>
        <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p>Please wait...</p>
        </div>
      </div>
    )
  }

  if (ranking.status === 'complete') {
    return null
  }

  const leftItem = ranking.leftItem || {}
  const rightItem = ranking.rightItem || {}
  const itemsDone = ranking.itemsDone || 0
  const totalItems = ranking.totalItems || 0
  const comparisons = ranking.comparisons || 0

  return (
    <div className="container">
      <div className="header">
        <h1>Which do you prefer?</h1>
        <p>Item {itemsDone + 1} of {totalItems} | Comparisons: {comparisons}</p>
      </div>

      <div className="content">
        <div className="two-column">
          {/* Left Panel */}
          <div className="comparison-panel left">
            <div className="panel-header left">← Left Option</div>
            <div className="panel-content">
              {fieldnames.map((field) => (
                <div key={field} className="item-field">
                  <div className="item-field-label">{field}:</div>
                  <div className="item-field-value">{leftItem[field] || 'N/A'}</div>
                </div>
              ))}
            </div>
            <button
              className="btn-success panel-button"
              onClick={() => handleChoice(true)}
              disabled={loading}
            >
              ✓ PREFER LEFT
            </button>
          </div>

          {/* Right Panel */}
          <div className="comparison-panel right">
            <div className="panel-header right">Right Option →</div>
            <div className="panel-content">
              {fieldnames.map((field) => (
                <div key={field} className="item-field">
                  <div className="item-field-label">{field}:</div>
                  <div className="item-field-value">{rightItem[field] || 'N/A'}</div>
                </div>
              ))}
            </div>
            <button
              className="btn-accent panel-button"
              onClick={() => handleChoice(false)}
              disabled={loading}
            >
              PREFER RIGHT ✓
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className="btn-secondary" style={{ padding: '7px 15px', fontSize: '10px' }}>
            💾 Save Progress
          </button>
        </div>
      </div>
    </div>
  )
}
