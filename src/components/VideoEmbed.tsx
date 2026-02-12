'use client'

import { useState } from 'react'
import Image from 'next/image'

interface VideoEmbedProps {
  url: string
  thumbnail?: string
  title?: string
}

function getVideoId(url: string): { provider: 'youtube' | 'vimeo' | null; id: string | null } {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match) {
      return { provider: 'youtube', id: match[1] }
    }
  }

  // Vimeo patterns
  const vimeoPattern = /(?:vimeo\.com\/)(\d+)/
  const vimeoMatch = url.match(vimeoPattern)
  if (vimeoMatch) {
    return { provider: 'vimeo', id: vimeoMatch[1] }
  }

  return { provider: null, id: null }
}

export default function VideoEmbed({ url, thumbnail, title }: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { provider, id } = getVideoId(url)

  if (!provider || !id) {
    return null
  }

  const embedUrl =
    provider === 'youtube'
      ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${id}?autoplay=1`

  const defaultThumbnail =
    provider === 'youtube'
      ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      : undefined

  const displayThumbnail = thumbnail || defaultThumbnail

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-xl">
      {!isPlaying ? (
        <>
          {displayThumbnail && (
            <Image
              src={displayThumbnail}
              alt={title || 'Video thumbnail'}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-20 h-20 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all hover:scale-110 shadow-lg"
              aria-label="Play video"
            >
              <svg
                className="w-8 h-8 text-primary-600 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white font-medium">{title}</p>
            </div>
          )}
        </>
      ) : (
        <iframe
          src={embedUrl}
          title={title || 'Video player'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}
