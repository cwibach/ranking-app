import { Box, Button, Grid, Typography } from '@mui/material'
import { useRef } from 'react'

interface Props {
  onFileSelect: (sessionId: string, itemCount: number, fieldnames: string[]) => void
}

export default function FileSelection({ onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadInputRef = useRef<HTMLInputElement>(null)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  // Load progress CSV (resume a previously-saved session)
  const handleLoadProgress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/api/load-progress`, {
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
      alert('Error loading progress file: ' + (error as Error).message)
    }
  }

  return (
    <Grid container spacing={2} justifyContent={"space-evenly"}>
      <Grid size={12} justifyContent={"center"}>
        <Typography variant='h2' sx={{mb:2}} fontWeight={"bold"}>
          Ranking Application
        </Typography>
        <Typography variant="body1" sx={{mb:1}}>
          Select a CSV file or use demo data to start ranking
        </Typography>
      </Grid>

      <Grid size={4}>
        <Box alignItems="center"
          sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>
          <Typography variant='h3' sx={{mb:1}}>
            📁 Load CSV
          </Typography>
          <Typography variant="body1" sx={{mb:1}}>
            Upload a CSV file with items to rank
          </Typography>
          <Button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => fileInputRef.current?.click()}
            variant='contained'
          >
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </Box>
      </Grid>

      <Grid size={4}>
        <Box alignItems="center"
          sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>

          <Typography variant='h3' sx={{mb:1}}>
            Demo Data
          </Typography>

          <Typography variant="body1" sx={{mb:1}}>
            Use sample data to see how it works
          </Typography>

          <Button
            className="btn-accent"
            style={{ width: '100%' }}
            onClick={handleDemoData}
            variant='contained'
          >
            Load Demo
          </Button>
        </Box>
      </Grid>

      <Grid size={4}>
        <Box alignItems="center"
          sx={{
            p: 1,
            border: "1px dashed grey",
            ml: 1
          }}>

          <Typography variant='h3' sx={{mb:1}}>
            ⤴️ Load Progress
          </Typography>

          <Typography variant="body1" sx={{mb:1}}>
            Continue a previous ranking session (upload saved progress CSV)
          </Typography>
          <Button
            className="btn-success"
            style={{ width: '100%' }}
            onClick={() => loadInputRef.current?.click()}
            variant='contained'
          >
            Load Progress CSV
          </Button>
          <input
            ref={loadInputRef}
            type="file"
            accept=".csv"
            onChange={handleLoadProgress}
            style={{ display: 'none' }}
          />
        </Box>
      </Grid>

      <Typography variant="body2">
        CSV files should have headers. Each row will be ranked.
      </Typography>
    </Grid>
  )
}
