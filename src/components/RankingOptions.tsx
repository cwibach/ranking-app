import { useState } from 'react'

interface Props {
  itemCount: number
  sessionId: string
  onStart: () => void
  onBack: () => void
}

export default function RankingOptions({ itemCount, sessionId, onStart, onBack }: Props) {
  const [randomize, setRandomize] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleStart = async () => {
    try {
      const response = await fetch(`${API_URL}/api/start-ranking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, randomize })
      })

      if (!response.ok) {
        throw new Error('Failed to start ranking')
      }

      onStart()
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Ranking Options</h1>
        <p>You have {itemCount} items to rank</p>
      </div>

      <div className="content">
        <div className="card">
          <div className="card-title">⚙️ Ranking Settings</div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />
              🔀 Randomize item order before ranking
            </label>
          </div>

          <div className="checkbox-desc">
            When enabled, items will be shuffled to remove any bias from their original order.
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '30px' }}>
          <button className="btn-success" onClick={handleStart} style={{ flex: 1 }}>
            Start Ranking →
          </button>
          <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
