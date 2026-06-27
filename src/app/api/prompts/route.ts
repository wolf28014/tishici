import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    const favorite = searchParams.get('favorite') === 'true'
    const sort = searchParams.get('sort') || 'pinned' // pinned | recent | usage | favorite

    const where: Record<string, unknown> = {}
    if (categoryId) where.categoryId = categoryId
    if (favorite) where.isFavorite = true
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { content: { contains: q } },
        { tags: { contains: q } },
      ]
    }

    let orderBy: Record<string, 'asc' | 'desc'>[] = [{ createdAt: 'desc' }]
    if (sort === 'recent') orderBy = [{ createdAt: 'desc' }]
    else if (sort === 'usage') orderBy = [{ usageCount: 'desc' }]
    else if (sort === 'favorite') orderBy = [{ isFavorite: 'desc' }, { createdAt: 'desc' }]
    else if (sort === 'pinned') orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }]

    const prompts = await db.prompt.findMany({
      where,
      orderBy,
      include: { category: true },
    })

    const result = prompts.map(p => ({
      ...p,
      tags: parseTags(p.tags),
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
    const { title, content, description, categoryId, tags, isPinned, isFavorite, author } = body

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 })
    }

    const prompt = await db.prompt.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        description: description?.trim() || null,
        categoryId: categoryId || null,
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
        isPinned: Boolean(isPinned),
        isFavorite: Boolean(isFavorite),
        author: author?.trim() || '匿名',
      },
      include: { category: true },
    })

    return NextResponse.json({ prompt: { ...prompt, tags: parseTags(prompt.tags) } })
  } catch (err) {
    console.error('POST /api/prompts error:', err)
    return NextResponse.json({ error: '创建提示词失败' }, { status: 500 })
  }
}
