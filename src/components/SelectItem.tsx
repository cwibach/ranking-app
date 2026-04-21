import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'

export interface Item {
  [key: string]: string
}

interface Props {
  item: Item
  fieldnames: string[]
  header: string
  headerClassName?: string
  buttonText: string
  buttonClassName?: string
  onSelect: () => void
}

function ImageField({ label, url }: { label: string; url: string | undefined }) {
  const [errored, setErrored] = useState(false)

  if (!url) {
    return (
      <div className="item-field">
        <Typography className="item-field-label" variant="body1" sx={{ mb: 0 }}>
          <b>{label}:</b> N/A
        </Typography>
      </div>
    )
  }

  if (errored) {
    return (
      <div className="item-field">
        <Typography className="item-field-label" variant="body1" sx={{ mb: 0}}>
          <b>{label}:</b> {url}
        </Typography>
      </div>
    )
  }

  return (
    <div className="item-field">
      <Box
        component="img"
        src={url}
        alt={label}
        loading="lazy"
        onError={() => setErrored(true)}
        sx={{
          display: 'block',
          mx: 'auto',
          maxWidth: '100%',
          maxHeight: 240,
          objectFit: 'contain'
        }}
      />
    </div>
  )
}

export default function SelectItem({
  item,
  fieldnames,
  header,
  headerClassName,
  buttonText,
  buttonClassName,
  onSelect
}: Props) {
  return (
    <Box
      className="panel-content"
      sx={{
        p: 1,
        // border: 'var(--dashed-border)',
        ml: 0
      }}
    >
      <Typography className={headerClassName} variant="h4" sx={{ mb: 2 }}>
        {header}
      </Typography>

      {fieldnames.map((field) => {
        const normalized = field.trim().toLowerCase()
        const value = item[field]

        if (normalized === 'image') {
          return <ImageField key={field} label={field} url={value} />
        }

        return (
          <div key={field} className="item-field">
            <Typography className="item-field-label" variant="body1" sx={{ mb: 0 }}>
              <b>{field}:</b> {value || 'N/A'}
            </Typography>
          </div>
        )
      })}

      <Button
        className={buttonClassName}
        onClick={onSelect}
        variant="contained"
        sx={{ mt: 'auto' }}
      >
        {buttonText}
      </Button>
    </Box>
  )
}
