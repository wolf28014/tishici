'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Library, Star, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePromptStore } from '@/lib/prompt-store'
import { CategoryIcon } from '@/components/category-icon'
import { getColorClass } from '@/lib/prompt-types'

export function MobileFilter() {
  const {
    categories, activeCategoryId, setActiveCategoryId,
    showFavoritesOnly, setShowFavoritesOnly, prompts,
  } = usePromptStore()
  const [open, setOpen] = React.useState(false)

  const total = prompts.length
  const favoriteCount = prompts.filter((p) => p.isFavorite).length

  const activeLabel = showFavoritesOnly
    ? '我的收藏'
    : activeCategoryId
      ? categories.find((c) => c.id === activeCategoryId)?.name || '分类'
      : '全部'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="max-w-[80px] truncate">{activeLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-base">筛选</SheetTitle>
        </SheetHeader>
        <div className="p-3 space-y-1">
          <button
            onClick={() => {
              setActiveCategoryId(null)
              setShowFavoritesOnly(false)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent',
              activeCategoryId === null && !showFavoritesOnly && 'bg-accent',
            )}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Library className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-left">全部提示词</span>
            <Badge variant="secondary" className="text-xs">{total}</Badge>
          </button>

          <button
            onClick={() => {
              setShowFavoritesOnly(true)
              setActiveCategoryId(null)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent',
              showFavoritesOnly && 'bg-accent',
            )}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              <Star className="h-3.5 w-3.5" />
            </span>
            <span className="flex-1 text-left">我的收藏</span>
            <Badge variant="secondary" className="text-xs">{favoriteCount}</Badge>
          </button>

          <div className="px-2 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            分类
          </div>

          {categories.map((c) => {
            const color = getColorClass(c.color)
            const active = activeCategoryId === c.id && !showFavoritesOnly
            return (
              <button
                key={c.id}
                onClick={() => {
                  setActiveCategoryId(active ? null : c.id)
                  setShowFavoritesOnly(false)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent',
                  active && 'bg-accent',
                )}
              >
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', color.soft, color.text)}>
                  <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 text-left truncate">{c.name}</span>
                <Badge variant="secondary" className="text-xs font-normal">
                  {c._count.prompts}
                </Badge>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
