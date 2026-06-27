'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Library, Star, Layers, Plus, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePromptStore } from '@/lib/prompt-store'
import { CategoryIcon } from '@/components/category-icon'
import { getColorClass } from '@/lib/prompt-types'

type Props = {
  onAddNew: () => void
}

export function Sidebar({ onAddNew }: Props) {
  const {
    categories, activeCategoryId, setActiveCategoryId,
    showFavoritesOnly, setShowFavoritesOnly, prompts,
  } = usePromptStore()

  const total = prompts.length

  const favoriteCount = prompts.filter((p) => p.isFavorite).length

  return (
    <aside className="hidden lg:flex flex-col w-60 border-r bg-card/50 h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-3 border-b">
        <Button onClick={onAddNew} className="w-full gap-1.5" size="sm">
          <Plus className="h-4 w-4" /> 新建提示词
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          浏览
        </div>

        <SidebarItem
          active={activeCategoryId === null && !showFavoritesOnly}
          onClick={() => {
            setActiveCategoryId(null)
            setShowFavoritesOnly(false)
          }}
          icon={Library}
          label="全部提示词"
          count={total}
        />

        <SidebarItem
          active={showFavoritesOnly}
          onClick={() => {
            setShowFavoritesOnly(true)
            setActiveCategoryId(null)
          }}
          icon={Star}
          label="我的收藏"
          count={favoriteCount}
          accent="amber"
        />

        <div className="px-2 pb-1 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                'hover:bg-accent',
                active && 'bg-accent',
              )}
            >
              <span className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md',
                color.soft, color.text,
              )}>
                <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 text-left truncate">{c.name}</span>
              <Badge variant="secondary" className="text-xs font-normal">
                {c._count.prompts}
              </Badge>
            </button>
          )
        })}

        {categories.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground">暂无分类</div>
        )}
      </div>

      <div className="border-t p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          共 {categories.length} 个分类 / {total} 条提示词
        </div>
      </div>
    </aside>
  )
}

function SidebarItem({
  active, onClick, icon: Icon, label, count, accent,
}: {
  active: boolean
  onClick: () => void
  icon: LucideIcon
  label: string
  count: number
  accent?: 'amber'
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent',
        active && 'bg-accent',
      )}
    >
      <span className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md',
        accent === 'amber'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
          : 'bg-muted text-muted-foreground',
      )}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 text-left">{label}</span>
      <Badge variant="secondary" className="text-xs font-normal">
        {count}
      </Badge>
    </button>
  )
}
