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
    // we only need the value for the header; ignore the key
    const [_firstKey, firstValue] = Object.entries(item)[0] || ['','']
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
    const entries = Object.entries(item)
    // firstKey is only used for readability; prefix with _ to avoid unused
    // variable lint errors
    const [__firstKey, firstValue] = entries.length > 0 ? entries[0] : ['','']
    // newItem was unused; remove it to clean lint warnings

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