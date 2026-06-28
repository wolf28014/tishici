import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/prompts/reorder - batch update sortOrder
// Body: { items: [{ id: string, sortOrder: number }] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items } = body as { items: Array<{ id: string; sortOrder: number }> }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 })
    }

    // Use a transaction to update all sortOrders atomically
    await db.$transaction(
      items.map((item) =>
        db.prompt.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true, updated: items.length })
  } catch (err) {
    console.error('POST /api/prompts/reorder error:', err)
    return NextResponse.json({ error: '排序失败' }, { status: 500 })
  }
}
