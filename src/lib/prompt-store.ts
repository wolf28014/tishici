'use client'

import { create } from 'zustand'
import type { Prompt, CategoryWithCount, TagWithCount } from '@/lib/prompt-types'

type SortKey = 'pinned' | 'recent' | 'usage' | 'favorite'

type PromptStore = {
  // data
  prompts: Prompt[]
  categories: CategoryWithCount[]
  tags: TagWithCount[]
  loading: boolean
  error: string | null

  // filters
  searchQuery: string
  activeCategoryId: string | null // null = all
  activeTag: string | null
  showFavoritesOnly: boolean
  sortBy: SortKey

  // expanded subcategories
  expandedCategoryIds: Set<string>

  // selected prompt (for detail drawer)
  selectedPromptId: string | null
  selectedPrompt: Prompt | null

  // setters
  setPrompts: (p: Prompt[]) => void
  setCategories: (c: CategoryWithCount[]) => void
  setTags: (t: TagWithCount[]) => void
  setLoading: (b: boolean) => void
  setError: (e: string | null) => void

  setSearchQuery: (q: string) => void
  setActiveCategoryId: (id: string | null) => void
  setActiveTag: (tag: string | null) => void
  setShowFavoritesOnly: (b: boolean) => void
  setSortBy: (s: SortKey) => void
  toggleCategoryExpanded: (id: string) => void

  selectPrompt: (p: Prompt | null) => void

  // CRUD helpers
  fetchPrompts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchTags: () => Promise<void>
  createPrompt: (input: Partial<Prompt> & { title: string; content: string }) => Promise<boolean>
  updatePrompt: (id: string, input: Partial<Prompt>) => Promise<boolean>
  deletePrompt: (id: string) => Promise<boolean>
  toggleFavorite: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  incrementUsage: (id: string) => Promise<void>

  // import/export
  exportData: () => Promise<void>
  importData: (data: unknown, mode: 'merge' | 'replace') => Promise<{ imported: number; skipped: number } | null>
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  categories: [],
  tags: [],
  loading: false,
  error: null,

  searchQuery: '',
  activeCategoryId: null,
  activeTag: null,
  showFavoritesOnly: false,
  sortBy: 'pinned',

  expandedCategoryIds: new Set<string>(),

  selectedPromptId: null,
  selectedPrompt: null,

  setPrompts: (p) => set({ prompts: p }),
  setCategories: (c) => set({ categories: c }),
  setTags: (t) => set({ tags: t }),
  setLoading: (b) => set({ loading: b }),
  setError: (e) => set({ error: e }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategoryId: (id) => set({ activeCategoryId: id, activeTag: id ? null : get().activeTag }),
  setActiveTag: (tag) => set({ activeTag: tag, activeCategoryId: tag ? null : get().activeCategoryId }),
  setShowFavoritesOnly: (b) => set({ showFavoritesOnly: b }),
  setSortBy: (s) => set({ sortBy: s }),
  toggleCategoryExpanded: (id) => {
    const cur = new Set(get().expandedCategoryIds)
    if (cur.has(id)) cur.delete(id)
    else cur.add(id)
    set({ expandedCategoryIds: cur })
  },

  selectPrompt: (p) => set({ selectedPrompt: p, selectedPromptId: p?.id ?? null }),

  fetchPrompts: async () => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      const { sortBy, activeCategoryId, showFavoritesOnly, searchQuery, activeTag } = get()
      params.set('sort', sortBy)
      if (activeCategoryId) params.set('categoryId', activeCategoryId)
      if (showFavoritesOnly) params.set('favorite', 'true')
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (activeTag) params.set('tag', activeTag)

      const res = await fetch(`/api/prompts?${params.toString()}`)
      if (!res.ok) throw new Error('获取提示词失败')
      const data = await res.json()
      set({ prompts: data.prompts as Prompt[], loading: false })
    } catch (e) {
      set({ loading: false, error: (e as Error).message })
    }
  },

  fetchCategories: async () => {
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('获取分类失败')
      const data = await res.json()
      set({ categories: data.categories as CategoryWithCount[] })
    } catch (e) {
      console.error(e)
    }
  },

  fetchTags: async () => {
    try {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('获取标签失败')
      const data = await res.json()
      set({ tags: data.tags as TagWithCount[] })
    } catch (e) {
      console.error(e)
    }
  },

  createPrompt: async (input) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '创建失败')
      }
      const data = await res.json()
      set({ prompts: [data.prompt, ...get().prompts] })
      await Promise.all([get().fetchCategories(), get().fetchTags()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  updatePrompt: async (id, input) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '更新失败')
      }
      const data = await res.json()
      set({
        prompts: get().prompts.map((p) => (p.id === id ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === id ? data.prompt : get().selectedPrompt,
      })
      await Promise.all([get().fetchCategories(), get().fetchTags()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  deletePrompt: async (id) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      set({
        prompts: get().prompts.filter((p) => p.id !== id),
        selectedPrompt: get().selectedPromptId === id ? null : get().selectedPrompt,
        selectedPromptId: get().selectedPromptId === id ? null : get().selectedPromptId,
      })
      await Promise.all([get().fetchCategories(), get().fetchTags()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  toggleFavorite: async (id) => {
    const prev = get().prompts
    set({
      prompts: prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)),
    })
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleFavorite' }),
      })
      if (!res.ok) throw new Error('操作失败')
      const data = await res.json()
      set({
        prompts: get().prompts.map((p) => (p.id === id ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === id ? data.prompt : get().selectedPrompt,
      })
    } catch {
      set({ prompts: prev })
    }
  },

  togglePin: async (id) => {
    const prev = get().prompts
    set({
      prompts: prev.map((p) => (p.id === id ? { ...p, isPinned: !p.isPinned } : p)),
    })
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'togglePin' }),
      })
      if (!res.ok) throw new Error('操作失败')
      const data = await res.json()
      set({
        prompts: get().prompts.map((p) => (p.id === id ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === id ? data.prompt : get().selectedPrompt,
      })
    } catch {
      set({ prompts: prev })
    }
  },

  incrementUsage: async (id) => {
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'incrementUsage' }),
      })
      if (!res.ok) throw new Error('操作失败')
      const data = await res.json()
      set({
        prompts: get().prompts.map((p) => (p.id === id ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === id ? data.prompt : get().selectedPrompt,
      })
    } catch (e) {
      console.error(e)
    }
  },

  exportData: async () => {
    try {
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('导出失败')
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompthub-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      set({ error: (e as Error).message })
    }
  },

  importData: async (data, mode) => {
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, mode }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '导入失败')
      }
      const result = await res.json()
      await Promise.all([get().fetchCategories(), get().fetchTags(), get().fetchPrompts()])
      return result.imported
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },
}))

export type { SortKey }
export type { Prompt, CategoryWithCount, TagWithCount }
