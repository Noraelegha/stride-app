'use client'
import { useEffect } from 'react'

export default function ThemeColor({ color }: { color: string }) {
  useEffect(() => {
    // Update meta theme-color (controls Android PWA and browser tab)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', color)

    // Update body background so iOS status bar area matches the screen
    const prevBg = document.body.style.background
    document.body.style.background = color

    return () => {
      document.body.style.background = prevBg
    }
  }, [color])

  return null
}