import { EditorBtns } from '@/lib/constants'
import React from 'react'

const TwoColumnsPlaceholder = () => {
    
    const handleDragStart = (e: React.DragEvent, type: EditorBtns) => {
        if(type === null) return;

        e.dataTransfer.setData("componentType", type);
    }

    return (
    <div draggable
    onDragStart={(e) => handleDragStart(e, "2Col")}
    className="h-14 w-14 bg-muted/70 rounded-lg p-2 flex flex-row gap-[4px]"
    >
        <div className='border-dashed border-[1px] h-full rounded-sm bg-muted-foreground/50 w-full' />
        <div className='border-dashed border-[1px] h-full rounded-sm bg-muted-foreground/50 w-full' />
    </div>
    )
}

export default TwoColumnsPlaceholder