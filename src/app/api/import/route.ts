import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type ImportBody = {
  version?: number
  categories?: Array<{
    name: string
    description?: string | null
    icon?: string | null
    color?: string | null
    sortOrder?: number
    parentName?: string | null
  }>
  prompts?: Array<{
    title: string
    content: string
    description?: string | null
    categoryName?: string | null
    tags?: string[]
    background?: { type: 'color' | 'image'; value: string; name?: string } | null
    isPinned?: boolean
    isFavorite?: boolean
    author?: string | null
  }>
  mode?: 'merge' | 'replace' // merge = add new only; replace = clear all then import
}

// POST /api/import - import data from JSON
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImportBody
    const { categories = [], prompts = [], mode = 'merge' } = body

    if (mode === 'replace') {
      await db.prompt.deleteMany({})
      await db.category.deleteMany({})
    }

    // 1. Upsert categories (parents first, then children)
    const catMap = new Map<string, string>() // name -> id
    const existingCats = await db.category.findMany()
    for (const c of existingCats) catMap.set(c.name, c.id)

    // First pass: top-level categories
    for (const c of categories) {
      if (c.parentName) continue
      if (catMap.has(c.name)) continue
      const created = await db.category.create({
        data: {
          name: c.name,
          description: c.description || null,
          icon: c.icon || 'MoreHorizontal',
          color: c.color || 'slate',
          sortOrder: c.sortOrder || 0,
          parentId: null,
        },
      })
      catMap.set(c.name, created.id)
    }

    // Second pass: subcategories
    let retryCount = 0
    while (retryCount < 5) {
      let addedAny = false
      for (const c of categories) {
        if (!c.parentName) continue
        if (catMap.has(c.name)) continue
        const parentId = catMap.get(c.parentName)
        if (!parentId) continue
        const created = await db.category.create({
          data: {
            name: c.name,
            description: c.description || null,
            icon: c.icon || 'MoreHorizontal',
            color: c.color || 'slate',
            sortOrder: c.sortOrder || 0,
            parentId,
          },
        })
        catMap.set(c.name, created.id)
        addedAny = true
      }
      if (!addedAny) break
      retryCount++
    }

    // 2. Upsert prompts (by title - simple dedup)
    let importedCount = 0
    let skippedCount = 0
    for (const p of prompts) {
      // dedup by title (only in merge mode)
      if (mode === 'merge') {
        const existing = await db.prompt.findFirst({ where: { title: p.title } })
        if (existing) {
          skippedCount++
          continue
        }
      }
      const catId = p.categoryName ? catMap.get(p.categoryName) || null : null
      await db.prompt.create({
        data: {
          title: p.title,
          content: p.content,
          description: p.description || null,
          categoryId: catId,
          tags: JSON.stringify(p.tags || []),
          background: p.background ? JSON.stringify(p.background) : null,
          isPinned: p.isPinned || false,
          isFavorite: p.isFavorite || false,
          author: p.author || '匿名',
        },
      })
      importedCount++
    }

    return NextResponse.json({
      success: true,
      imported: { categories: catMap.size, prompts: importedCount, skipped: skippedCount },
    })
  } catch (err) {
    console.error('POST /api/import error:', err)
    return NextResponse.json({ error: '导入失败: ' + (err as Error).message }, { status: 500 })
  }
}
