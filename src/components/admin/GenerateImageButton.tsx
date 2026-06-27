'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function GenerateImageButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the post before generating an image.</p>

  const run = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/social/image', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(
        data.usedReferences
          ? "Image generated from the brand’s seed images and attached. Reload to see it."
          : "Image generated (brand has no seed images — used a text-only prompt). Reload to see it.",
      )
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <button type="button" onClick={run} disabled={busy}>
        {busy ? 'Generating…' : 'Generate image (AI)'}
      </button>
      <p style={{ marginTop: 6, fontSize: 12, color: '#52525b' }}>
        Uses this brand&apos;s seed images as style references. Replaces the post&apos;s current image.
      </p>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
