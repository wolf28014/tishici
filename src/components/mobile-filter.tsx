'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Library, Star, SlidersHorizontal, ChevronRight, Tag as TagIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePromptStore } from '@/lib/prompt-store'
import { CategoryIcon } from '@/components/category-icon'
import { getColorClass } from '@/lib/prompt-types'

export function MobileFilter() {
  const {
    categories, activeCategoryId, setActiveCategoryId,
    showFavoritesOnly, setShowFavoritesOnly, prompts,
    tags, activeTag, setActiveTag,
  } = usePromptStore()
  const [open, setOpen] = React.useState(false)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set())

  const total = prompts.length
  const favoriteCount = prompts.filter((p) => p.isFavorite).length

  const activeLabel = activeTag
    ? `#${activeTag}`
    : showFavoritesOnly
      ? '我的收藏'
      : activeCategoryId
        ? (() => {
            for (const c of categories) {
              if (c.id === activeCategoryId) return c.name
              if (c.children) {
                const sub = c.children.find((s) => s.id === activeCategoryId)
                if (sub) return sub.name
              }
            }
            return '分类'
          })()
        : '全部'

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="max-w-[80px] truncate">{activeLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-base">筛选</SheetTitle>
        </SheetHeader>
        <div className="p-3 space-y-1">
          <button
            onClick={() => {
              setActiveCategoryId(null)
              setShowFavoritesOnly(false)
              setActiveTag(null)
              setOpen(false)
            }}
            className={cn(
              'w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent',
              activeCategoryId === null && !showFavoritesOnly && !activeTag && 'bg-accent',
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
              setActiveTag(null)
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
            const active = activeCategoryId === c.id && !showFavoritesOnly && !activeTag
            const hasChildren = c.children && c.children.length > 0
            const expanded = expandedIds.has(c.id)
            return (
              <div key={c.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setActiveCategoryId(active ? null : c.id)
                      setShowFavoritesOnly(false)
                      setActiveTag(null)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex-1 flex items-center gap-2 px-2 py-2 rounded-l-md text-sm hover:bg-accent min-w-0',
                      active && 'bg-accent',
                    )}
                  >
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', color.soft, color.text)}>
                      <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 text-left truncate">{c.name}</span>
                    <Badge variant="secondary" className="text-xs font-normal">{c._count.prompts}</Badge>
                  </button>
                  {hasChildren && (
                    <button
                      onClick={() => toggleExpand(c.id)}
                      className="p-1.5 rounded-r-md hover:bg-accent flex-shrink-0"
                    >
                      <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded && 'rotate-90')} />
                    </button>
                  )}
                </div>
                {hasChildren && expanded && (
                  <div className="ml-4 mt-0.5 mb-1 border-l pl-2 space-y-0.5">
                    {c.children!.map((sub) => {
                      const subColor = getColorClass(sub.color)
                      const subActive = activeCategoryId === sub.id && !showFavoritesOnly && !activeTag
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveCategoryId(subActive ? null : sub.id)
                            setShowFavoritesOnly(false)
                            setActiveTag(null)
                            setOpen(false)
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-md text-sm hover:bg-accent',
                            subActive && 'bg-accent',
                          )}
                        >
                          <span className={cn('flex h-5 w-5 items-center justify-center rounded', subColor.soft, subColor.text)}>
                            <CategoryIcon name={sub.icon} className="h-3 w-3" />
                          </span>
                          <span className="flex-1 text-left truncate text-[13px]">{sub.name}</span>
                          <Badge variant="secondary" className="text-[10px] font-normal">{sub._count.prompts}</Badge>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Tag cloud */}
          {tags.length > 0 && (
            <>
              <div className="px-2 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <TagIcon className="h-3 w-3" />
                <span>标签云</span>
              </div>
              <div className="px-2 pb-2 flex flex-wrap gap-1.5">
                {tags.slice(0, 30).map((t) => (
                  <button
                    key={t.name}
                    onClick={() => {
                      setActiveTag(activeTag === t.name ? null : t.name)
                      setShowFavoritesOnly(false)
                      setOpen(false)
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border',
                      activeTag === t.name
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 hover:bg-muted border-transparent',
                    )}
                  >
                    {t.name}
                    <span className={cn('text-[10px]', activeTag === t.name ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
