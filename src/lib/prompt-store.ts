'use client'

import { create } from 'zustand'
import type { Prompt, Category, CategoryWithCount } from '@/lib/prompt-types'

type SortKey = 'pinned' | 'recent' | 'usage' | 'favorite'

type PromptStore = {
  // data
  prompts: Prompt[]
  categories: CategoryWithCount[]
  loading: boolean
  error: string | null

  // filters
  searchQuery: string
  activeCategoryId: string | null // null = all
  showFavoritesOnly: boolean
  sortBy: SortKey

  // selected prompt (for detail drawer)
  selectedPromptId: string | null
  selectedPrompt: Prompt | null

  // setters
  setPrompts: (p: Prompt[]) => void
  setCategories: (c: CategoryWithCount[]) => void
  setLoading: (b: boolean) => void
  setError: (e: string | null) => void

  setSearchQuery: (q: string) => void
  setActiveCategoryId: (id: string | null) => void
  setShowFavoritesOnly: (b: boolean) => void
  setSortBy: (s: SortKey) => void

  selectPrompt: (p: Prompt | null) => void

  // CRUD helpers
  fetchPrompts: () => Promise<void>
  fetchCategories: () => Promise<void>
  createPrompt: (input: Partial<Prompt> & { title: string; content: string }) => Promise<boolean>
  updatePrompt: (id: string, input: Partial<Prompt>) => Promise<boolean>
  deletePrompt: (id: string) => Promise<boolean>
  toggleFavorite: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  incrementUsage: (id: string) => Promise<void>

  // derived selector
  filteredPrompts: () => Prompt[]
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  categories: [],
  loading: false,
  error: null,

  searchQuery: '',
  activeCategoryId: null,
  showFavoritesOnly: false,
  sortBy: 'pinned',

  selectedPromptId: null,
  selectedPrompt: null,

  setPrompts: (p) => set({ prompts: p }),
  setCategories: (c) => set({ categories: c }),
  setLoading: (b) => set({ loading: b }),
  setError: (e) => set({ error: e }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategoryId: (id) => set({ activeCategoryId: id }),
  setShowFavoritesOnly: (b) => set({ showFavoritesOnly: b }),
  setSortBy: (s) => set({ sortBy: s }),

  selectPrompt: (p) => set({ selectedPrompt: p, selectedPromptId: p?.id ?? null }),

  fetchPrompts: async () => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams()
      const { sortBy, activeCategoryId, showFavoritesOnly, searchQuery } = get()
      params.set('sort', sortBy)
      if (activeCategoryId) params.set('categoryId', activeCategoryId)
      if (showFavoritesOnly) params.set('favorite', 'true')
      if (searchQuery.trim()) params.set('q', searchQuery.trim())

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
      await get().fetchCategories() // refresh counts
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
      await get().fetchCategories()
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
      await get().fetchCategories()
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  toggleFavorite: async (id) => {
    // optimistic
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

  filteredPrompts: () => {
    return get().prompts
  },
}))

export type { SortKey }
export type { Prompt, Category, CategoryWithCount }
