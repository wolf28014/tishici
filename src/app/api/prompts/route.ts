import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseBackground, serializeBackground, type Background } from '@/lib/prompt-types'

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// GET /api/prompts - list all prompts with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    const categoryId = searchParams.get('categoryId') || ''
    const collectionId = searchParams.get('collectionId') || ''
    const tag = searchParams.get('tag')?.trim() || ''
    const favorite = searchParams.get('favorite') === 'true'
    const sort = searchParams.get('sort') || 'pinned'

    const where: Record<string, unknown> = {}
    if (favorite) where.isFavorite = true
    if (collectionId) where.collectionId = collectionId
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { content: { contains: q } },
        { tags: { contains: q } },
      ]
    }
    if (tag) {
      where.tags = { contains: tag }
    }
    if (categoryId) {
      const cats = await db.category.findMany()
      const ids = new Set<string>([categoryId])
      let added = true
      while (added) {
        added = false
        for (const c of cats) {
          if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
            ids.add(c.id)
            added = true
          }
        }
      }
      where.categoryId = { in: Array.from(ids) }
    }

    let orderBy: Record<string, 'asc' | 'desc'>[] = [{ createdAt: 'desc' }]
    if (sort === 'recent') orderBy = [{ createdAt: 'desc' }]
    else if (sort === 'usage') orderBy = [{ usageCount: 'desc' }]
    else if (sort === 'favorite') orderBy = [{ isFavorite: 'desc' }, { createdAt: 'desc' }]
    else if (sort === 'pinned') orderBy = [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }]
    else if (sort === 'custom') orderBy = [{ sortOrder: 'asc' }, { isPinned: 'desc' }, { createdAt: 'desc' }]

    const prompts = await db.prompt.findMany({
      where,
      orderBy,
      include: {
        category: { include: { parent: true } },
        collection: true,
      },
    })

    const result = prompts.map((p) => ({
      ...p,
      tags: parseTags(p.tags),
      background: parseBackground(p.background),
    }))

    return NextResponse.json({ prompts: result })
  } catch (err) {
    console.error('GET /api/prompts error:', err)
    return NextResponse.json({ error: '获取提示词列表失败' }, { status: 500 })
  }
}

// POST /api/prompts - create a new prompt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, description, categoryId, tags, background, isPinned, isFavorite, author, collectionId } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
    }

    if (background && background.type === 'image' && typeof background.value === 'string') {
      const estimatedBytes = (background.value.length * 3) / 4
      if (estimatedBytes > 5 * 1024 * 1024) {
        return NextResponse.json({ error: '背景图片不能超过 5MB' }, { status: 400 })
      }
    }

    // New prompts get a sortOrder that puts them at the top (or after pinned)
    const maxSort = await db.prompt.aggregate({ _max: { sortOrder: true } })
    const newSortOrder = (maxSort._max.sortOrder || 0) + 1

    const prompt = await db.prompt.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        description: description?.trim() || null,
        categoryId: categoryId || null,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        background: serializeBackground(background as Background | null | undefined),
        isPinned: Boolean(isPinned),
        isFavorite: Boolean(isFavorite),
        author: author?.trim() || '匿名',
        collectionId: collectionId || null,
        sortOrder: newSortOrder,
      },
      include: {
        category: { include: { parent: true } },
        collection: true,
      },
    })

    return NextResponse.json({ prompt: { ...prompt, tags: parseTags(prompt.tags), background: parseBackground(prompt.background) } })
  } catch (err) {
    console.error('POST /api/prompts error:', err)
    return NextResponse.json({ error: '创建提示词失败' }, { status: 500 })
  }
}
