import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST /api/ai-generate - auto-generate a complete prompt from a simple description
// Body: { description: string, category?: string, style?: 'detailed' | 'concise' | 'creative' }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { description, style = 'detailed' } = body as {
      description: string
      style?: 'detailed' | 'concise' | 'creative'
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: '请描述你想要的提示词' }, { status: 400 })
    }

    const zai = await ZAI.create()

    const styleGuide = {
      detailed: '详细版：包含完整的背景设定、步骤说明、输出格式要求，适合复杂任务',
      concise: '简洁版：精炼直接，只保留核心指令，适合简单任务',
      creative: '创意版：加入比喻、角色扮演、情境化表达，激发 AI 创造力',
    }[style] || '详细版'

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `你是一位资深 Prompt Engineer，专精设计高质量、可复用的 AI 提示词。

你的任务：根据用户的简短描述，生成一个完整、专业的提示词。

设计原则：
1. 角色设定：为 AI 赋予明确的专业身份
2. 任务拆解：将复杂任务分解为清晰步骤
3. 变量占位：使用 {{变量名}} 标记需要用户填写的部分
4. 输出规范：明确输出格式、字数、结构
5. 约束条件：列出避免事项和质量要求

风格：${styleGuide}

输出要求（严格 JSON 格式，不要任何额外文字或 markdown 代码块）：
{
  "title": "提示词标题（10-20字，简洁有力）",
  "description": "一句话说明用途（20-40字）",
  "content": "完整的提示词内容（包含角色设定、任务、变量、输出要求等）",
  "tags": ["标签1", "标签2", "标签3"],
  "suggestedCategory": "建议的分类（如：写作创作/编程开发/电商运营/AI模特商拍/AI短剧制作/其他）"
}`,
        },
        {
          role: 'user',
          content: `我想生成一个提示词，用途是：${description}`,
        },
      ],
      thinking: { type: 'disabled' },
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse JSON from response
    let generated: {
      title: string
      description: string
      content: string
      tags: string[]
      suggestedCategory: string
    }

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      generated = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      return NextResponse.json(
        { error: 'AI 生成格式异常，请重试', raw: responseText.substring(0, 500) },
        { status: 500 }
      )
    }

    return NextResponse.json({ generated })
  } catch (err) {
    console.error('POST /api/ai-generate error:', err)
    return NextResponse.json({ error: 'AI 生成失败，请重试' }, { status: 500 })
  }
}
