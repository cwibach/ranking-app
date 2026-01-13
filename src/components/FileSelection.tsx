import { useRef } from 'react'

interface Props {
  onFileSelect: (sessionId: string, itemCount: number, fieldnames: string[]) => void
}

export default function FileSelection({ onFileSelect }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  return (
    <div className="container">
      <div className="header">
        <h1>📊 Ranking Application</h1>
        <p>Select a CSV file or use demo data to start ranking</p>
      </div>

      <div className="content">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {/* Load CSV Option */}
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>📁</div>
            <div className="card-title">Load Your CSV File</div>
            <div className="card-description">Upload a CSV file with items to rank</div>
            <button
              className="btn-primary"
              style={{ width: '100%' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>

          {/* Demo Data Option */}
          <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>⭐</div>
            <div className="card-title">Try Demo Data</div>
            <div className="card-description">Use sample data to see how it works</div>
            <button
              className="btn-accent"
              style={{ width: '100%' }}
              onClick={handleDemoData}
            >
              Load Demo
            </button>
          </div>

          {/* Resume Option */}
          <div className="card" style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>
            <div style={{ fontSize: '24px', marginBottom: '15px' }}>⏸️</div>
            <div className="card-title">Resume Previous</div>
            <div className="card-description">Continue a previous ranking session</div>
            <button
              className="btn-success"
              style={{ width: '100%' }}
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>

        <div style={{ fontSize: '9px', color: '#999999', textAlign: 'center' }}>
          CSV files should have headers. Each row will be ranked.
        </div>
      </div>
    </div>
  )
}
