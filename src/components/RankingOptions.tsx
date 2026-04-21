import { useState } from 'react'
import { Box, Grid, Typography, Button, Checkbox, FormControlLabel } from '@mui/material'

interface Props {
  itemCount: number
  sessionId: string
  onStart: (initialRanking: any, hideRemainingComparisons: boolean) => void
  onBack: () => void
}

export default function RankingOptions({ itemCount, sessionId, onStart, onBack }: Props) {
  const [randomize, setRandomize] = useState(false)
  const [hideRemaining, setHideRemaining] = useState(false)
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

      const data = await response.json()
      onStart(data, hideRemaining)
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    }
  }

  return (
    <Grid container spacing={2} justifyContent={"center"}>
      <Grid size={12}>
        <Typography variant='h2' fontWeight={"bold"} sx={{ mb: 2 }}>
          Ranking Settings
        </Typography>
        <Typography variant="body1" sx={{ mb: 0 }}>
          You have {itemCount} items to rank
        </Typography>
      </Grid>

      <Grid size={11} className="content">
        <Box className="card"
          sx={{
            borderRadius: 4,
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            mb: 2, mt: -2
          }}>
          <Typography variant='h3' sx={{ mb: -1 }}>
            Ranking Settings
          </Typography>

          <Box className="checkbox-group">
            <FormControlLabel
              control={<Checkbox
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
              />}
              label="Randomize item order before ranking"
            />
            <Typography variant="body2">
              When enabled, items will be shuffled to remove any bias from their original order.
            </Typography>
          </Box>

          <Box className="checkbox-group">
            <FormControlLabel
              control={<Checkbox
                checked={hideRemaining}
                onChange={(e) => setHideRemaining(e.target.checked)}
              />}
              label="Hide remaining comparison estimate"
            />
            <Typography variant="body2">
              If selected, the remaining comparison estimate will not be shown during ranking.
            </Typography>
          </Box>
        </Box>

        <Box className="btn-group"
          sx={{
            // border: 'var(--dashed-border)', 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1
          }}>
          <Button
            className="btn-secondary btn-cancel"
            onClick={onBack}
            variant={"contained"}>
            ← Back
          </Button>

          <Button
            className="btn-success btn-confirm"
            onClick={handleStart}
            variant={"contained"}>
            Start Ranking →
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}
