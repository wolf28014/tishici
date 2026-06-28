import { NextRequest, NextResponse } from 'next/server'
import { getAIConfigFromRequest, callAI } from '@/lib/ai-client'
import { PRESET_BACKGROUNDS, type Background } from '@/lib/prompt-types'

// POST /api/ai-background - recommend a background based on prompt content
// Body: { title: string, content: string, description?: string }
export async function POST(req: NextRequest) {
  try {
    const config = getAIConfigFromRequest(req)
    const body = await req.json()
    const { title, content, description } = body as {
      title: string
      content: string
      description?: string
    }

    if (!title?.trim() && !content?.trim()) {
      return NextResponse.json({ error: '请提供标题或内容' }, { status: 400 })
    }

    const presetNames = PRESET_BACKGROUNDS.map((b) => b.name).join('、')
    const presetValues = PRESET_BACKGROUNDS.map((b) => `${b.name}(${b.value})`).join('、')

    const responseText = await callAI(config, [
      {
        role: 'system',
        content: `你是一位专业的电商视觉设计顾问。根据用户提供的提示词内容，推荐最合适的背景。

你的任务：
1. 分析提示词的应用场景（电商白底、街拍、雪景、户外、室内等）
2. 从以下 6 个预设纯色中选择最合适的一个：${presetNames}（对应色值：${presetValues}）
3. 如果该提示词明显需要图片背景（如复杂场景），可以建议用户上传图片并给出搜索关键词

输出要求（严格 JSON 格式，不要任何额外文字）：
{
  "recommendType": "color" | "image",
  "colorName": "纯白|浅灰|中灰|深灰|墨灰|近黑",
  "reason": "选择该背景的简短理由（30字内）",
  "imageKeyword": "如果是 image 类型，给出图片搜索关键词（中英文）"
}`,
      },
      {
        role: 'user',
        content: `标题：${title}\n描述：${description || '无'}\n内容：${content}`,
      },
    ])

    // Try to parse JSON from response
    let recommendation: {
      recommendType: 'color' | 'image'
      colorName?: string
      reason?: string
      imageKeyword?: string
    }

    try {
      // Extract JSON from response (handle cases where it's wrapped in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      recommendation = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      // Fallback: default to white
      recommendation = {
        recommendType: 'color',
        colorName: '纯白',
        reason: '默认推荐',
      }
    }

    // Map colorName to actual Background object
    let background: Background | null = null
    if (recommendation.recommendType === 'color' && recommendation.colorName) {
      const preset = PRESET_BACKGROUNDS.find(
        (b) => b.name === recommendation.colorName
      )
      if (preset) background = preset
    }

    return NextResponse.json({
      background,
      reason: recommendation.reason || '',
      imageKeyword: recommendation.imageKeyword || '',
      recommendType: recommendation.recommendType,
    })
  } catch (err) {
    console.error('POST /api/ai-background error:', err)
    return NextResponse.json(
      { error: 'AI 推荐失败，请重试或手动选择' },
      { status: 500 }
    )
  }
}
