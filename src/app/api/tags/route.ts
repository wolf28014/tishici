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

// GET /api/tags - get all unique tags with their counts
export async function GET() {
  try {
    const prompts = await db.prompt.findMany({ select: { tags: true } })
    const tagCount = new Map<string, number>()
    for (const p of prompts) {
      const tags = parseTags(p.tags)
      for (const t of tags) {
        tagCount.set(t, (tagCount.get(t) || 0) + 1)
      }
    }
    const tags = Array.from(tagCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
    return NextResponse.json({ tags })
  } catch (err) {
    console.error('GET /api/tags error:', err)
    return NextResponse.json({ error: '获取标签失败' }, { status: 500 })
  }
}
