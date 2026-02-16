import { useState, useEffect } from 'react'
import { Button, Typography } from '@mui/material'

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
    const [firstKey, firstValue] = Object.entries(item)[0]
    return(
        <div>
            <Typography variant='h4'>
                {firstValue}
            </Typography>

            {Object.entries(item).map(([key, value]) => (
                <p key={key}>
                    <Typography variant="body2">
                        <strong>{key}:</strong> {value}
                    </Typography>
                </p>
            ))}

            <Button
                onClick={() => hideView()}
            >
                Hide Details
            </Button>
        </div>
    )
}

export const UnExpandedItemInfo = ({item, index, expandView}: Props2) => {
    const [firstKey, firstValue] = Object.entries(item)[0]
    const newItem = item

    return(
        <div>
            <Typography variant='h4'>
                {firstValue}
            </Typography>

            <Button
                onClick={() => expandView(index)}
            >
                Show Item Details
            </Button>
        </div>
    )
}