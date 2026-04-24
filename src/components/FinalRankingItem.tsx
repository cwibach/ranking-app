import { Button, Typography, Box } from '@mui/material'
import { useState } from 'react'

interface Item {
    [key: string]: string | number | undefined
    __rankId?: number
}

interface Props {
    item: Item
    hideView: () => void
}

interface Props2 {
    item: Item
    itemId: number
    expandView: (itemId: number) => void
}

const isInternalKey = (key: string) => key === '__rankId' || key.startsWith('__');

const getPrimaryValue = (item: Item) => {
    const entry = Object.entries(item).find(([key]) => !isInternalKey(key));
    const value = entry?.[1];
    return value === null || value === undefined ? '' : String(value);
};

export const ExpandedItemInfo = ({item, hideView}: Props) => {
    const firstValue = getPrimaryValue(item)

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
            border: 'var(--dashed-border)'
          }}>
            <Typography variant='h4' sx={{mb:1}}>
                {firstValue}
            </Typography>

            {Object.entries(item).filter(([key]) => !isInternalKey(key)).map(([key, value]) => {
                const normalized = key.trim().toLowerCase()
                if (normalized === 'image') {
                    return <ImageField key={key} label={key} url={typeof value === 'string' ? value : undefined} />
                }

                return (
                    <div key={key}>
                        <Typography variant="body1" sx={{mb:1}}>
                            <b>{key}:</b> {value === null || value === undefined ? '' : String(value)}
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

export const UnExpandedItemInfo = ({item, itemId, expandView}: Props2) => {
    const firstValue = getPrimaryValue(item)

    return(
        <Box sx={{
            p: 1,
            border: 'var(--dashed-border)'
          }}>
            <Typography variant='h4'>
                {firstValue}
            </Typography>

            <Button
                onClick={() => expandView(itemId)}
                variant="outlined"
                sx={{mb:1, mt:1}}
            >
                Show Item Details
            </Button>
        </Box>
    )
}