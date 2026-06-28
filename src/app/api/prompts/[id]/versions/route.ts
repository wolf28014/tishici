import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

type Params = { params: Promise<{ id: string }> }

// GET /api/prompts/[id]/versions - list all versions of a prompt
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const existing = await db.prompt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    const versions = await db.version.findMany({
      where: { promptId: id },
      orderBy: { versionNum: 'desc' },
    })

    return NextResponse.json({
      versions: versions.map((v) => ({ ...v, tags: parseTags(v.tags) })),
      current: {
        title: existing.title,
        content: existing.content,
        description: existing.description,
        tags: parseTags(existing.tags),
      },
    })
  } catch (err) {
    console.error('GET /api/prompts/[id]/versions error:', err)
    return NextResponse.json({ error: '获取版本历史失败' }, { status: 500 })
  }
}

// POST /api/prompts/[id]/versions - restore a version
// Body: { versionId: string } - restore from a specific version
// Body: { versionNum: number, action: 'restore' }
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()
    const { versionId } = body as { versionId?: string }

    if (!versionId) return NextResponse.json({ error: '请提供 versionId' }, { status: 400 })

    const existing = await db.prompt.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: '未找到提示词' }, { status: 404 })

    const version = await db.version.findUnique({ where: { id: versionId } })
    if (!version || version.promptId !== id) {
      return NextResponse.json({ error: '未找到该版本' }, { status: 404 })
    }

    // Save current state as a new version before restoring
    const lastVersion = await db.version.findFirst({
      where: { promptId: id },
      orderBy: { versionNum: 'desc' },
    })
    const nextVersionNum = (lastVersion?.versionNum || 0) + 1
    await db.version.create({
      data: {
        promptId: id,
        title: existing.title,
        content: existing.content,
        description: existing.description,
        tags: existing.tags,
        versionNum: nextVersionNum,
        changeNote: `恢复前自动备份（从第 ${version.versionNum} 版恢复）`,
      },
    })

    // Restore the version
    const updated = await db.prompt.update({
      where: { id },
      data: {
        title: version.title,
        content: version.content,
        description: version.description,
        tags: version.tags,
      },
      include: {
        category: { include: { parent: true } },
        collection: true,
      },
    })

    return NextResponse.json({
      prompt: {
        ...updated,
        tags: parseTags(updated.tags),
        background: JSON.parse(updated.background || 'null'),
      },
    })
  } catch (err) {
    console.error('POST /api/prompts/[id]/versions error:', err)
    return NextResponse.json({ error: '恢复版本失败' }, { status: 500 })
  }
}
