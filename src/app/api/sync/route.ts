import { NextRequest, NextResponse } from 'next/server'

// POST /api/sync - generate a sync code (compressed base64 of all data)
// This is a client-side feature, but we provide an endpoint to validate/encode
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, data, code } = body as {
      action: 'encode' | 'decode'
      data?: unknown
      code?: string
    }

    if (action === 'encode') {
      if (!data) return NextResponse.json({ error: '缺少数据' }, { status: 400 })
      const json = JSON.stringify(data)
      // Use URL-safe base64
      const b64 = Buffer.from(json, 'utf-8').toString('base64')
      const urlSafe = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      return NextResponse.json({ code: urlSafe, size: json.length })
    }

    if (action === 'decode') {
      if (!code) return NextResponse.json({ error: '缺少同步码' }, { status: 400 })
      try {
        let b64 = code.replace(/-/g, '+').replace(/_/g, '/')
        while (b64.length % 4) b64 += '='
        const json = Buffer.from(b64, 'base64').toString('utf-8')
        const parsed = JSON.parse(json)
        return NextResponse.json({ data: parsed })
      } catch {
        return NextResponse.json({ error: '同步码无效或已损坏' }, { status: 400 })
      }
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('POST /api/sync error:', err)
    return NextResponse.json({ error: '同步失败' }, { status: 500 })
  }
}
