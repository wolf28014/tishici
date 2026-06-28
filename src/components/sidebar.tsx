'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Library, Star, Layers, Plus, ChevronRight, Tag as TagIcon,
  FolderPlus, FolderOpen,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePromptStore } from '@/lib/prompt-store'
import { CategoryIcon } from '@/components/category-icon'
import { getColorClass } from '@/lib/prompt-types'

// Use store actions directly to avoid stale closure issues
const storeActions = () => usePromptStore.getState()

type Props = {
  onAddNew: () => void
  onManageCollections: () => void
}

export function Sidebar({ onAddNew, onManageCollections }: Props) {
  const {
    categories, activeCategoryId, setActiveCategoryId,
    showFavoritesOnly, setShowFavoritesOnly, prompts,
    expandedCategoryIds, toggleCategoryExpanded,
    tags, activeTag, setActiveTag,
    collections, activeCollectionId, setActiveCollectionId,
  } = usePromptStore()

  const total = prompts.length
  const favoriteCount = prompts.filter((p) => p.isFavorite).length

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r bg-card/50 h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-3 border-b">
        <Button onClick={onAddNew} className="w-full gap-1.5" size="sm">
          <Plus className="h-4 w-4" /> 新建提示词
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1 sidebar-scroll">
        <div className="px-2 pb-1 pt-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          浏览
        </div>

        <SidebarItem
          active={activeCategoryId === null && !showFavoritesOnly && !activeTag && !activeCollectionId}
          onClick={() => {
            const s = storeActions()
            s.setActiveCategoryId(null)
            s.setShowFavoritesOnly(false)
            s.setActiveTag(null)
            s.setActiveCollectionId(null)
          }}
          icon={Library}
          label="全部提示词"
          count={total}
        />

        <SidebarItem
          active={showFavoritesOnly}
          onClick={() => {
            const s = storeActions()
            s.setShowFavoritesOnly(true)
            s.setActiveCategoryId(null)
            s.setActiveTag(null)
            s.setActiveCollectionId(null)
          }}
          icon={Star}
          label="我的收藏"
          count={favoriteCount}
          accent="amber"
        />

        {/* Collections section */}
        <div className="px-2 pb-1 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>收藏夹</span>
          <button
            onClick={onManageCollections}
            className="text-muted-foreground hover:text-foreground"
            title="管理收藏夹"
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </button>
        </div>

        {collections.length === 0 ? (
          <button
            onClick={onManageCollections}
            className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            + 创建第一个收藏夹
          </button>
        ) : (
          collections.map((c) => {
            const active = activeCollectionId === c.id && !showFavoritesOnly && !activeTag
            const color = getColorClass(c.color)
            return (
              <button
                key={c.id}
                onClick={() => {
                  const s = storeActions()
                  s.setActiveCollectionId(active ? null : c.id)
                  s.setShowFavoritesOnly(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors hover:bg-accent',
                  active && 'bg-accent',
                )}
              >
                <span className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
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
          })
        )}

        <div className="px-2 pb-1 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
          <span>分类</span>
        </div>

        {categories.map((c) => {
          const color = getColorClass(c.color)
          const active = activeCategoryId === c.id && !showFavoritesOnly && !activeTag && !activeCollectionId
          const hasChildren = c.children && c.children.length > 0
          const expanded = expandedCategoryIds.has(c.id)
          return (
            <div key={c.id}>
              <div className="flex items-center">
                <button
                  onClick={() => {
                    const s = storeActions()
                    s.setActiveCategoryId(active ? null : c.id)
                    s.setShowFavoritesOnly(false)
                    s.setActiveTag(null)
                  }}
                  className={cn(
                    'flex-1 flex items-center gap-2 px-2 py-1.5 rounded-l-md text-sm transition-colors hover:bg-accent min-w-0',
                    active && 'bg-accent',
                  )}
                >
                  <span className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
                    color.soft, color.text,
                  )}>
                    <CategoryIcon name={c.icon} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 text-left truncate">{c.name}</span>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {c._count.prompts}
                  </Badge>
                </button>
                {hasChildren && (
                  <button
                    onClick={() => toggleCategoryExpanded(c.id)}
                    className="p-1 rounded-r-md hover:bg-accent flex-shrink-0"
                    title={expanded ? '收起' : '展开'}
                  >
                    <ChevronRight className={cn(
                      'h-3.5 w-3.5 text-muted-foreground transition-transform',
                      expanded && 'rotate-90',
                    )} />
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {hasChildren && expanded && (
                <div className="ml-4 mt-0.5 mb-1 border-l pl-2 space-y-0.5">
                  {c.children!.map((sub) => {
                    const subColor = getColorClass(sub.color)
                    const subActive = activeCategoryId === sub.id && !showFavoritesOnly && !activeTag && !activeCollectionId
                    return (
                      <button
                        key={sub.id}
                        onClick={() => {
                          const s = storeActions()
                          s.setActiveCategoryId(subActive ? null : sub.id)
                          s.setShowFavoritesOnly(false)
                          s.setActiveTag(null)
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 pl-2 pr-2 py-1 rounded-md text-sm transition-colors hover:bg-accent',
                          subActive && 'bg-accent',
                        )}
                      >
                        <span className={cn(
                          'flex h-5 w-5 items-center justify-center rounded flex-shrink-0',
                          subColor.soft, subColor.text,
                        )}>
                          <CategoryIcon name={sub.icon} className="h-3 w-3" />
                        </span>
                        <span className="flex-1 text-left truncate text-[13px]">{sub.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          {sub._count.prompts}
                        </Badge>
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
            <div className="px-2 pb-1 pt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <TagIcon className="h-3 w-3" />
              <span>标签云</span>
            </div>
            <div className="px-2 pb-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 30).map((t) => (
                <button
                  key={t.name}
                  onClick={() => {
                    const s = storeActions()
                    s.setActiveTag(activeTag === t.name ? null : t.name)
                    s.setShowFavoritesOnly(false)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border',
                    activeTag === t.name
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 hover:bg-muted border-transparent',
                  )}
                  title={`${t.name} (${t.count})`}
                >
                  <span>{t.name}</span>
                  <span className={cn(
                    'text-[10px]',
                    activeTag === t.name ? 'text-primary-foreground/70' : 'text-muted-foreground',
                  )}>
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {categories.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground">暂无分类</div>
        )}
      </div>

      <div className="border-t p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {categories.length} 个分类 / {total} 条提示词
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
