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
        <Typography variant='h2' fontWeight={"bold"}>
          🏆 Your Ranked Results
        </Typography>
      </Grid>

      <Grid size={12}>
        <Typography className="card-description" sx={{mb:1}}>Items ranked from most to least preferred</Typography>

        <Box className="itemlist" sx={{
            border: "1px dashed grey",
            ml: 1
          }}>
          <FinalItemList itemList={sortedItems} />
        </Box>

        <Box className="btn-group" sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>
          <Button 
          className="btn-accent" 
          onClick={handleDownload}
          variant={"contained"}
          sx={{mr:2}}>
            💾 Save Results to CSV
          </Button>
          <Button 
          className="btn-primary" 
          onClick={onNewRanking}
          variant={"contained"}
          sx={{mr:2}}>
            🔄 New Ranking
          </Button>
          <Button
            className="btn-danger"
            onClick={() => {
              handleExit()
              onNewRanking()
            }}
            variant={"contained"}
          sx={{mr:2}}>
            ❌ Exit
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}
