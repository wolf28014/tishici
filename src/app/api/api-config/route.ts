import { NextRequest, NextResponse } from 'next/server'

// GET /api/api-config - 获取默认 API 配置（从请求头读取，前端传递）
// 前端在调用 AI 功能时，会把 API 配置放在请求头中
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    const baseUrl = req.headers.get('x-api-base-url')
    const model = req.headers.get('x-api-model')
    const provider = req.headers.get('x-api-provider')

    if (!apiKey && !baseUrl) {
      return NextResponse.json({
        configured: false,
        message: '未配置 API Key，将使用默认 Z.ai SDK',
      })
    }

    return NextResponse.json({
      configured: true,
      apiKey,
      baseUrl,
      model,
      provider,
    })
  } catch (err) {
    console.error('GET /api/api-config error:', err)
    return NextResponse.json({ error: '获取配置失败' }, { status: 500 })
  }
}
