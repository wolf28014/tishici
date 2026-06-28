'use client'

import * as React from 'react'
import {
  Card, CardHeader, CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Star, Pin, Copy, Check, Hash, MoreVertical, Pencil, Trash2, Share2,
  Eye, ImageIcon,
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  type Prompt, getColorClass, copyToClipboard,
} from '@/lib/prompt-types'
import { usePromptStore } from '@/lib/prompt-store'
import { CategoryIcon } from '@/components/category-icon'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Props = {
  prompt: Prompt
  onEdit: (p: Prompt) => void
  onShare: (p: Prompt) => void
}

export function PromptCard({ prompt, onEdit, onShare }: Props) {
  const { selectPrompt, toggleFavorite, togglePin, deletePrompt, incrementUsage } = usePromptStore()
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const color = getColorClass(prompt.category?.color)
  const hasBackground = !!prompt.background

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const ok = await copyToClipboard(prompt.content)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
      toast({ title: '已复制提示词', description: prompt.title })
      await incrementUsage(prompt.id)
    }
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(prompt.id)
  }

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePin(prompt.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(prompt)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare(prompt)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定删除「${prompt.title}」？此操作无法撤销。`)) {
      const ok = await deletePrompt(prompt.id)
      if (ok) toast({ title: '已删除' })
    }
  }

  const handleCardClick = () => selectPrompt(prompt)

  return (
    <Card
      onClick={handleCardClick}
      className="group relative cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40 overflow-hidden"
    >
      {/* Background indicator strip (top of card) */}
      {hasBackground && (
        <div
          className="h-1.5 w-full"
          style={
            prompt.background!.type === 'color'
              ? { backgroundColor: prompt.background!.value }
              : {
                  backgroundImage: `url(${prompt.background!.value})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
          }
        />
      )}

      {prompt.isPinned && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
            <Pin className="h-3.5 w-3.5 fill-white" />
          </div>
        </div>
      )}

      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {prompt.category && (
                <Badge variant="outline" className={`gap-1 ${color.text} ${color.border} ${color.soft}`}>
                  <CategoryIcon name={prompt.category.icon} className="h-3 w-3" />
                  {prompt.category.parent ? prompt.category.parent.name : prompt.category.name}
                </Badge>
              )}
              {prompt.category?.parent && (
                <Badge variant="outline" className={`gap-1 ${color.text} ${color.border} ${color.soft} text-[10px]`}>
                  {prompt.category.name}
                </Badge>
              )}
              {hasBackground && (
                <Badge variant="outline" className="gap-1 text-[10px]" title="已设置背景">
                  <ImageIcon className="h-2.5 w-2.5" />
                  {prompt.background!.type === 'color' ? (prompt.background!.name || prompt.background!.value) : '自定义'}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-snug line-clamp-2 break-words">
              {prompt.title}
            </h3>
          </div>
          <div
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> 编辑
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePin}>
                  <Pin className="h-3.5 w-3.5 mr-2" />
                  {prompt.isPinned ? '取消置顶' : '置顶'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleFavorite}>
                  <Star className="h-3.5 w-3.5 mr-2" />
                  {prompt.isFavorite ? '取消收藏' : '收藏'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="h-3.5 w-3.5 mr-2" />
                  分享
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> 删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {prompt.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prompt.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
            <Eye className="h-3 w-3" />
            点击查看提示词内容
          </p>
        )}
      </CardHeader>

      <CardFooter className="pt-0 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0 flex-1">
          {prompt.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-xs font-normal">
              {t}
            </Badge>
          ))}
          {prompt.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">+{prompt.tags.length - 3}</span>
          )}
          <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5 ml-1">
            <Hash className="h-3 w-3" /> {prompt.usageCount}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleFavorite}
            title={prompt.isFavorite ? '取消收藏' : '收藏'}
          >
            <Star className={`h-3.5 w-3.5 ${prompt.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
            title="复制提示词"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
