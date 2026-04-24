import { Box, Button, Grid, Typography } from '@mui/material'
import { useRef, type KeyboardEvent, type MouseEvent } from 'react'

interface Props {
  onFileSelect: (
    sessionId: string,
    itemCount: number,
    fieldnames: string[],
    initialState?: 'file-selection' | 'ranking-options' | 'ranking' | 'results',
    sortedItems?: { [key: string]: string }[],
    rankingResponse?: any
  ) => void
}

export default function FileSelection({ onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inprogressInputRef = useRef<HTMLInputElement>(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  const handleDemoData = async () => {
    try {
      const demoCSV = `Name,Description,Rating
Item 1,First item,8.5
Item 2,Second item,7.2
Item 3,Third item,9.1
Item 4,Fourth item,6.8
Item 5,Fifth item,8.9
Item 6,Sixth item,7.5
Item 7,Seventh item,8.2
Item 8,Eighth item,6.9
Item 9,Ninth item,9.3
Item 10,Tenth item,7.8`

      const blob = new Blob([demoCSV], { type: 'text/csv' })
      const formData = new FormData()
      formData.append('file', blob, 'demo.csv')

      const response = await fetch(`${API_URL}/api/upload-csv`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      onFileSelect(data.sessionId, data.itemCount, data.fieldnames)
    } catch (error) {
      alert('Error loading demo data: ' + (error as Error).message)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/api/upload-csv`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      onFileSelect(data.sessionId, data.itemCount, data.fieldnames)
    } catch (error) {
      alert('Error uploading file: ' + (error as Error).message)
    }
  }

  const handleLoadInProgress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/api/load-inprogress`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      // Decide initial UI state based on server response
      if (data.status === 'ranking' || data.status === 'ready-to-insert') {
        onFileSelect(
          data.sessionId,
          data.itemCount ?? 0,
          data.fieldnames ?? [],
          'ranking',
          undefined,
          data // pass whole response so RankingScreen can initialize
        )
      } else if (data.status === 'complete') {
        // If server reports complete, pass sortedItems if available (server will include when complete)
        onFileSelect(
          data.sessionId,
          data.itemCount ?? 0,
          data.fieldnames ?? [],
          'results',
          data.sortedItems
        )
      } else {
        onFileSelect(data.sessionId, data.itemCount ?? 0, data.fieldnames ?? [], 'ranking-options')
      }
    } catch (error) {
      alert('Error loading in-progress file: ' + (error as Error).message)
    }
  }

  return (
    <Grid container spacing={2} justifyContent={"space-evenly"} alignItems={"stretch"}>
      <Grid size={12} justifyContent={"center"}>
        <Typography variant='h2' sx={{mb:2}} fontWeight={"bold"}>
          Ranking Application
        </Typography>
        <Typography variant="body1" sx={{mb:1}}>
          Select a CSV-like file or use demo data to start ranking
        </Typography>
      </Grid>

      <Grid size={4}>
        <Box
          alignItems="center"
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => handleCardKeyDown(event, () => fileInputRef.current?.click())}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 4,
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'var(--bg-light)',
              borderColor: 'var(--primary-blue)',
              transform: 'translateY(-1px)'
            },
            ml: 1,
            height: '100%'
          }}>
          <Typography variant='h3' sx={{mb:1}}>
            Load File
          </Typography>
          <Typography variant="body1" sx={{mb:1}}>
            Upload a CSV/TSV/XLSX file with items to rank
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt,.xlsx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Box>
      </Grid>

      <Grid size={4}>
        <Box
          alignItems="center"
          role="button"
          tabIndex={0}
          onClick={() => inprogressInputRef.current?.click()}
          onKeyDown={(event) => handleCardKeyDown(event, () => inprogressInputRef.current?.click())}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 4,
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'var(--bg-light)',
              borderColor: 'var(--primary-blue)',
              transform: 'translateY(-1px)'
            },
            ml: 1,
            height: '100%'
          }}>

          <Typography variant='h3' sx={{mb:1}}>
            Continue Previous
          </Typography>

          <Typography variant="body1" sx={{mb:1}}>
            Resume a ranking without repeating comparisons
          </Typography>
          <input
            ref={inprogressInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleLoadInProgress}
            style={{ display: 'none' }}
          />
        </Box>
      </Grid>

            <Grid size={4}>
        <Box
          alignItems="center"
          role="button"
          tabIndex={0}
          onClick={handleDemoData}
          onKeyDown={(event) => handleCardKeyDown(event, handleDemoData)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 4,
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'var(--bg-light)',
              borderColor: 'var(--primary-blue)',
              transform: 'translateY(-1px)'
            },
            ml: 1,
            height: '100%'
          }}>

          <Typography variant='h3' sx={{mb:1}}>
            Demo Data
          </Typography>

          <Typography variant="body1" sx={{mb:1}}>
            Use sample data to see how it works
          </Typography>

        </Box>
      </Grid>

      <Typography variant="body2">
        Files should have headers. Each row will be ranked.
      </Typography>
    </Grid>
  )
}
