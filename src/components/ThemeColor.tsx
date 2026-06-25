'use client'
import { useEffect } from 'react'

export default function ThemeColor({ color }: { color: string }) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', color)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      newMeta.content = color
      document.head.appendChild(newMeta)
    }
    return () => {
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', '#ffffff')
    }
  }, [color])

  return null
}