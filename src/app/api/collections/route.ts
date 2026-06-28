import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/collections - list all collections with prompt count
export async function GET() {
  try {
    const collections = await db.collection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { prompts: true } },
      },
    })
    return NextResponse.json({ collections })
  } catch (err) {
    console.error('GET /api/collections error:', err)
    return NextResponse.json({ error: '获取收藏夹失败' }, { status: 500 })
  }
}

// POST /api/collections - create a collection
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, icon, color, sortOrder } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: '收藏夹名称不能为空' }, { status: 400 })
    }

    const maxSort = await db.collection.aggregate({ _max: { sortOrder: true } })
    const collection = await db.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || 'Folder',
        color: color || 'violet',
        sortOrder: Number(sortOrder) || (maxSort._max.sortOrder || 0) + 1,
      },
    })
    return NextResponse.json({ collection })
  } catch (err) {
    console.error('POST /api/collections error:', err)
    return NextResponse.json({ error: '创建收藏夹失败' }, { status: 500 })
  }
}
