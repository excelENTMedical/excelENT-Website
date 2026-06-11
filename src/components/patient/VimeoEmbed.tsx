'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  vimeoId: string
  title: string
  posterSrc?: string
  posterAlt?: string
}

export default function VimeoEmbed({ vimeoId, title, posterSrc, posterAlt }: Props) {
  const [active, setActive] = useState(false)
  const src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ aspectRatio: '16 / 9', borderRadius: 'var(--radius-card-editorial)' }}
    >
      {active ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 w-full h-full"
        >
          {posterSrc && (
            <Image
              src={posterSrc}
              alt={posterAlt ?? title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          )}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
          >
            <span className="flex items-center justify-center w-20 h-20 rounded-full bg-white/95 text-[color:var(--color-accent-primary)] shadow-lg group-hover:scale-105 transition-transform">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
