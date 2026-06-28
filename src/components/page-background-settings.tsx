'use client'

import * as React from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Palette, Upload, X, Check, Loader2, RotateCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export type PageBackground = {
  type: 'color' | 'image' | 'gradient'
  value: string // hex color OR data URL OR gradient css
  name?: string
}

// 6 个预设纯色背景（从浅到深）
export const PRESET_PAGE_BACKGROUNDS: PageBackground[] = [
  { type: 'color', value: '#FFFFFF', name: '纯白' },
  { type: 'color', value: '#F5F5F4', name: '暖灰' },
  { type: 'color', value: '#E7E5E4', name: '浅灰' },
  { type: 'color', value: '#44403C', name: '深灰' },
  { type: 'color', value: '#1C1917', name: '墨黑' },
  { type: 'color', value: '#0C0A09', name: '近黑' },
]

// 6 个预设渐变背景
export const PRESET_GRADIENT_BACKGROUNDS: PageBackground[] = [
  { type: 'gradient', value: 'linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%)', name: '梦幻紫粉' },
  { type: 'gradient', value: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)', name: '清新绿意' },
  { type: 'gradient', value: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', name: '温暖阳光' },
  { type: 'gradient', value: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', name: '天空蓝调' },
  { type: 'gradient', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', name: '深邃夜空' },
  { type: 'gradient', value: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', name: '极简暗夜' },
]

const STORAGE_KEY = 'prompthub-page-background'
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PageBackgroundSettings({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const [background, setBackground] = React.useState<PageBackground | null>(null)
  const [uploading, setUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  // Load saved background on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setBackground(JSON.parse(saved))
      }
    } catch {
      // ignore
    }
  }, [])

  const saveBackground = (bg: PageBackground | null) => {
    setBackground(bg)
    try {
      if (bg) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bg))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      // Apply to document
      applyBackground(bg)
    } catch (e) {
      toast({ title: '保存失败（可能存储空间不足）', variant: 'destructive' })
    }
  }

  const applyBackground = (bg: PageBackground | null) => {
    const body = document.body
    if (!bg) {
      body.style.background = ''
      body.style.backgroundImage = ''
      body.style.backgroundColor = ''
      body.classList.remove('custom-page-bg')
    } else if (bg.type === 'color') {
      body.style.backgroundImage = ''
      body.style.backgroundColor = bg.value
      body.classList.add('custom-page-bg')
    } else if (bg.type === 'gradient') {
      body.style.backgroundImage = bg.value
      body.style.backgroundAttachment = 'fixed'
      body.classList.add('custom-page-bg')
    } else if (bg.type === 'image') {
      body.style.backgroundImage = `url(${bg.value})`
      body.style.backgroundSize = 'cover'
      body.style.backgroundPosition = 'center'
      body.style.backgroundAttachment = 'fixed'
      body.classList.add('custom-page-bg')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      setError(`图片不能超过 5MB（当前 ${(file.size / 1024 / 1024).toFixed(2)}MB）`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      saveBackground({
        type: 'image',
        value: dataUrl,
        name: file.name,
      })
      toast({ title: '背景图片已上传', description: file.name })
    } catch {
      setError('图片读取失败，请重试')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleReset = () => {
    saveBackground(null)
    setError(null)
    toast({ title: '已恢复默认背景' })
  }

  const isDark = (bg: PageBackground | null): boolean => {
    if (!bg) return false
    if (bg.type === 'color') {
      return !isLightColor(bg.value)
    }
    if (bg.type === 'gradient') {
      // Check if gradient name suggests dark
      return bg.name?.includes('夜') || bg.name?.includes('暗') || false
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-violet-500" />
            页面背景设置
          </DialogTitle>
          <DialogDescription>
            为整个应用设置背景，支持纯色、渐变或自定义图片（不超过 5MB）
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current background preview */}
          {background && (
            <div className="relative rounded-lg border overflow-hidden">
              <div
                className="h-28 w-full flex items-center justify-center"
                style={
                  background.type === 'color'
                    ? { backgroundColor: background.value }
                    : {
                        backgroundImage: background.value.startsWith('linear-gradient') ? background.value : `url(${background.value})`,
                        backgroundSize: background.type === 'image' ? 'cover' : undefined,
                        backgroundPosition: background.type === 'image' ? 'center' : undefined,
                      }
                }
              >
                <span
                  className={cn(
                    'text-sm font-medium px-3 py-1.5 rounded-md',
                    isDark(background) ? 'bg-white/15 text-white' : 'bg-black/10 text-black',
                  )}
                >
                  当前背景：{background.name || (background.type === 'color' ? background.value : '自定义')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur"
                title="清除背景"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Preset colors */}
          <div>
            <Label className="text-sm font-medium mb-2 block">预设纯色（6 色，从浅到深）</Label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_PAGE_BACKGROUNDS.map((bg) => {
                const selected = background?.type === 'color' && background.value === bg.value
                return (
                  <button
                    key={bg.value}
                    type="button"
                    onClick={() => saveBackground(bg)}
                    title={bg.name || bg.value}
                    className={cn(
                      'relative h-12 rounded-lg border-2 transition-all hover:scale-105',
                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                    )}
                    style={{ backgroundColor: bg.value }}
                  >
                    {selected && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={cn('h-4 w-4', isLightColor(bg.value) ? 'text-black' : 'text-white')} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preset gradients */}
          <div>
            <Label className="text-sm font-medium mb-2 block">预设渐变（6 款）</Label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_GRADIENT_BACKGROUNDS.map((bg) => {
                const selected = background?.type === 'gradient' && background.value === bg.value
                return (
                  <button
                    key={bg.value}
                    type="button"
                    onClick={() => saveBackground(bg)}
                    title={bg.name}
                    className={cn(
                      'relative h-16 rounded-lg border-2 transition-all hover:scale-105 flex items-end p-1.5',
                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border',
                    )}
                    style={{ backgroundImage: bg.value }}
                  >
                    <span
                      className={cn(
                        'text-[10px] font-medium leading-tight',
                        bg.name?.includes('夜') || bg.name?.includes('暗') ? 'text-white' : 'text-foreground',
                      )}
                    >
                      {bg.name}
                    </span>
                    {selected && (
                      <span className="absolute top-1 right-1">
                        <Check className={cn('h-3.5 w-3.5', bg.name?.includes('夜') || bg.name?.includes('暗') ? 'text-white' : 'text-foreground')} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">自定义上传图片（不超过 5MB）</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-1.5"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  读取中...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  {background?.type === 'image' ? '更换图片' : '上传图片'}
                </>
              )}
            </Button>
            {error && (
              <p className="text-xs text-destructive mt-1.5">{error}</p>
            )}
            {background?.type === 'image' && (
              <p className="text-xs text-muted-foreground mt-1.5">
                当前：{background.name || '已上传图片'}
              </p>
            )}
          </div>

          {/* Reset button */}
          {background && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-muted-foreground"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              恢复默认背景
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function isLightColor(hex: string): boolean {
  const m = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return true
  const r = parseInt(m[1], 16)
  const g = parseInt(m[2], 16)
  const b = parseInt(m[3], 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.5
}

// Hook to apply saved background on app load
export function useApplyPageBackground() {
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const bg = JSON.parse(saved) as PageBackground
        const body = document.body
        if (bg.type === 'color') {
          body.style.backgroundImage = ''
          body.style.backgroundColor = bg.value
        } else if (bg.type === 'gradient') {
          body.style.backgroundImage = bg.value
          body.style.backgroundAttachment = 'fixed'
        } else if (bg.type === 'image') {
          body.style.backgroundImage = `url(${bg.value})`
          body.style.backgroundSize = 'cover'
          body.style.backgroundPosition = 'center'
          body.style.backgroundAttachment = 'fixed'
        }
        body.classList.add('custom-page-bg')
      }
    } catch {
      // ignore
    }
  }, [])
}
