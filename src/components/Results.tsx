import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Button } from '@mui/material'
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
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  return (
    <Grid container spacing={2} justifyContent={"center"}>
      <Grid size={12}>
        <Typography variant='h2'>
          Ranking Complete
        </Typography>
      </Grid>

      <Grid size={11}>
        <Typography className="card-title">🏆 Your Ranked Results</Typography>
        <Typography className="card-description">Items ranked from most to least preferred</Typography>

        <Box className="itemlist">
          <FinalItemList itemList={sortedItems} />
        </Box>

        <Box className="btn-group">
          <Button 
          className="btn-accent" 
          onClick={handleDownload}
          variant={"contained"}>
            💾 Save Results to CSV
          </Button>
          <Button 
          className="btn-primary" 
          onClick={onNewRanking}
          variant={"contained"}>
            🔄 New Ranking
          </Button>
          <Button
            className="btn-danger"
            onClick={() => {
              handleExit()
              onNewRanking()
            }}
            variant={"contained"}
          >
            ❌ Exit
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}
