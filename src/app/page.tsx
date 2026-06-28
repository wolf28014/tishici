'use client'

import * as React from 'react'
import { usePromptStore } from '@/lib/prompt-store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sparkles, Search, Plus, Pin, Clock, TrendingUp, Library, Star,
  Download, Tag as TagIcon, ShoppingBag, Snowflake, Clapperboard, Share2,
  CheckSquare, X, FolderOpen, Cloud, Wand2, Palette,
  type LucideIcon,
} from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { MobileFilter } from '@/components/mobile-filter'
import { DraggablePromptGrid } from '@/components/draggable-prompt-grid'
import { PromptFormDialog } from '@/components/prompt-form-dialog'
import { PromptDetailSheet } from '@/components/prompt-detail-sheet'
import { ImportExportDialog } from '@/components/import-export-dialog'
import { ShareDialog } from '@/components/share-dialog'
import { BatchEditDialog } from '@/components/batch-edit-dialog'
import { CollectionManagerDialog } from '@/components/collection-manager-dialog'
import { CloudSyncDialog } from '@/components/cloud-sync-dialog'
import { AIGenerateDialog } from '@/components/ai-generate-dialog'
import { PageBackgroundSettings } from '@/components/page-background-settings'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Prompt } from '@/lib/prompt-types'
import { decodePromptFromShare } from '@/lib/prompt-types'
import { cn } from '@/lib/utils'

