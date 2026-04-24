import { Box, Grid, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'
import FinalItemList from './FinalRankingList.tsx'
import { useState } from 'react'

interface Item {
  [key: string]: string
}

interface Props {
  sessionId: string
  onNewRanking: () => void
  sortedItems: Item[]
}

export default function Results({ sessionId, onNewRanking, sortedItems }: Props) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
  const [confirmOpen, setConfirmOpen] = useState(false)

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
    }).catch(() => { })
  }

  const handleExitClick = () => {
    setConfirmOpen(true)
  }

  const handleCancelExit = () => {
    setConfirmOpen(false)
  }

  const handleConfirmExit = () => {
    setConfirmOpen(false)
    handleExit()
    onNewRanking()
  }

  return (
    <Grid container spacing={2} justifyContent={"center"}>
      <Grid size={12}>
        <Typography variant='h2' fontWeight={"bold"}>
          Final Ranked Results
        </Typography>
      </Grid>

      <Grid size={12}>
        <Typography className="card-description" sx={{mb:1}}>Items ranked from most to least preferred</Typography>

        <Box className="btn-group" sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 2,
            p: 1,
            // border: 'var(--dashed-border)',
            ml: 1,
            mb: 1
          }}>
          <Button 
          className="btn-accent btn-save-results" 
          onClick={handleDownload}
          variant={"contained"}
          sx={{ justifySelf: 'start' }}>
            💾 Save Results to CSV
          </Button>
          <Button 
          className="btn-primary btn-confirm" 
          onClick={onNewRanking}
          variant={"contained"}
          sx={{ justifySelf: 'center' }}>
            🔄 New Ranking
          </Button>
          <Button
            className="btn-danger"
            onClick={handleExitClick}
            variant={"contained"}
          sx={{ justifySelf: 'end' }}>
            ❌ Exit
          </Button>
        </Box>

        <Box className="itemlist" sx={{
            // border: 'var(--dashed-border)',
            ml: 1
          }}>
          <FinalItemList itemList={sortedItems} />
        </Box>

        <Box className="btn-group" sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 2,
            p: 1,
            // border: 'var(--dashed-border)',
            ml: 1
          }}>
          <Button 
          className="btn-accent btn-save-results" 
          onClick={handleDownload}
          variant={"contained"}
          sx={{ justifySelf: 'start' }}>
            💾 Save Results to CSV
          </Button>
          <Button 
          className="btn-primary btn-confirm" 
          onClick={onNewRanking}
          variant={"contained"}
          sx={{ justifySelf: 'center' }}>
            🔄 New Ranking
          </Button>
          <Button
            className="btn-danger"
            onClick={handleExitClick}
            variant={"contained"}
          sx={{ justifySelf: 'end' }}>
            ❌ Exit
          </Button>
        </Box>

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
              Are you sure you want to exit to the home screen? If you have not saved your results, you may lose them.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button className="btn-cancel" onClick={handleCancelExit}>Cancel</Button>
            <Button className="btn-secondary btn-confirm" onClick={handleConfirmExit} autoFocus>
              Exit Home
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  )
}
