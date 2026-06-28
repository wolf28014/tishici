'use client'

import * as React from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Key, Plus, Trash2, Check, Star, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useApiConfigs, API_PROVIDERS, type ApiConfig, type ProviderKey } from '@/lib/settings-store'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiSettings({ open, onOpenChange }: Props) {
  const { configs, saveConfigs, loaded } = useApiConfigs()
  const { toast } = useToast()
  const [editConfigs, setEditConfigs] = React.useState<ApiConfig[]>([])
  const [showKeys, setShowKeys] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    if (open && loaded) {
      setEditConfigs([...configs])
    }
  }, [open, loaded, configs])

  const handleAdd = () => {
    const newConfig: ApiConfig = {
      id: `api-${Date.now()}`,
      name: '新 API 配置',
      provider: 'custom',
      baseUrl: '',
      apiKey: '',
      model: '',
      enabled: true,
      isDefault: false,
    }
    setEditConfigs([...editConfigs, newConfig])
  }

  const handleRemove = (id: string) => {
    setEditConfigs(editConfigs.filter((c) => c.id !== id))
  }

  const handleUpdate = (id: string, updates: Partial<ApiConfig>) => {
    setEditConfigs(editConfigs.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  const handleProviderChange = (id: string, provider: ProviderKey) => {
    const preset = API_PROVIDERS[provider]
    const config = editConfigs.find((c) => c.id === id)
    if (!config) return
    handleUpdate(id, {
      provider,
      name: preset.name,
      baseUrl: preset.baseUrl,
      model: preset.models[0] || '',
    })
  }

  const handleSetDefault = (id: string) => {
    setEditConfigs(editConfigs.map((c) => ({ ...c, isDefault: c.id === id })))
  }

  const handleSave = () => {
    // 验证
    const enabled = editConfigs.filter((c) => c.enabled)
    if (enabled.length === 0) {
      toast({ title: '至少需要启用一个 API 配置', variant: 'destructive' })
      return
    }
    // 确保有一个默认
    const hasDefault = editConfigs.some((c) => c.isDefault && c.enabled)
    if (!hasDefault) {
      const firstEnabled = editConfigs.find((c) => c.enabled)
      if (firstEnabled) {
        firstEnabled.isDefault = true
      }
    }
    saveConfigs(editConfigs)
    toast({ title: 'API 配置已保存', description: `共 ${editConfigs.length} 个配置` })
    onOpenChange(false)
  }

  const toggleShowKey = (id: string) => {
    setShowKeys({ ...showKeys, [id]: !showKeys[id] })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-violet-500" />
            API 配置设置
          </DialogTitle>
          <DialogDescription>
            管理用于 AI 生成、相似推荐等功能的 API 配置。可添加多个，选择默认使用哪个
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* 说明 */}
          <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-3 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-blue-700 dark:text-blue-300 space-y-1">
                <div className="font-medium">使用说明：</div>
                <ul className="list-disc list-inside space-y-0.5 ml-1">
                  <li>配置保存在浏览器本地（localStorage），不会上传</li>
                  <li>设置默认 API 后，AI 功能将使用该配置</li>
                  <li>留空使用 Z.ai 默认配置（沙箱环境自动可用）</li>
                  <li>支持 OpenAI、Anthropic、Azure、自定义兼容 API</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Config list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {editConfigs.map((config) => (
              <div key={config.id} className={cn(
                'rounded-md border p-3 space-y-2 bg-card',
                config.isDefault && 'border-primary ring-1 ring-primary/20',
              )}>
                <div className="flex items-center gap-2">
                  <Badge variant={config.isDefault ? 'default' : 'secondary'} className="text-[10px]">
                    {config.isDefault ? '默认' : '备选'}
                  </Badge>
                  <Input
                    value={config.name}
                    onChange={(e) => handleUpdate(config.id, { name: e.target.value })}
                    className="h-8 flex-1"
                    placeholder="配置名称"
                  />
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={(v) => handleUpdate(config.id, { enabled: v })}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(config.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">服务商</Label>
                    <Select
                      value={config.provider}
                      onValueChange={(v) => handleProviderChange(config.id, v as ProviderKey)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(API_PROVIDERS).map(([key, p]) => (
                          <SelectItem key={key} value={key}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">模型</Label>
                    {API_PROVIDERS[config.provider].models.length > 0 ? (
                      <Select
                        value={config.model}
                        onValueChange={(v) => handleUpdate(config.id, { model: v })}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {API_PROVIDERS[config.provider].models.map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={config.model}
                        onChange={(e) => handleUpdate(config.id, { model: e.target.value })}
                        className="h-8 text-xs"
                        placeholder="模型名称"
                      />
                    )}
                  </div>
                </div>

                {config.provider !== 'zai' && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">API Base URL</Label>
                      <Input
                        value={config.baseUrl}
                        onChange={(e) => handleUpdate(config.id, { baseUrl: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="https://api.openai.com/v1"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">API Key</Label>
                      <div className="flex gap-1">
                        <Input
                          type={showKeys[config.id] ? 'text' : 'password'}
                          value={config.apiKey}
                          onChange={(e) => handleUpdate(config.id, { apiKey: e.target.value })}
                          className="h-8 text-xs font-mono"
                          placeholder="sk-..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleShowKey(config.id)}
                        >
                          {showKeys[config.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Set as default */}
                {!config.isDefault && config.enabled && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs gap-1"
                    onClick={() => handleSetDefault(config.id)}
                  >
                    <Star className="h-3 w-3" />
                    设为默认
                  </Button>
                )}
                {config.isDefault && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <Star className="h-3 w-3 fill-primary" />
                    当前默认配置
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add button */}
          <Button variant="outline" size="sm" onClick={handleAdd} className="w-full gap-1.5">
            <Plus className="h-4 w-4" />
            添加 API 配置
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Check className="h-4 w-4" />
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
