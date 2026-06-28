'use client'

import * as React from 'react'

const STORAGE_KEY = 'prompthub-page-background'

type PageBackground = {
  type: 'color' | 'image' | 'gradient'
  value: string
  name?: string
}

/**
 * Applies the saved page background on initial load.
 * Rendered in layout.tsx so it runs before the main page.
 */
export function PageBackgroundApplier() {
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const bg = JSON.parse(saved) as PageBackground
      const body = document.body
      if (bg.type === 'color') {
        body.style.backgroundImage = ''
        body.style.backgroundColor = bg.value
      } else if (bg.type === 'gradient') {
        body.style.backgroundImage = bg.value
        body.style.backgroundAttachment = 'fixed'
      } else if (bg.type === 'image') {
        body.style.backgroundImage = `url(${bg.value})`
        body.style.backgroundSize = 'cover'
        body.style.backgroundPosition = 'center'
        body.style.backgroundAttachment = 'fixed'
      }
    } catch {
      // ignore
    }
  }, [])

  return null
}
