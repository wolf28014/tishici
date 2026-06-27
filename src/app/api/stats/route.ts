import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stats - dashboard statistics
export async function GET() {
  try {
    const [total, favorites, pinned, categories, topUsed] = await Promise.all([
      db.prompt.count(),
      db.prompt.count({ where: { isFavorite: true } }),
      db.prompt.count({ where: { isPinned: true } }),
      db.category.count(),
      db.prompt.findMany({
        orderBy: { usageCount: 'desc' },
        take: 5,
        select: { id: true, title: true, usageCount: true },
      }),
    ])

    const categoryStats = await db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        icon: true,
        _count: { select: { prompts: true } },
      },
    })

    return NextResponse.json({
      total,
      favorites,
      pinned,
      categories,
      topUsed,
      categoryStats,
    })
  } catch (err) {
    console.error('GET /api/stats error:', err)
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 })
  }
}
