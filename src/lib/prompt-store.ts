'use client'

import { create } from 'zustand'
import type { Prompt, CategoryWithCount, TagWithCount, CollectionWithCount, Background, Version } from '@/lib/prompt-types'

type SortKey = 'pinned' | 'recent' | 'usage' | 'favorite' | 'custom' | 'rating'

type PromptStore = {
  // data
  prompts: Prompt[]
  categories: CategoryWithCount[]
  collections: CollectionWithCount[]
  tags: TagWithCount[]
  loading: boolean
  error: string | null

  // filters
  searchQuery: string
  activeCategoryId: string | null // null = all
  activeCollectionId: string | null
  activeTag: string | null
  showFavoritesOnly: boolean
  sortBy: SortKey

  // expanded subcategories
  expandedCategoryIds: Set<string>

  // selected prompt (for detail drawer)
  selectedPromptId: string | null
  selectedPrompt: Prompt | null

  // batch selection mode
  selectionMode: boolean
  selectedIds: Set<string>

  // setters
  setPrompts: (p: Prompt[]) => void
  setCategories: (c: CategoryWithCount[]) => void
  setCollections: (c: CollectionWithCount[]) => void
  setTags: (t: TagWithCount[]) => void
  setLoading: (b: boolean) => void
  setError: (e: string | null) => void

  setSearchQuery: (q: string) => void
  setActiveCategoryId: (id: string | null) => void
  setActiveCollectionId: (id: string | null) => void
  setActiveTag: (tag: string | null) => void
  setShowFavoritesOnly: (b: boolean) => void
  setSortBy: (s: SortKey) => void
  toggleCategoryExpanded: (id: string) => void

  selectPrompt: (p: Prompt | null) => void

  // batch selection
  setSelectionMode: (b: boolean) => void
  toggleSelected: (id: string) => void
  selectAll: () => void
  clearSelection: () => void

  // CRUD helpers
  fetchPrompts: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchCollections: () => Promise<void>
  fetchTags: () => Promise<void>
  createPrompt: (input: Partial<Prompt> & { title: string; content: string }) => Promise<boolean>
  updatePrompt: (id: string, input: Partial<Prompt>) => Promise<boolean>
  deletePrompt: (id: string) => Promise<boolean>
  toggleFavorite: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  incrementUsage: (id: string) => Promise<void>

  // reorder
  reorderPrompts: (orderedIds: string[]) => Promise<void>

  // batch operations
  batchAddTags: (ids: string[], tags: string[]) => Promise<boolean>
  batchRemoveTags: (ids: string[], tags: string[]) => Promise<boolean>
  batchSetCollection: (ids: string[], collectionId: string | null) => Promise<boolean>
  batchDelete: (ids: string[]) => Promise<boolean>

  // collections
  createCollection: (input: { name: string; description?: string; icon?: string; color?: string }) => Promise<boolean>
  deleteCollection: (id: string) => Promise<boolean>

  // AI background
  recommendBackground: (title: string, content: string, description?: string) => Promise<{ background: Background | null; reason: string; imageKeyword: string; recommendType: string } | null>

  // AI generate
  generatePrompt: (description: string, style: 'detailed' | 'concise' | 'creative') => Promise<{ title: string; description: string; content: string; tags: string[]; suggestedCategory: string } | null>

  // AI similar
  findSimilar: (promptId: string) => Promise<Array<Prompt & { reason: string; score: number }> | null>

  // Versions
  fetchVersions: (promptId: string) => Promise<{ versions: Version[]; current: { title: string; content: string; description: string | null; tags: string[] } } | null>
  restoreVersion: (promptId: string, versionId: string) => Promise<boolean>

  // Rating
  setRating: (id: string, rating: number) => Promise<void>

  // Sync
  generateSyncCode: () => Promise<string | null>
  applySyncCode: (code: string) => Promise<{ imported: number; skipped: number } | null>

  // import/export
  exportData: () => Promise<void>
  importData: (data: unknown, mode: 'merge' | 'replace') => Promise<{ imported: number; skipped: number } | null>
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  categories: [],
  collections: [],
  tags: [],
  loading: false,
  error: null,

  searchQuery: '',
  activeCategoryId: null,
  activeCollectionId: null,
  activeTag: null,
  showFavoritesOnly: false,
  sortBy: 'pinned',

  expandedCategoryIds: new Set<string>(),

  selectedPromptId: null,
  selectedPrompt: null,

  selectionMode: false,
  selectedIds: new Set<string>(),

  setPrompts: (p) => set({ prompts: p }),
  setCategories: (c) => set({ categories: c }),
  setCollections: (c) => set({ collections: c }),
  setTags: (t) => set({ tags: t }),
  setLoading: (b) => set({ loading: b }),
  setError: (e) => set({ error: e }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategoryId: (id) => set({ activeCategoryId: id, activeTag: id ? null : get().activeTag, activeCollectionId: id ? null : get().activeCollectionId }),
  setActiveCollectionId: (id) => set({ activeCollectionId: id, activeCategoryId: id ? null : get().activeCategoryId, activeTag: id ? null : get().activeTag }),
  setActiveTag: (tag) => set({ activeTag: tag, activeCategoryId: tag ? null : get().activeCategoryId, activeCollectionId: tag ? null : get().activeCollectionId }),
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
      const { sortBy, activeCategoryId, activeCollectionId, showFavoritesOnly, searchQuery, activeTag } = get()
      params.set('sort', sortBy)
      if (activeCategoryId) params.set('categoryId', activeCategoryId)
      if (activeCollectionId) params.set('collectionId', activeCollectionId)
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

  fetchCollections: async () => {
    try {
      const res = await fetch('/api/collections')
      if (!res.ok) throw new Error('获取收藏夹失败')
      const data = await res.json()
      set({ collections: data.collections as CollectionWithCount[] })
    } catch (e) {
      console.error(e)
    }
  },

  // Batch selection
  setSelectionMode: (b) => set({ selectionMode: b, selectedIds: b ? get().selectedIds : new Set() }),
  toggleSelected: (id) => {
    const cur = new Set(get().selectedIds)
    if (cur.has(id)) cur.delete(id)
    else cur.add(id)
    set({ selectedIds: cur })
  },
  selectAll: () => set({ selectedIds: new Set(get().prompts.map((p) => p.id)) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  // Reorder
  reorderPrompts: async (orderedIds) => {
    // Optimistic update
    const prevPrompts = get().prompts
    const map = new Map(prevPrompts.map((p) => [p.id, p]))
    const reordered = orderedIds.map((id, idx) => {
      const p = map.get(id)
      return p ? { ...p, sortOrder: idx } : null
    }).filter(Boolean) as Prompt[]
    set({ prompts: reordered })

    try {
      const items = orderedIds.map((id, idx) => ({ id, sortOrder: idx }))
      const res = await fetch('/api/prompts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      if (!res.ok) throw new Error('排序失败')
    } catch (e) {
      set({ prompts: prevPrompts, error: (e as Error).message })
    }
  },

  // Batch operations
  batchAddTags: async (ids, tags) => {
    try {
      const res = await fetch('/api/prompts/batch-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'addTags', tags }),
      })
      if (!res.ok) throw new Error('批量添加标签失败')
      await Promise.all([get().fetchTags(), get().fetchPrompts()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  batchRemoveTags: async (ids, tags) => {
    try {
      const res = await fetch('/api/prompts/batch-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'removeTags', tags }),
      })
      if (!res.ok) throw new Error('批量移除标签失败')
      await Promise.all([get().fetchTags(), get().fetchPrompts()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  batchSetCollection: async (ids, collectionId) => {
    try {
      const res = await fetch('/api/prompts/batch-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'setCollection', collectionId }),
      })
      if (!res.ok) throw new Error('批量设置收藏夹失败')
      await Promise.all([get().fetchCollections(), get().fetchPrompts()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  batchDelete: async (ids) => {
    try {
      const res = await fetch('/api/prompts/batch-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action: 'delete' }),
      })
      if (!res.ok) throw new Error('批量删除失败')
      set({
        prompts: get().prompts.filter((p) => !ids.includes(p.id)),
        selectedIds: new Set(),
        selectionMode: false,
      })
      await Promise.all([get().fetchCategories(), get().fetchTags(), get().fetchCollections()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  // Collections
  createCollection: async (input) => {
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '创建失败')
      }
      await get().fetchCollections()
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  deleteCollection: async (id) => {
    try {
      const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('删除失败')
      await Promise.all([get().fetchCollections(), get().fetchPrompts()])
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  // AI background
  recommendBackground: async (title, content, description) => {
    try {
      const res = await fetch('/api/ai-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, description }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI 推荐失败')
      }
      return await res.json()
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  // AI generate
  generatePrompt: async (description, style) => {
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, style }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI 生成失败')
      }
      const data = await res.json()
      return data.generated
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  // AI similar
  findSimilar: async (promptId) => {
    try {
      const res = await fetch('/api/ai-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'AI 推荐失败')
      }
      const data = await res.json()
      return data.similar
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  // Versions
  fetchVersions: async (promptId) => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/versions`)
      if (!res.ok) throw new Error('获取版本历史失败')
      return await res.json()
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  restoreVersion: async (promptId, versionId) => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      })
      if (!res.ok) throw new Error('恢复版本失败')
      const data = await res.json()
      // Update the prompt in store
      set({
        prompts: get().prompts.map((p) => (p.id === promptId ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === promptId ? data.prompt : get().selectedPrompt,
      })
      return true
    } catch (e) {
      set({ error: (e as Error).message })
      return false
    }
  },

  // Rating
  setRating: async (id, rating) => {
    // Optimistic update
    const prev = get().prompts
    set({ prompts: prev.map((p) => (p.id === id ? { ...p, rating } : p)) })
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setRating', rating }),
      })
      if (!res.ok) throw new Error('评分失败')
      const data = await res.json()
      set({
        prompts: get().prompts.map((p) => (p.id === id ? data.prompt : p)),
        selectedPrompt: get().selectedPromptId === id ? data.prompt : get().selectedPrompt,
      })
    } catch {
      set({ prompts: prev })
    }
  },

  // Sync
  generateSyncCode: async () => {
    try {
      // Fetch all data via export endpoint
      const res = await fetch('/api/export')
      if (!res.ok) throw new Error('导出失败')
      const data = await res.json()
      // Encode via sync API
      const encodeRes = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'encode', data }),
      })
      if (!encodeRes.ok) throw new Error('编码失败')
      const { code } = await encodeRes.json()
      return code
    } catch (e) {
      set({ error: (e as Error).message })
      return null
    }
  },

  applySyncCode: async (code) => {
    try {
      const decodeRes = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decode', code }),
      })
      if (!decodeRes.ok) {
        const err = await decodeRes.json()
        throw new Error(err.error || '解码失败')
      }
      const { data } = await decodeRes.json()
      // Import the data in merge mode
      return await get().importData(data, 'merge')
    } catch (e) {
      set({ error: (e as Error).message })
      return null
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
export type { Prompt, CategoryWithCount, TagWithCount, CollectionWithCount, Background, Version }
