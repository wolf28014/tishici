import { NextRequest, NextResponse } from 'next/server'
import { getAIConfigFromRequest, callAI } from '@/lib/ai-client'
import { db } from '@/lib/db'

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// POST /api/ai-similar - find similar prompts using AI
// Body: { promptId: string } - find prompts similar to this one
export async function POST(req: NextRequest) {
  try {
    const config = getAIConfigFromRequest(req)
    const body = await req.json()
    const { promptId } = body as { promptId: string }

    if (!promptId) return NextResponse.json({ error: '请提供 promptId' }, { status: 400 })

    // Get the target prompt
    const target = await db.prompt.findUnique({ where: { id: promptId } })
    if (!target) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    // Get all other prompts (limit to 100 for AI analysis)
    const allPrompts = await db.prompt.findMany({
      where: { id: { not: promptId } },
      select: { id: true, title: true, description: true, tags: true, content: true },
      take: 100,
    })

    if (allPrompts.length === 0) {
      return NextResponse.json({ similar: [] })
    }

    // Build a compact list for AI
    const promptList = allPrompts.map((p, i) => {
      const tags = parseTags(p.tags)
      return `${i + 1}. [ID:${p.id}] ${p.title} | ${p.description || ''} | 标签:${tags.join(',')} | 内容前80字:${p.content.substring(0, 80)}`
    }).join('\n')

    const responseText = await callAI(config, [
      {
        role: 'system',
        content: `你是一位提示词库管理助手。你的任务是从给定的提示词列表中，找出与目标提示词最相似的 5 个。

相似度判断标准：
1. 主题相似（同为电商/写作/编程等）
2. 用途相似（同为生成文案/分析/创作等）
3. 目标人群相似
4. 可以互补使用

输出要求（严格 JSON，不要额外文字）：
{
  "similar": [
    { "id": "提示词ID", "reason": "相似原因（15字内）", "score": 0.9 }
  ]
}

最多返回 5 个，按相似度从高到低排序。score 范围 0-1。`,
      },
      {
        role: 'user',
        content: `目标提示词：
标题：${target.title}
描述：${target.description || '无'}
内容前200字：${target.content.substring(0, 200)}

候选提示词列表：
${promptList}

请找出最相似的 5 个。`,
      },
    ])

    let result: { similar: Array<{ id: string; reason: string; score: number }> }
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      return NextResponse.json({ similar: [] })
    }

    // Fetch full prompt data for the similar ones
    const similarIds = (result.similar || []).map((s) => s.id).filter(Boolean)
    const similarPrompts = await db.prompt.findMany({
      where: { id: { in: similarIds } },
      include: {
        category: { include: { parent: true } },
        collection: true,
      },
    })

    const similarWithReason = similarPrompts.map((p) => {
      const match = result.similar.find((s) => s.id === p.id)
      return {
        ...p,
        tags: parseTags(p.tags),
        background: p.background ? JSON.parse(p.background) : null,
        reason: match?.reason || '相似',
        score: match?.score || 0.5,
      }
    })

    // Sort by score descending
    similarWithReason.sort((a, b) => (b.score || 0) - (a.score || 0))

    return NextResponse.json({ similar: similarWithReason })
  } catch (err) {
    console.error('POST /api/ai-similar error:', err)
    return NextResponse.json({ error: 'AI 推荐失败' }, { status: 500 })
  }
}
