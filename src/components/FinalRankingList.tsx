import { useState } from 'react'
import { ExpandedItemInfo, UnExpandedItemInfo } from "./FinalRankingItem.tsx"

interface Item {
  [key: string]: string
}

interface Props {
    itemList: Item[]
}

export default function FinalItemList({itemList}: Props) {
    const [expanded, setExpanded] = useState(-1)

    const expandItem = (itemIndex: number) => {
        setExpanded(itemIndex)
    }

    const unExpandItem = () => {
        setExpanded(-1)
    }

    return(
        <div>
            {itemList.map((item, index) => {
                // use index as key because CSV items may lack unique ids; avoid
                // warning by providing something stable per render
                return(
                    <div key={index}>
                        {(expanded === index) ? (
                            <ExpandedItemInfo
                                item={item}
                                hideView={unExpandItem}/>
                        ) : (
                            <UnExpandedItemInfo
                                item={item}
                                index={index}
                                expandView={expandItem}/>
                        )}

                    </div>
                )
            })}
        </div>
    )
}