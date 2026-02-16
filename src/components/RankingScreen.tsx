import { useState, useEffect } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'

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
  setSortedItems: ([]: Item) => void
}

export default function RankingScreen({ sessionId, fieldnames, itemCount, onComplete, setSortedItems }: Props) {
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
        setSortedItems(data.sortedItems)
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
        setSortedItems(data.sortedItems)
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !ranking) {
    return (
      <Grid container spacing={2} justifyContent={"space-evenly"}>
        <Grid size={12} justifyContent={"center"}>
          <Typography variant='h2'>
            Select Preferred Option
          </Typography>
          <Typography variant="body1">
            Loading items
          </Typography>
        </Grid>

        <Grid size={12} justifyContent={"center"}>
          <Box className="two-column">
            {/* Left Panel */}
            <Box className="comparison-panel left">
              <Typography className="panel-header left">← Left Option</Typography>
              <Box className="panel-content">
                <Typography className="panel-header left">← Loading left option</Typography>
              </Box>
              <Button
                className="btn-success panel-button"
                disabled={true}
                variant={"contained"}
              >
                ✓ PREFER LEFT
              </Button>
            </Box>

            {/* Right Panel */}
            <Box className="comparison-panel right">
              <Typography className="panel-header right">Right Option →</Typography>
              <Box className="panel-content">
                <Typography className="panel-header left">← Loading right option</Typography>
              </Box>
              <Button
                className="btn-accent panel-button"
                disabled={true}
                variant={"contained"}
              >
                PREFER RIGHT ✓
              </Button>
            </Box>
          </Box>

          <Box style={{ marginTop: '20px' }}>
            <Button 
            className="btn-secondary" 
            style={{ padding: '7px 15px', fontSize: '10px' }}
            variant={"contained"}
            disabled={true}>
              💾 Save Progress
            </Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

  const leftItem = ranking.leftItem || {}
  const rightItem = ranking.rightItem || {}
  const itemsDone = ranking.itemsDone || 0
  const totalItems = ranking.totalItems || 0
  const comparisons = ranking.comparisons || 0

  return (
    <Grid container spacing={2} justifyContent={"space-evenly"}>
      <Grid size={12} justifyContent={"center"}>
        <Typography variant='h2'>
          Select Preferred Option
        </Typography>
        <Typography variant="body1">
          Item {itemsDone + 1} of {totalItems} | Comparisons: {comparisons}
        </Typography>
      </Grid>

      <Grid size={12} justifyContent={"center"}>
        <Box className="two-column">
          {/* Left Panel */}
          <Box className="comparison-panel left">
            <Typography className="panel-header left">← Left Option</Typography>
            <Box className="panel-content">
              {fieldnames.map((field) => (
                <div key={field} className="item-field">
                  <Typography className="item-field-label">{field}:</Typography>
                  <Typography className="item-field-value">{leftItem[field] || 'N/A'}</Typography>
                </div>
              ))}
            </Box>
            <Button
              className="btn-success panel-button"
              onClick={() => handleChoice(true)}
              variant={"contained"}
            >
              ✓ PREFER LEFT
            </Button>
          </Box>

          {/* Right Panel */}
          <Box className="comparison-panel right">
            <Typography className="panel-header right">Right Option →</Typography>
            <Box className="panel-content">
              {fieldnames.map((field) => (
                <div key={field} className="item-field">
                  <Typography className="item-field-label">{field}:</Typography>
                  <Typography className="item-field-value">{rightItem[field] || 'N/A'}</Typography>
                </div>
              ))}
            </Box>
            <Button
              className="btn-accent panel-button"
              onClick={() => handleChoice(false)}
              variant={"contained"}
            >
              PREFER RIGHT ✓
            </Button>
          </Box>
        </Box>

        <Box style={{ marginTop: '20px' }}>
          <Button 
          className="btn-secondary" 
          style={{ padding: '7px 15px', fontSize: '10px' }}
          variant={"contained"}
          disabled={true}>
            💾 Save Progress
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}
