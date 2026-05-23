'use client'
import { useRef, useEffect, useState } from 'react'

interface Props {
  text: string
  style?: React.CSSProperties
}

const SCROLL_SPEED = 15 // px per second — adjust this one number to tune reading speed

export default function MarqueeText({ text, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollDist, setScrollDist] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && textRef.current) {
        const gap = textRef.current.scrollWidth - containerRef.current.clientWidth
        if (gap > 4) {
          setScrollDist(gap)
          setDuration(gap / SCROLL_SPEED)
        } else {
          setScrollDist(0)
          setDuration(0)
        }
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text])

  return (
    <div ref={containerRef} style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }}>
      <span
        ref={textRef}
        style={{
          display: 'inline-block',
          paddingRight: '4px',
          '--sd': `-${scrollDist}px`,
          animation: scrollDist > 0
            ? `marqueeBack ${duration}s ease-in-out 1.5s infinite`
            : 'none',
        } as React.CSSProperties}
      >
        {text}
      </span>
    </div>
  )
}