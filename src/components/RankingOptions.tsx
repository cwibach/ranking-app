import { useState } from 'react'
import { Box, Grid, Typography } from '@mui/material'

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
    <Grid container spacing={2} justifyContent={"center"}>
      <Grid size={12}>
        <Typography variant='h2'>
          Ranking Settings
        </Typography>
        <Typography variant="body1">
          You have {itemCount} items to rank
        </Typography>
      </Grid>

      <Box className="content">
        <Box className="card">
          <Typography variant='h3' color='black'>
            ⚙️ Ranking Settings
          </Typography>

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

          <Typography variant="body2" color='black'>
            When enabled, items will be shuffled to remove any bias from their original order.
          </Typography>
        </Box>

        <div className="btn-group" style={{ marginTop: '30px' }}>
          <button className="btn-success" onClick={handleStart} style={{ flex: 1 }}>
            Start Ranking →
          </button>
          <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>
            ← Back
          </button>
        </div>
      </Box>
    </Grid>
  )
}
