'use client'

import { useApiConfigs, type ApiConfig } from '@/lib/settings-store'

// ============================================
// 获取默认 API 配置的请求头
// 在客户端调用 AI API 时，把配置放在请求头中传给后端
// ============================================
export function getApiHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  try {
    const saved = localStorage.getItem('prompthub-api-configs')
    if (!saved) return {}

    const configs: ApiConfig[] = JSON.parse(saved)
    // 找到启用的默认配置
    const defaultConfig = configs.find((c) => c.enabled && c.isDefault) || configs.find((c) => c.enabled)
    if (!defaultConfig) return {}

    const headers: Record<string, string> = {
      'x-api-provider': defaultConfig.provider,
    }
    if (defaultConfig.apiKey) {
      headers['x-api-key'] = defaultConfig.apiKey
    }
    if (defaultConfig.baseUrl) {
      headers['x-api-base-url'] = defaultConfig.baseUrl
    }
    if (defaultConfig.model) {
      headers['x-api-model'] = defaultConfig.model
    }
    return headers
  } catch {
    return {}
  }
}

// ============================================
// 带API配置的 fetch 封装
// ============================================
export async function fetchWithAIConfig(url: string, options: RequestInit = {}): Promise<Response> {
  const aiHeaders = getApiHeaders()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...aiHeaders,
    ...(options.headers as Record<string, string> || {}),
  }
  return fetch(url, { ...options, headers })
}
