import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { DndContext, PointerSensor, closestCenter, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ExpandedItemInfo, UnExpandedItemInfo } from "./FinalRankingItem.tsx"

interface Item {
    [key: string]: string | number | undefined
    __rankId?: number
}

interface Props {
    itemList: Item[]
    onReorder?: (newOrder: Item[]) => void
}

function SortableRow({ id, children }: { id: number; children: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    const translateOnly = transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined

    const style: CSSProperties = {
        transform: translateOnly,
        transition,
        opacity: isDragging ? 0.6 : undefined,
        cursor: 'default'
    }

    return (
        <div ref={setNodeRef} style={style} className="final-rank-row">
            <div className="final-rank-handle" {...attributes} {...listeners} aria-label="Drag to reorder">
                <div className="final-rank-handle-dots" aria-hidden>
                    <span className="final-rank-handle-dot" />
                    <span className="final-rank-handle-dot" />
                    <span className="final-rank-handle-dot" />
                    <span className="final-rank-handle-dot" />
                    <span className="final-rank-handle-dot" />
                    <span className="final-rank-handle-dot" />
                    
                </div>
            </div>
            <div className="final-rank-content">
                {children}
            </div>
        </div>
    )
}

export default function FinalItemList({ itemList, onReorder }: Props) {
    const [items, setItems] = useState<Item[]>(itemList)
    const [expandedId, setExpandedId] = useState<number | null>(null)

    useEffect(() => {
        setItems(itemList)
    }, [itemList])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 10 }
        })
    )

    const itemIds = useMemo(() => {
        return items.map((item, index) => item.__rankId ?? index)
    }, [items])

    const expandItem = (itemId: number) => {
        setExpandedId(itemId)
    }

    const unExpandItem = () => {
        setExpandedId(null)
    }

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        setItems((prev) => {
            const oldIndex = prev.findIndex((it, i) => (it.__rankId ?? i) === active.id)
            const newIndex = prev.findIndex((it, i) => (it.__rankId ?? i) === over.id)
            if (oldIndex < 0 || newIndex < 0) return prev

            const next = arrayMove(prev, oldIndex, newIndex)
            onReorder?.(next)
            return next
        })
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                <div>
                    {items.map((item, index) => {
                        const id = item.__rankId ?? index
                        return (
                            <div key={id} style={{ marginBottom: 8 }}>
                                <SortableRow id={id}>
                                    {(expandedId === id) ? (
                                        <ExpandedItemInfo item={item} hideView={unExpandItem} />
                                    ) : (
                                        <UnExpandedItemInfo item={item} itemId={id} expandView={expandItem} />
                                    )}
                                </SortableRow>
                            </div>
                        )
                    })}
                </div>
            </SortableContext>
        </DndContext>
    )
}