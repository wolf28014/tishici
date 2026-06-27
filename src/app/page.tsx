'use client'

import * as React from 'react'
import { usePromptStore } from '@/lib/prompt-store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles, Search, Plus, Pin, Clock, TrendingUp, Library, Star,
} from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { MobileFilter } from '@/components/mobile-filter'
import { PromptCard } from '@/components/prompt-card'
import { PromptFormDialog } from '@/components/prompt-form-dialog'
import { PromptDetailSheet } from '@/components/prompt-detail-sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Prompt } from '@/lib/prompt-types'
import { cn } from '@/lib/utils'

export default function Home() {
  const {
    prompts, loading, fetchPrompts, fetchCategories, selectPrompt,
    searchQuery, setSearchQuery, sortBy, setSortBy,
    showFavoritesOnly, activeCategoryId,
  } = usePromptStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Prompt | null>(null)

  // initial load
  React.useEffect(() => {
    fetchCategories()
    fetchPrompts()
  }, [fetchCategories, fetchPrompts])

  // refetch when filters change (but debounce search)
  React.useEffect(() => {
    const t = setTimeout(() => fetchPrompts(), 200)
    return () => clearTimeout(t)
  }, [searchQuery, sortBy, showFavoritesOnly, activeCategoryId, fetchPrompts])

  // open detail when selectedPrompt changes
  const selectedPrompt = usePromptStore((s) => s.selectedPrompt)
  React.useEffect(() => {
    if (selectedPrompt) setDetailOpen(true)
  }, [selectedPrompt])

  const handleEdit = (p: Prompt) => {
    setEditing(p)
    setFormOpen(true)
  }

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleCloseDetail = (open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      // slight delay to allow transition
      setTimeout(() => selectPrompt(null), 100)
    }
  }

  const hasFilters = !!searchQuery || showFavoritesOnly || activeCategoryId

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-semibold leading-tight">提示词库</div>
              <div className="text-[10px] text-muted-foreground leading-tight">PromptHub</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标题、内容、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button onClick={handleNew} size="sm" className="gap-1.5 hidden sm:flex">
              <Plus className="h-4 w-4" /> 新建
            </Button>
            <Button onClick={handleNew} size="icon" className="sm:hidden h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <Sidebar onAddNew={handleNew} />

        <main className="flex-1 min-w-0">
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Mobile filter + sort row */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-4">
              <MobileFilter />
              <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Stats row (desktop) */}
            <div className="hidden lg:grid grid-cols-4 gap-3 mb-6">
              <StatCard icon={Library} label="提示词总数" value={prompts.length} color="violet" />
              <StatCard
                icon={Star}
                label="已收藏"
                value={prompts.filter((p) => p.isFavorite).length}
                color="amber"
              />
              <StatCard
                icon={Pin}
                label="已置顶"
                value={prompts.filter((p) => p.isPinned).length}
                color="rose"
              />
              <StatCard
                icon={TrendingUp}
                label="累计使用"
                value={prompts.reduce((s, p) => s + p.usageCount, 0)}
                color="emerald"
              />
            </div>

            {/* Section title + sort (desktop) */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {showFavoritesOnly ? (
                    <><Star className="h-4 w-4 text-amber-500 fill-amber-500" /> 我的收藏</>
                  ) : activeCategoryId ? (
                    <>
                      {(() => {
                        const cat = usePromptStore.getState().categories.find(c => c.id === activeCategoryId)
                        return cat?.name || '分类'
                      })()}
                    </>
                  ) : (
                    <>全部提示词</>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {loading ? '加载中...' : `共 ${prompts.length} 条`}
                  {searchQuery && ` · 关键词「${searchQuery}」`}
                </p>
              </div>
              <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <EmptyState hasFilters={hasFilters} onAdd={handleNew} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {prompts.map((p) => (
                  <PromptCard key={p.id} prompt={p} onEdit={handleEdit} />
                ))}
              </div>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t text-center text-xs text-muted-foreground">
              提示词库 · PromptHub — 管理你的 AI 创意资产
            </footer>
          </div>
        </main>
      </div>

      <PromptFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editPrompt={editing}
      />
      <PromptDetailSheet
        open={detailOpen}
        onOpenChange={handleCloseDetail}
        onEdit={handleEdit}
      />
    </div>
  )
}

function SortSelect({
  sortBy, setSortBy,
}: {
  sortBy: string
  setSortBy: (s: 'pinned' | 'recent' | 'usage' | 'favorite') => void
}) {
  return (
    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
      <SelectTrigger className="h-9 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pinned">智能排序</SelectItem>
        <SelectItem value="recent">最近添加</SelectItem>
        <SelectItem value="usage">使用最多</SelectItem>
        <SelectItem value="favorite">收藏优先</SelectItem>
      </SelectContent>
    </Select>
  )
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: typeof Pin
  label: string
  value: number
  color: 'violet' | 'amber' | 'rose' | 'emerald'
}) {
  const colorClasses = {
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
  }
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-md', colorClasses[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  )
}

function EmptyState({ hasFilters, onAdd }: { hasFilters: boolean; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Search className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium mb-1">
        {hasFilters ? '没有找到匹配的提示词' : '还没有提示词'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {hasFilters
          ? '尝试更换关键词或筛选条件，或者清空筛选条件查看全部。'
          : '创建你的第一个提示词，开始构建专属的 AI 创意库。'}
      </p>
      {!hasFilters && (
        <Button onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> 新建提示词
        </Button>
      )}
    </div>
  )
}
