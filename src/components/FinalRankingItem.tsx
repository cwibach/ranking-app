import { Button, Typography, Box } from '@mui/material'

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
        <Box sx={{
            p: 1,
            border: "1px dashed grey"
          }}>
            <Typography variant='h4' sx={{mb:1}}>
                {firstValue}
            </Typography>

            {Object.entries(item).map(([key, value]) => (
                <div key={key}>
                    <Typography variant="body1" sx={{mb:1}}>
                        <b>{key}:</b> {value}
                    </Typography>
                </div>
            ))}

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
    const [firstKey, firstValue] = Object.entries(item)[0]
    const newItem = item

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