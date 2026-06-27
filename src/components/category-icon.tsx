'use client'

import * as React from 'react'
import {
  PenTool, Code2, TrendingUp, GraduationCap, Briefcase, Heart,
  Palette, MoreHorizontal, BookOpen, Lightbulb, Sparkles, Star,
  Target, Rocket, Compass, Bot, MessageSquare, FileText, Zap,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  PenTool, Code2, TrendingUp, GraduationCap, Briefcase, Heart,
  Palette, MoreHorizontal, BookOpen, Lightbulb, Sparkles, Star,
  Target, Rocket, Compass, Bot, MessageSquare, FileText, Zap,
}

export type CategoryIconProps = {
  name?: string | null
  className?: string
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = (name && ICONS[name]) || MoreHorizontal
  return <Icon className={className} />
}

export const ICON_NAMES = Object.keys(ICONS)
