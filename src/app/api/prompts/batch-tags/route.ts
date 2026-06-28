import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type BatchBody = {
  ids: string[]
  action: 'addTags' | 'removeTags' | 'setTags' | 'setCollection' | 'delete'
  tags?: string[]
  collectionId?: string | null
}

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// POST /api/prompts/batch - batch update tags / collection / delete
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BatchBody
    const { ids, action } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请选择至少一条提示词' }, { status: 400 })
    }

    if (action === 'delete') {
      const result = await db.prompt.deleteMany({ where: { id: { in: ids } } })
      return NextResponse.json({ success: true, affected: result.count })
    }

    if (action === 'setCollection') {
      const result = await db.prompt.updateMany({
        where: { id: { in: ids } },
        data: { collectionId: body.collectionId || null },
      })
      return NextResponse.json({ success: true, affected: result.count })
    }

    if (action === 'addTags' || action === 'removeTags' || action === 'setTags') {
      const newTags = Array.isArray(body.tags) ? body.tags : []
      const prompts = await db.prompt.findMany({
        where: { id: { in: ids } },
        select: { id: true, tags: true },
      })

      await db.$transaction(
        prompts.map((p) => {
          const current = parseTags(p.tags)
          let updated: string[]
          if (action === 'addTags') {
            updated = Array.from(new Set([...current, ...newTags]))
          } else if (action === 'removeTags') {
            updated = current.filter((t) => !newTags.includes(t))
          } else {
            // setTags - replace all
            updated = newTags
          }
          return db.prompt.update({
            where: { id: p.id },
            data: { tags: JSON.stringify(updated) },
          })
        })
      )

      return NextResponse.json({ success: true, affected: prompts.length })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/prompts/batch error:', err)
    return NextResponse.json({ error: '批量操作失败' }, { status: 500 })
  }
}
