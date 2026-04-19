import { Button, Typography, Box } from '@mui/material'
import { useState } from 'react'

interface Item {
  [key: string]: string
}

interface Props {
    item: Item
    hideView: () => void
}

interface Props2 {
    item: Item
    index: number
    expandView: (index: number) => void
}

export const ExpandedItemInfo = ({item, hideView}: Props) => {
    const [, firstValue] = Object.entries(item)[0]

    const ImageField = ({ label, url }: { label: string; url: string | undefined }) => {
        const [errored, setErrored] = useState(false)

        if (!url) {
            return (
                <div key={label}>
                    <Typography variant="body1" sx={{mb:1}}>
                        <b>{label}:</b> N/A
                    </Typography>
                </div>
            )
        }

        if (errored) {
            return (
                <div key={label}>
                    <Typography variant="body1" sx={{mb:1}}>
                        <b>{label}:</b> {url}
                    </Typography>
                </div>
            )
        }

        return (
            <div key={label}>
                <Typography variant="body1" sx={{mb:1}}>
                    <b>{label}:</b>
                </Typography>
                <Box
                    component="img"
                    src={url}
                    alt={label}
                    loading="lazy"
                    onError={() => setErrored(true)}
                    sx={{
                        display: 'block',
                        maxWidth: '100%',
                        maxHeight: 240,
                        objectFit: 'contain',
                        mb: 1
                    }}
                />
            </div>
        )
    }

    return(
        <Box sx={{
            p: 1,
            border: "1px dashed grey"
          }}>
            <Typography variant='h4' sx={{mb:1}}>
                {firstValue}
            </Typography>

            {Object.entries(item).map(([key, value]) => {
                const normalized = key.trim().toLowerCase()
                if (normalized === 'image') {
                    return <ImageField key={key} label={key} url={value} />
                }

                return (
                    <div key={key}>
                        <Typography variant="body1" sx={{mb:1}}>
                            <b>{key}:</b> {value}
                        </Typography>
                    </div>
                )
            })}

            <Button
                onClick={() => hideView()}
                variant="contained"
                sx={{mb:1, mt:1}}
            >
                Hide Details
            </Button>
        </Box>
    )
}

export const UnExpandedItemInfo = ({item, index, expandView}: Props2) => {
    const [, firstValue] = Object.entries(item)[0]

    return(
        <Box sx={{
            p: 1,
            border: "1px dashed grey"
          }}>
            <Typography variant='h4'>
                {firstValue}
            </Typography>

            <Button
                onClick={() => expandView(index)}
                variant="outlined"
                sx={{mb:1, mt:1}}
            >
                Show Item Details
            </Button>
        </Box>
    )
}