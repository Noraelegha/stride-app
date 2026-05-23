'use client'
import { useRef, useEffect, useState } from 'react'

interface Props {
  text: string
  style?: React.CSSProperties
}

export default function MarqueeText({ text, style }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [scrollDist, setScrollDist] = useState(0)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current && textRef.current) {
        const gap = textRef.current.scrollWidth - containerRef.current.clientWidth
        setScrollDist(gap > 4 ? gap : 0)
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
          '--sd': `-${scrollDist}px`,
          animation: scrollDist > 0 ? 'marqueeBack 18s ease-in-out infinite' : 'none',
        } as React.CSSProperties}
      >
        {text}
      </span>
    </div>
  )
}