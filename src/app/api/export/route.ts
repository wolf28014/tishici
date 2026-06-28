import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// GET /api/export - export all data as JSON
export async function GET() {
  try {
    const [categories, prompts] = await Promise.all([
      db.category.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      db.prompt.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      categories: categories.map((c) => ({
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color,
        sortOrder: c.sortOrder,
        parentName: categories.find((p) => p.id === c.parentId)?.name || null,
      })),
      prompts: prompts.map((p) => {
        const cat = categories.find((c) => c.id === p.categoryId)
        return {
          title: p.title,
          content: p.content,
          description: p.description,
          categoryName: cat?.name || null,
          tags: parseTags(p.tags),
          background: p.background ? JSON.parse(p.background) : null,
          isPinned: p.isPinned,
          isFavorite: p.isFavorite,
          author: p.author,
          usageCount: p.usageCount,
          createdAt: p.createdAt,
        }
      }),
    }

    return NextResponse.json(exportData)
  } catch (err) {
    console.error('GET /api/export error:', err)
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}
