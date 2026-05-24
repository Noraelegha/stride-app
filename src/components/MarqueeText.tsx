'use client'
import { useRef, useEffect, useState } from 'react'

interface Props {
  text: string
  style?: React.CSSProperties
}

const SCROLL_SPEED = 40 // px per second — completely uniform now

export default function MarqueeText({ text, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollDist, setScrollDist] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && textRef.current) {
        const textWidth = textRef.current.scrollWidth
        const containerWidth = containerRef.current.clientWidth
        
        // Only scroll if text overflows the container
        if (textWidth > containerWidth) {
          const gap = textWidth - containerWidth
          setScrollDist(gap)
          
          // FIX: Calculate speed using the full text width, not the gap
          setDuration(textWidth / SCROLL_SPEED) 
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
          // TIP: Use 'linear' timing for perfectly consistent speed. 
          // 'ease-in-out' accelerates/decelerates differently based on distance.
          animation: scrollDist > 0
            ? `marqueeBack ${duration}s linear 1.5s infinite`
            : 'none',
        } as React.CSSProperties}
      >
        {text}
      </span>
    </div>
  )
}