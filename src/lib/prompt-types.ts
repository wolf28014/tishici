export type Category = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  parentId: string | null
  parent?: Category | null
  createdAt: string
  updatedAt: string
}

export type CategoryWithCount = Category & {
  _count: { prompts: number }
  children?: CategoryWithCount[]
}

export type Collection = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type CollectionWithCount = Collection & {
  _count: { prompts: number }
}

export type Prompt = {
  id: string
  title: string
  content: string
  description: string | null
  categoryId: string | null
  category: (Category & { parent?: Category | null }) | null
  tags: string[]
  background: Background | null
  isFavorite: boolean
  isPinned: boolean
  usageCount: number
  rating: number // 0-5 stars
  author: string | null
  source: string | null
  sortOrder: number
  collectionId: string | null
  collection?: Collection | null
  createdAt: string
  updatedAt: string
}

export type Version = {
  id: string
  promptId: string
  title: string
  content: string
  description: string | null
  tags: string[]
  versionNum: number
  changeNote: string | null
  createdAt: string
}

export type PromptInput = {
  title: string
  content: string
  description?: string
  categoryId?: string | null
  tags?: string[]
  background?: Background | null
  isPinned?: boolean
  isFavorite?: boolean
  author?: string
  collectionId?: string | null
}

// Background type: preset color or custom uploaded image
export type Background = {
  type: 'color' | 'image'
  value: string // hex color OR data URL (base64)
  name?: string // optional label
}

// 6 preset backgrounds from light to dark
export const PRESET_BACKGROUNDS: Background[] = [
  { type: 'color', value: '#FFFFFF', name: '纯白' },
  { type: 'color', value: '#F3F4F6', name: '浅灰' },
  { type: 'color', value: '#D1D5DB', name: '中灰' },
  { type: 'color', value: '#6B7280', name: '深灰' },
  { type: 'color', value: '#374151', name: '墨灰' },
  { type: 'color', value: '#111827', name: '近黑' },
]

export function parseBackground(bg: string | null | undefined): Background | null {
  if (!bg) return null
  try {
    const parsed = JSON.parse(bg)
    if (parsed && typeof parsed === 'object' && (parsed.type === 'color' || parsed.type === 'image') && typeof parsed.value === 'string') {
      return parsed as Background
    }
  } catch {
    // ignore
  }
  return null
}

export function serializeBackground(bg: Background | null | undefined): string | null {
  if (!bg) return null
  return JSON.stringify(bg)
}

export type TagWithCount = {
  name: string
  count: number
}

// Color mapping: category color -> tailwind classes
export const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; border: string; ring: string; dot: string; soft: string }
> = {
  rose: {
    bg: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900',
    ring: 'ring-rose-500/30',
    dot: 'bg-rose-500',
    soft: 'bg-rose-50 dark:bg-rose-950/40',
  },
  emerald: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    ring: 'ring-emerald-500/30',
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  amber: {
    bg: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
    ring: 'ring-amber-500/30',
    dot: 'bg-amber-500',
    soft: 'bg-amber-50 dark:bg-amber-950/40',
  },
  sky: {
    bg: 'bg-sky-500',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-900',
    ring: 'ring-sky-500/30',
    dot: 'bg-sky-500',
    soft: 'bg-sky-50 dark:bg-sky-950/40',
  },
  violet: {
    bg: 'bg-violet-500',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-900',
    ring: 'ring-violet-500/30',
    dot: 'bg-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-950/40',
  },
  teal: {
    bg: 'bg-teal-500',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-900',
    ring: 'ring-teal-500/30',
    dot: 'bg-teal-500',
    soft: 'bg-teal-50 dark:bg-teal-950/40',
  },
  pink: {
    bg: 'bg-pink-500',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-900',
    ring: 'ring-pink-500/30',
    dot: 'bg-pink-500',
    soft: 'bg-pink-50 dark:bg-pink-950/40',
  },
  slate: {
    bg: 'bg-slate-500',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    ring: 'ring-slate-500/30',
    dot: 'bg-slate-500',
    soft: 'bg-slate-50 dark:bg-slate-800/40',
  },
}

export function getColorClass(color?: string | null) {
  return COLOR_CLASSES[color || 'slate'] || COLOR_CLASSES.slate
}

// Extract {{variables}} from prompt content
export function extractVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const set = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    set.add(match[1].trim())
  }
  return Array.from(set)
}

// Replace variables in prompt content
export function fillVariables(content: string, values: Record<string, string>): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (full, name) => {
    const key = name.trim()
    const v = values[key]
    return v && v.trim() ? v : full
  })
}

// Copy text to clipboard with fallback
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to fallback
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

// Encode/decode prompt data to URL-safe base64 (for share links)
export function encodePromptToShare(prompt: {
  title: string
  content: string
  description?: string | null
  tags?: string[]
  author?: string | null
}): string {
  const json = JSON.stringify(prompt)
  // Use URL-safe base64
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodePromptFromShare(encoded: string): {
  title: string
  content: string
  description?: string | null
  tags?: string[]
  author?: string | null
} | null {
  try {
    // Restore base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const json = decodeURIComponent(escape(atob(b64)))
    return JSON.parse(json)
  } catch {
    return null
  }
}
