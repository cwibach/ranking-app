import { useState, useEffect } from 'react'
import { Button } from '@mui/material'

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
    return(
        <div>
            {Object.entries(item).map(([key, value]) => (
                <p key={key}>
                    <strong>{key}:</strong> {value}
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
            <h3>{firstValue}</h3>

            <Button
                onClick={() => expandView(index)}
            >
                Show Item Details
            </Button>
        </div>
    )
}