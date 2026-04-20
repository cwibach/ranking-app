import { useState, useEffect } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Typography } from '@mui/material'
import SelectItem from './SelectItem'

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
  minRemainingComparisons?: number
  maxRemainingComparisons?: number
  fieldnames?: string[]
  sortedItems?: Item[]
}

interface Props {
  sessionId: string
  fieldnames: string[]
  onComplete: () => void
  setSortedItems: (sortedItems: Item[]) => void
  onExit: () => void
  // when resuming from a saved file the server will send a partial
  // RankingResponse so we can show the correct comparison without
  // immediately posting another /compare call
  initialRanking?: RankingResponse
}

export default function RankingScreen({ sessionId, fieldnames, onComplete, setSortedItems, onExit, initialRanking }: Props) {
  const [ranking, setRanking] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  useEffect(() => {
    // if we already got an initial ranking payload from the parent (via
    // FileSelection/load-inprogress) use it instead of firing a bogus
    // compare request; otherwise kick off the flow by asking the server for
    // the "next" comparison even though no choice has been made yet.
    if (initialRanking) {
      setRanking(initialRanking)
      setLoading(false)

      if (initialRanking.status === 'complete') {
        setSortedItems(initialRanking.sortedItems ?? [])
        onComplete()
      }
    } else {
      fetchNextComparison()
    }
  }, [])

  const fetchNextComparison = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/next-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
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

  const handleExit = () => {
    setConfirmOpen(true)
  }

  const handleCancelExit = () => {
    setConfirmOpen(false)
  }

  const handleConfirmExit = () => {
    setConfirmOpen(false)
    onExit()
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
  const minRemaining = ranking.minRemainingComparisons ?? 0
  const maxRemaining = ranking.maxRemainingComparisons ?? 0

  return (
    <Grid container justifyContent={"space-evenly"}>
      <Grid size={12} justifyContent={"center"}>
        <Typography variant='h2' sx={{mb:1}}>
          Select Preferred Option
        </Typography>
        <Typography variant="body1" sx={{mb:2}}>
          Item {itemsDone + 1} of {totalItems} | Comparisons: {comparisons}
          {minRemaining !== 0 || maxRemaining !== 0 ? ` | Remaining: ${minRemaining}–${maxRemaining}` : ''}
        </Typography>
      </Grid>

      {/* Left Panel */}
      <Grid size={6} className="comparison-panel left">
        <SelectItem
          item={leftItem}
          fieldnames={fieldnames}
          header="← Left Option"
          headerClassName="panel-header left"
          buttonText="✓ PREFER LEFT"
          buttonClassName="btn-success panel-button"
          onSelect={() => handleChoice(true)}
        />

      </Grid>

      {/* Right Panel */}
      <Grid size={6} className="comparison-panel right">
        <SelectItem
          item={rightItem}
          fieldnames={fieldnames}
          header="Right Option →"
          headerClassName="panel-header right"
          buttonText="PREFER RIGHT ✓"
          buttonClassName="btn-accent panel-button"
          onSelect={() => handleChoice(false)}
        />
      </Grid>

      <Grid size={12}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 20 }}>
          <Button
            sx={{ mt: 0 }}
            className="btn-secondary"
            style={{ padding: '7px 15px', fontSize: '10px' }}
            variant={"contained"}
            onClick={handleSaveProgress}>
            💾 Save Progress
          </Button>
          <Button
            sx={{ mt: 0 }}
            className="btn-secondary"
            style={{ padding: '7px 15px', fontSize: '10px' }}
            variant={"contained"}
            onClick={handleExit}>
            Exit Home
          </Button>
        </div>
      </Grid>

      <Dialog
        open={confirmOpen}
        onClose={handleCancelExit}
        aria-labelledby="exit-confirmation-dialog-title"
        aria-describedby="exit-confirmation-dialog-description"
      >
        <DialogTitle id="exit-confirmation-dialog-title">
          Exit Ranking Session
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="exit-confirmation-dialog-description">
            Are you sure you want to exit to the home screen? Your unsaved ranking progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExit}>Cancel</Button>
          <Button onClick={handleConfirmExit} autoFocus>
            Exit Home
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}
