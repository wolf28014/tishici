import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/categories - list categories with prompt count
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { prompts: true } },
      },
    })
    return NextResponse.json({ categories })
  } catch (err) {
    console.error('GET /api/categories error:', err)
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 })
  }
}

// POST /api/categories - create a category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, icon, color, sortOrder } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: '分类名称不能为空' }, { status: 400 })
    }

    const existing = await db.category.findUnique({ where: { name: name.trim() } })
    if (existing) return NextResponse.json({ error: '分类名称已存在' }, { status: 400 })

    const category = await db.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        icon: icon || 'MoreHorizontal',
        color: color || 'slate',
        sortOrder: Number(sortOrder) || 0,
      },
    })
    return NextResponse.json({ category })
  } catch (err) {
    console.error('POST /api/categories error:', err)
    return NextResponse.json({ error: '创建分类失败' }, { status: 500 })
  }
}
