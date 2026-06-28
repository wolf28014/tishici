'use client'

import * as React from 'react'
import {
  PenTool, Code2, TrendingUp, GraduationCap, Briefcase, Heart,
  Palette, MoreHorizontal, BookOpen, Lightbulb, Sparkles, Star,
  Target, Rocket, Compass, Bot, MessageSquare, FileText, Zap,
  ShoppingBag, Snowflake, Shirt, Mountain, PersonStanding,
  Image as ImageIcon, Megaphone, Clapperboard, LayoutGrid,
  Video, Music, Scissors, Tag as TagIcon, type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  PenTool, Code2, TrendingUp, GraduationCap, Briefcase, Heart,
  Palette, MoreHorizontal, BookOpen, Lightbulb, Sparkles, Star,
  Target, Rocket, Compass, Bot, MessageSquare, FileText, Zap,
  ShoppingBag, Snowflake, Shirt, Mountain, PersonStanding,
  Image: ImageIcon, Megaphone, Clapperboard, LayoutGrid,
  Video, Music, Scissors, Tag: TagIcon,
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
