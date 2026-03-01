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
  onComplete: () => void
  setSortedItems: (sortedItems: Item[]) => void
  // when resuming from a saved file the server will send a partial
  // RankingResponse so we can show the correct comparison without
  // immediately posting another /compare call
  initialRanking?: RankingResponse
}

export default function RankingScreen({ sessionId, fieldnames, onComplete, setSortedItems, initialRanking }: Props) {
  const [ranking, setRanking] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // if we already got an initial ranking payload from the parent (via
    // FileSelection/load-inprogress) use it instead of firing a bogus
    // compare request; otherwise kick off the flow by asking the server for
    // the "next" comparison even though no choice has been made yet.
    if (initialRanking) {
      setRanking(initialRanking)
      setLoading(false)
    } else {
      fetchNextComparison()
    }
  }, [])

  const fetchNextComparison = async () => {
    // bug: always send false on the initial "compare" post instead of true
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // incorrectly hardcode false so the very first comparison is wrong
        body: JSON.stringify({ sessionId, currentBetter: false })
      })

      const data = await response.json() as RankingResponse
      setRanking(data)

      if (data.status === 'complete') {
        onComplete()
        setSortedItems(data.sortedItems ?? [])
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleChoice = async (currentBetter: boolean) => {
    // bug: invert the user's choice before sending it to the server
    const buggedChoice = !currentBetter
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, currentBetter: buggedChoice })
      })

      const data = await response.json() as RankingResponse
      setRanking(data)

      if (data.status === 'complete') {
        onComplete()
        setSortedItems(data.sortedItems ?? [])
      }
    } catch (error) {
      alert('Error: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProgress = async () => {
    try {
      if (!sessionId) {
        alert('No active session to save')
        return
      }

      const response = await fetch(`${API_URL}/api/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      if (!response.ok) throw new Error('Failed to generate progress CSV')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'inprogress_results.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error saving progress: ' + (error as Error).message)
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
      </Grid>
    )
  }

  const leftItem = ranking.leftItem || {}
  const rightItem = ranking.rightItem || {}
  const itemsDone = ranking.itemsDone || 0
  const totalItems = ranking.totalItems || 0
  const comparisons = ranking.comparisons || 0

  return (
    <Grid container justifyContent={"space-evenly"}>
      <Grid size={12} justifyContent={"center"}>
        <Typography variant='h2' sx={{mb:1}}>
          Select Preferred Option
        </Typography>
        <Typography variant="body1" sx={{mb:2}}>
          Item {itemsDone + 1} of {totalItems} | Comparisons: {comparisons}
        </Typography>
      </Grid>

      {/* Left Panel */}
      <Grid size={6} className="comparison-panel left">
        <Box className="panel-content"
          sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>
          <Typography className="panel-header left" variant='h4'  sx={{mb:2}}>← Left Option</Typography>
          {fieldnames.map((field) => (
            <div key={field} className="item-field">
              <Typography className="item-field-label" variant='body1' sx={{mb:1}}>
                <b>{field}:</b> {leftItem[field] || 'N/A'}
              </Typography>
            </div>
          ))}
          <Button
            className="btn-success panel-button"
            onClick={() => handleChoice(true)}
            variant={"contained"}
            sx={{mt:1}}
          >
            ✓ PREFER LEFT
          </Button>
        </Box>

      </Grid>

      {/* Right Panel */}
      <Grid size={6} className="comparison-panel right">
        <Box className="panel-content"
          sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>
          <Typography className="panel-header right" variant='h4' sx={{mb:2}}>Right Option →</Typography>
          {fieldnames.map((field) => (
            <div key={field} className="item-field">
              <Typography className="item-field-label" variant='body1' sx={{mb:1}}>
                <b>{field}:</b> {rightItem[field] || 'N/A'}
              </Typography>
            </div>
          ))}
          <Button
            className="btn-accent panel-button"
            onClick={() => handleChoice(false)}
            variant={"contained"}
            sx={{mt:1}}
          >
            PREFER RIGHT ✓
          </Button>
        </Box>
      </Grid>

      <Grid size={12}>
        <Button
          sx={{mt:5}}
          className="btn-secondary"
          style={{ padding: '7px 15px', fontSize: '10px' }}
          variant={"contained"}
          onClick={handleSaveProgress}>
          💾 Save Progress
        </Button>
      </Grid>
    </Grid>
  )
}
