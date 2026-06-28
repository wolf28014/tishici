import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

// PUT /api/collections/[id] - update collection
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, icon, color, sortOrder } = body

    const existing = await db.collection.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到收藏夹' }, { status: 404 })

    const collection = await db.collection.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        icon: icon !== undefined ? icon : existing.icon,
        color: color !== undefined ? color : existing.color,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
      },
    })
    return NextResponse.json({ collection })
  } catch (err) {
    console.error('PUT /api/collections/[id] error:', err)
    return NextResponse.json({ error: '更新收藏夹失败' }, { status: 500 })
  }
}

// DELETE /api/collections/[id] - delete collection (prompts' collectionId set to null)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const existing = await db.collection.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到收藏夹' }, { status: 404 })

    await db.collection.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/collections/[id] error:', err)
    return NextResponse.json({ error: '删除收藏夹失败' }, { status: 500 })
  }
}
