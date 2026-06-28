'use client'

import * as React from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Settings2, Plus, Trash2, GripVertical, RotateCcw, Check } from 'lucide-react'
import { usePromptStore } from '@/lib/prompt-store'
import { useQuickTags, type QuickTag } from '@/lib/settings-store'
import { useToast } from '@/hooks/use-toast'
import { CategoryIcon, ICON_NAMES } from '@/components/category-icon'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COLOR_OPTIONS: Array<QuickTag['color']> = ['amber', 'pink', 'rose', 'violet', 'emerald', 'sky', 'teal', 'orange']

const COLOR_CLASSES: Record<string, string> = {
  amber: 'bg-gradient-to-br from-amber-400 to-orange-500',
  pink: 'bg-gradient-to-br from-pink-400 to-rose-500',
  rose: 'bg-gradient-to-br from-rose-400 to-red-500',
  violet: 'bg-gradient-to-br from-violet-400 to-purple-500',
  emerald: 'bg-gradient-to-br from-emerald-400 to-green-500',
  sky: 'bg-gradient-to-br from-sky-400 to-blue-500',
  teal: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  orange: 'bg-gradient-to-br from-orange-400 to-amber-600',
}

export function QuickTagsSettings({ open, onOpenChange }: Props) {
  const { categories } = usePromptStore()
  const { tags, saveTags, loaded } = useQuickTags()
  const { toast } = useToast()
  const [editTags, setEditTags] = React.useState<QuickTag[]>([])
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (open && loaded) {
      setEditTags([...tags])
    }
  }, [open, loaded, tags])

  const handleAdd = () => {
    const newTag: QuickTag = {
      id: `tag-${Date.now()}`,
      name: '新标签',
      icon: 'Star',
      color: 'violet',
      categoryId: null,
    }
    setEditTags([...editTags, newTag])
  }

  const handleRemove = (id: string) => {
    setEditTags(editTags.filter((t) => t.id !== id))
  }

  const handleUpdate = (id: string, updates: Partial<QuickTag>) => {
    setEditTags(editTags.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    const newTags = [...editTags]
    const [dragged] = newTags.splice(dragIndex, 1)
    newTags.splice(index, 0, dragged)
    setEditTags(newTags)
    setDragIndex(index)
  }

  const handleSave = () => {
    saveTags(editTags)
    toast({ title: '快捷标签已保存', description: `共 ${editTags.length} 个标签` })
    onOpenChange(false)
  }

  const handleReset = () => {
    if (!confirm('确定恢复默认标签？当前修改将丢失。')) return
    const defaults: QuickTag[] = [
      { id: 'default-1', name: '电商运营', icon: 'ShoppingBag', color: 'amber', categoryId: null },
      { id: 'default-2', name: 'AI模特商拍', icon: 'Snowflake', color: 'pink', categoryId: null },
      { id: 'default-3', name: 'AI短剧制作', icon: 'Clapperboard', color: 'rose', categoryId: null },
    ]
    setEditTags(defaults)
  }

  // 获取所有分类（含子分类）的扁平列表
  const allCategories = React.useMemo(() => {
    const flat: Array<{ id: string; name: string; parentName?: string }> = []
    for (const c of categories) {
      flat.push({ id: c.id, name: c.name })
      for (const sub of c.children || []) {
        flat.push({ id: sub.id, name: sub.name, parentName: c.name })
      }
    }
    return flat
  }, [categories])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-violet-500" />
            顶部快捷标签设置
          </DialogTitle>
          <DialogDescription>
            自定义顶部显示的快捷标签，可添加、删除、排序、修改图标和颜色
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Preview */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs text-muted-foreground mb-2">预览（拖拽可排序）：</div>
            <div className="flex flex-wrap gap-2">
              {editTags.map((tag, index) => (
                <div
                  key={tag.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-move',
                    COLOR_CLASSES[tag.color] || COLOR_CLASSES.violet,
                    'text-white shadow-sm',
                    dragIndex === index && 'opacity-50',
                  )}
                >
                  <GripVertical className="h-3 w-3" />
                  <CategoryIcon name={tag.icon} className="h-3.5 w-3.5" />
                  {tag.name}
                </div>
              ))}
              {editTags.length === 0 && (
                <span className="text-xs text-muted-foreground">暂无标签，点击下方添加</span>
              )}
            </div>
          </div>

          {/* Edit list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {editTags.map((tag) => (
              <div key={tag.id} className="rounded-md border p-3 space-y-2 bg-card">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md flex-shrink-0',
                    COLOR_CLASSES[tag.color] || COLOR_CLASSES.violet,
                    'text-white',
                  )}>
                    <CategoryIcon name={tag.icon} className="h-4 w-4" />
                  </div>
                  <Input
                    value={tag.name}
                    onChange={(e) => handleUpdate(tag.id, { name: e.target.value })}
                    className="h-8"
                    placeholder="标签名称"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive flex-shrink-0"
                    onClick={() => handleRemove(tag.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">图标</Label>
                    <Select value={tag.icon} onValueChange={(v) => handleUpdate(tag.id, { icon: v })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_NAMES.map((n) => (
                          <SelectItem key={n} value={n}>
                            <span className="inline-flex items-center gap-1.5">
                              <CategoryIcon name={n} className="h-3 w-3" />
                              {n}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">颜色</Label>
                    <Select value={tag.color} onValueChange={(v) => handleUpdate(tag.id, { color: v as QuickTag['color'] })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            <span className="inline-flex items-center gap-1.5">
                              <span className={cn('h-3 w-3 rounded', COLOR_CLASSES[c])} />
                              {c}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">关联分类</Label>
                    <Select
                      value={tag.categoryId || 'none'}
                      onValueChange={(v) => handleUpdate(tag.id, { categoryId: v === 'none' ? null : v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">不关联</SelectItem>
                        {allCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.parentName ? `${c.parentName} / ${c.name}` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              添加标签
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              恢复默认
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Check className="h-4 w-4" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
