'use client'

import * as React from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Prompt } from '@/lib/prompt-types'
import { usePromptStore } from '@/lib/prompt-store'
import { PromptCard } from '@/components/prompt-card'

type Props = {
  prompts: Prompt[]
  onEdit: (p: Prompt) => void
  onShare: (p: Prompt) => void
}

export function DraggablePromptGrid({ prompts, onEdit, onShare }: Props) {
  const { reorderPrompts, sortBy, selectionMode } = usePromptStore()
  const isDragEnabled = sortBy === 'custom' && !selectionMode

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = prompts.findIndex((p) => p.id === active.id)
    const newIndex = prompts.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(prompts, oldIndex, newIndex)
    await reorderPrompts(newOrder.map((p) => p.id))
  }

  // When drag is not enabled, render simple grid (no sortable wrapper)
  if (!isDragEnabled) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {prompts.map((p) => (
          <PromptCard key={p.id} prompt={p} onEdit={onEdit} onShare={onShare} />
        ))}
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={prompts.map((p) => p.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {prompts.map((p) => (
            <SortableCard key={p.id} prompt={p} onEdit={onEdit} onShare={onShare} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableCard({ prompt, onEdit, onShare }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: prompt.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Pass drag listeners to the drag handle via a context or prop */}
      <DragHandleProvider listeners={listeners}>
        <PromptCard prompt={prompt} onEdit={onEdit} onShare={onShare} />
      </DragHandleProvider>
    </div>
  )
}

// Simple context to pass drag listeners to the card's drag handle
const DragListenerContext = React.createContext<Record<string, unknown> | null>(null)

function DragHandleProvider({ listeners, children }: { listeners: Record<string, unknown>; children: React.ReactNode }) {
  return <DragListenerContext.Provider value={listeners}>{children}</DragListenerContext.Provider>
}

export function useDragListeners() {
  return React.useContext(DragListenerContext)
}