export default function Home() {
  const {
    prompts, loading, fetchPrompts, fetchCategories, fetchTags, fetchCollections, selectPrompt,
    searchQuery, setSearchQuery, sortBy, setSortBy,
    showFavoritesOnly, activeCategoryId, activeCollectionId, activeTag, categories,
    selectionMode, setSelectionMode, selectedIds, selectAll, clearSelection,
  } = usePromptStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = React.useState(false)
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Prompt | null>(null)
  const [importExportOpen, setImportExportOpen] = React.useState(false)
  const [shareOpen, setShareOpen] = React.useState(false)
  const [sharingPrompt, setSharingPrompt] = React.useState<Prompt | null>(null)
  const [batchOpen, setBatchOpen] = React.useState(false)
  const [collectionOpen, setCollectionOpen] = React.useState(false)
  const [syncOpen, setSyncOpen] = React.useState(false)
  const [aiGenerateOpen, setAiGenerateOpen] = React.useState(false)
  const [pageBgOpen, setPageBgOpen] = React.useState(false)
  const [shareImportData, setShareImportData] = React.useState<{
    title: string
    content: string
    description?: string | null
    tags?: string[]
    author?: string | null
  } | null>(null)

  // initial load
  React.useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchCollections()
    fetchPrompts()
  }, [fetchCategories, fetchPrompts, fetchTags, fetchCollections])

  // Handle share link on page load
  React.useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash
    if (!hash.startsWith('#s=')) return

    try {
      const encoded = hash.slice(3)
      const data = decodePromptFromShare(encoded)
      if (data) {
        setShareImportData(data)
      }
    } catch (e) {
      console.error('Failed to decode share link:', e)
    }
  }, [])

  // refetch when filters change
  React.useEffect(() => {
    const t = setTimeout(() => fetchPrompts(), 200)
    return () => clearTimeout(t)
  }, [searchQuery, sortBy, showFavoritesOnly, activeCategoryId, activeCollectionId, activeTag, fetchPrompts])

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

  const handleAIGenerateApply = (generated: {
    title: string
    description: string
    content: string
    tags: string[]
    suggestedCategory: string
  }) => {
    // Open the form with the generated data pre-filled
    setEditing({
      id: '',
      title: generated.title,
      content: generated.content,
      description: generated.description,
      categoryId: null,
      category: null,
      tags: generated.tags,
      background: null,
      isFavorite: false,
      isPinned: false,
      usageCount: 0,
      rating: 0,
      author: 'AI 生成',
      source: 'ai-generate',
      sortOrder: 0,
      collectionId: null,
      collection: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Prompt)
    setFormOpen(true)
    toast({ title: 'AI 生成的内容已填入表单', description: '可继续编辑后保存' })
  }

  const handleShare = (p: Prompt) => {
    setSharingPrompt(p)
    setShareOpen(true)
  }

  const handleCloseDetail = (open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setTimeout(() => selectPrompt(null), 100)
    }
  }

  const handleShareImport = async () => {
    if (!shareImportData) return
    const { createPrompt } = usePromptStore.getState()
    const success = await createPrompt({
      title: shareImportData.title,
      content: shareImportData.content,
      description: shareImportData.description || undefined,
      tags: shareImportData.tags || [],
      author: shareImportData.author || '分享导入',
    })
    if (success) {
      toast({ title: '提示词已保存到库中' })
      history.replaceState(null, '', window.location.pathname)
    }
    setShareImportData(null)
  }

  const handleShareImportCancel = () => {
    setShareImportData(null)
    history.replaceState(null, '', window.location.pathname)
  }

  // Quick category shortcuts (ecommerce-focused)
  const quickCategories = React.useMemo(() => {
    const findCat = (name: string) => categories.find((c) => c.name === name)
    return [
      { name: '电商运营', icon: ShoppingBag, color: 'amber', cat: findCat('电商运营') },
      { name: 'AI模特商拍', icon: Snowflake, color: 'pink', cat: findCat('AI模特商拍') },
      { name: 'AI短剧制作', icon: Clapperboard, color: 'rose', cat: findCat('AI短剧制作') },
    ].filter((x) => x.cat)
  }, [categories])

  const hasFilters = !!searchQuery || showFavoritesOnly || activeCategoryId || activeTag || activeCollectionId

  // Determine current view title
  const currentTitle = React.useMemo(() => {
    if (activeTag) return `#${activeTag}`
    if (showFavoritesOnly) return '我的收藏'
    if (activeCollectionId) {
      const col = usePromptStore.getState().collections.find((c) => c.id === activeCollectionId)
      return col ? `📁 ${col.name}` : '收藏夹'
    }
    if (activeCategoryId) {
      for (const c of categories) {
        if (c.id === activeCategoryId) return c.name
        if (c.children) {
          const sub = c.children.find((s) => s.id === activeCategoryId)
          if (sub) return `${c.name} / ${sub.name}`
        }
      }
    }
    return '全部提示词'
  }, [activeTag, showFavoritesOnly, activeCategoryId, activeCollectionId, categories])

  const selectedIdsArray = Array.from(selectedIds)

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex h-14 items-center gap-2 px-3 sm:px-5">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-bold leading-tight tracking-tight">提示词库</div>
              <div className="text-[10px] text-muted-foreground leading-tight">PromptHub</div>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索标题、内容、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-muted/40 border-transparent focus-visible:bg-background"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant={selectionMode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setSelectionMode(!selectionMode)}
              title={selectionMode ? '退出批量选择' : '批量选择'}
              className="h-9 w-9"
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollectionOpen(true)}
              title="收藏夹管理"
              className="h-9 w-9"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSyncOpen(true)}
              title="跨设备云同步"
              className="h-9 w-9"
            >
              <Cloud className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setImportExportOpen(true)}
              title="导入/导出"
              className="h-9 w-9"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setAiGenerateOpen(true)}
              size="sm"
              variant="outline"
              className="gap-1.5 hidden sm:flex border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300"
              title="AI 自动生成提示词"
            >
              <Wand2 className="h-4 w-4" /> AI 生成
            </Button>
            <Button onClick={handleNew} size="sm" className="gap-1.5 hidden sm:flex">
              <Plus className="h-4 w-4" /> 新建
            </Button>
            <Button onClick={handleNew} size="icon" className="sm:hidden h-9 w-9">
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPageBgOpen(true)}
              title="页面背景设置"
              className="h-9 w-9"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Batch action bar */}
      {selectionMode && (
        <div className="sticky top-14 z-20 border-b bg-violet-50 dark:bg-violet-950/30 px-4 py-2 flex items-center gap-2">
          <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
            已选 {selectedIdsArray.length} 条
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="outline" onClick={selectAll} className="gap-1.5">
            全选
          </Button>
          <Button
            size="sm"
            onClick={() => setBatchOpen(true)}
            disabled={selectedIdsArray.length === 0}
            className="gap-1.5"
          >
            <TagIcon className="h-3.5 w-3.5" />
            批量编辑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectionMode(false)}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            退出
          </Button>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar onAddNew={handleNew} onManageCollections={() => setCollectionOpen(true)} />

        <main className="flex-1 min-w-0 bg-background">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
            {/* Mobile filter + sort row */}
            <div className="lg:hidden flex items-center justify-between gap-2 mb-5">
              <MobileFilter />
              <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Quick access for ecommerce / AI model / AI drama - Hero cards */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickCategories.map(({ name, icon: Icon, color, cat }) => {
                const totalCount = cat
                  ? cat._count.prompts + (cat.children?.reduce((s, c) => s + c._count.prompts, 0) || 0)
                  : 0
                const isActive = activeCategoryId === cat?.id
                return (
                  <button
                    key={name}
                    onClick={() => usePromptStore.getState().setActiveCategoryId(cat?.id || null)}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border p-5 text-left transition-all hover:shadow-lg hover:-translate-y-0.5',
                      isActive
                        ? 'border-primary ring-2 ring-primary/20 shadow-md'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    {/* Gradient background accent */}
                    <div className={cn(
                      'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity',
                      color === 'amber' && 'bg-gradient-to-br from-amber-50/60 to-transparent dark:from-amber-950/20',
                      color === 'pink' && 'bg-gradient-to-br from-pink-50/60 to-transparent dark:from-pink-950/20',
                      color === 'rose' && 'bg-gradient-to-br from-rose-50/60 to-transparent dark:from-rose-950/20',
                    )} />

                    <div className="relative flex items-start gap-4">
                      {/* Large icon */}
                      <div className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-xl flex-shrink-0 shadow-sm',
                        color === 'amber' && 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
                        color === 'pink' && 'bg-gradient-to-br from-pink-400 to-rose-500 text-white',
                        color === 'rose' && 'bg-gradient-to-br from-rose-400 to-red-500 text-white',
                      )}>
                        <Icon className="h-7 w-7" />
                      </div>

                      {/* Text content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-xl font-bold tracking-tight truncate">
                          {name}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                          <span className="font-medium text-foreground">{totalCount}</span>
                          条提示词
                          {totalCount > 0 && (
                            <span className="text-xs text-muted-foreground/70">
                              · 点击查看
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
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
            <div className="hidden lg:flex items-center justify-between mb-5 pb-3 border-b">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  {activeTag && <TagIcon className="h-5 w-5 text-violet-500" />}
                  {currentTitle}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {loading ? '加载中...' : `共 ${prompts.length} 条`}
                  {searchQuery && ` · 关键词「${searchQuery}」`}
                </p>
              </div>
              <SortSelect sortBy={sortBy} setSortBy={setSortBy} />
            </div>

            {/* Mobile section title */}
            <div className="lg:hidden mb-4 pb-3 border-b">
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                {activeTag && <TagIcon className="h-4 w-4 text-violet-500" />}
                {currentTitle}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {loading ? '加载中...' : `共 ${prompts.length} 条`}
              </p>
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
              <DraggablePromptGrid prompts={prompts} onEdit={handleEdit} onShare={handleShare} />
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                <span className="font-medium">提示词库 · PromptHub</span>
              </div>
              <div>管理你的 AI 创意资产 · 让每个提示词都触手可及</div>
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
        onShare={handleShare}
      />
      <ImportExportDialog
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
      />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        prompt={sharingPrompt}
      />
      <BatchEditDialog
        open={batchOpen}
        onOpenChange={setBatchOpen}
        selectedIds={selectedIdsArray}
      />
      <CollectionManagerDialog
        open={collectionOpen}
        onOpenChange={setCollectionOpen}
      />
      <CloudSyncDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
      />
      <AIGenerateDialog
        open={aiGenerateOpen}
        onOpenChange={setAiGenerateOpen}
        onApply={handleAIGenerateApply}
      />
      <PageBackgroundSettings
        open={pageBgOpen}
        onOpenChange={setPageBgOpen}
      />

      {/* Share link import dialog */}
      {shareImportData && (
        <Dialog open={true} onOpenChange={(o) => { if (!o) handleShareImportCancel() }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-violet-500" />
                从分享链接导入
              </DialogTitle>
              <DialogDescription>
                有人向你分享了一条提示词，是否保存到你的库中？
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-xs text-muted-foreground mb-1">标题</div>
                <div className="font-medium">{shareImportData.title}</div>
              </div>
              {shareImportData.description && (
                <div className="text-sm text-muted-foreground">{shareImportData.description}</div>
              )}
              {shareImportData.tags && shareImportData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {shareImportData.tags.map((t) => (
                    <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleShareImportCancel}>取消</Button>
              <Button onClick={handleShareImport}>保存到我的库</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function SortSelect({
  sortBy, setSortBy,
}: {
  sortBy: string
  setSortBy: (s: 'pinned' | 'recent' | 'usage' | 'favorite' | 'custom' | 'rating') => void
}) {
  return (
    <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
      <SelectTrigger className="h-9 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pinned">智能排序</SelectItem>
        <SelectItem value="custom">自定义排序（可拖拽）</SelectItem>
        <SelectItem value="recent">最近添加</SelectItem>
        <SelectItem value="usage">使用最多</SelectItem>
        <SelectItem value="favorite">收藏优先</SelectItem>
        <SelectItem value="rating">评分最高</SelectItem>
      </SelectContent>
    </Select>
  )
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: LucideIcon
  label: string
  value: number
  color: 'violet' | 'amber' | 'rose' | 'emerald'
}) {
  const colorClasses = {
    violet: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300',
    amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300',
    rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300',
  }
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
      <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg', colorClasses[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
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
