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

type Params = { params: Promise<{ id: string }> }

// GET /api/prompts/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const prompt = await db.prompt.findUnique({
      where: { id },
      include: { category: { include: { parent: true } } },
    })
    if (!prompt) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })
    return NextResponse.json({ prompt: { ...prompt, tags: parseTags(prompt.tags), background: parseBackground(prompt.background) } })
  } catch (err) {
    console.error('GET /api/prompts/[id] error:', err)
    return NextResponse.json({ error: '获取提示词失败' }, { status: 500 })
  }
}

// PUT /api/prompts/[id]
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { title, content, description, categoryId, tags, background, isPinned, isFavorite, author } = body

    const existing = await db.prompt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    // Validate background image size
    if (background !== undefined && background && background.type === 'image' && typeof background.value === 'string') {
      const estimatedBytes = (background.value.length * 3) / 4
      if (estimatedBytes > 5 * 1024 * 1024) {
        return NextResponse.json({ error: '背景图片不能超过 5MB' }, { status: 400 })
      }
    }

    const prompt = await db.prompt.update({
      where: { id },
      data: {
        title: title?.trim() ?? existing.title,
        content: content?.trim() ?? existing.content,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        categoryId: categoryId !== undefined ? (categoryId || null) : existing.categoryId,
        tags: tags !== undefined ? JSON.stringify(Array.isArray(tags) ? tags : []) : existing.tags,
        background: background !== undefined ? serializeBackground(background as Background | null | undefined) : existing.background,
        isPinned: isPinned !== undefined ? Boolean(isPinned) : existing.isPinned,
        isFavorite: isFavorite !== undefined ? Boolean(isFavorite) : existing.isFavorite,
        author: author !== undefined ? (author?.trim() || '匿名') : existing.author,
      },
      include: { category: { include: { parent: true } } },
    })

    return NextResponse.json({ prompt: { ...prompt, tags: parseTags(prompt.tags), background: parseBackground(prompt.background) } })
  } catch (err) {
    console.error('PUT /api/prompts/[id] error:', err)
    return NextResponse.json({ error: '更新提示词失败' }, { status: 500 })
  }
}

// DELETE /api/prompts/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const existing = await db.prompt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    await db.prompt.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/prompts/[id] error:', err)
    return NextResponse.json({ error: '删除提示词失败' }, { status: 500 })
  }
}

// PATCH /api/prompts/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action } = body as { action?: 'toggleFavorite' | 'togglePin' | 'incrementUsage' }

    const existing = await db.prompt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    let data: Record<string, unknown> = {}
    if (action === 'toggleFavorite') data.isFavorite = !existing.isFavorite
    else if (action === 'togglePin') data.isPinned = !existing.isPinned
    else if (action === 'incrementUsage') data.usageCount = existing.usageCount + 1
    else return NextResponse.json({ error: '未知操作' }, { status: 400 })

    const prompt = await db.prompt.update({
      where: { id },
      data,
      include: { category: { include: { parent: true } } },
    })
    return NextResponse.json({ prompt: { ...prompt, tags: parseTags(prompt.tags), background: parseBackground(prompt.background) } })
  } catch (err) {
    console.error('PATCH /api/prompts/[id] error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
