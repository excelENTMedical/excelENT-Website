'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function GenerateDraftsButton() {
  const { id } = useDocumentInfo()
  const [theme, setTheme] = useState('')
  const [platform, setPlatform] = useState('linkedin')
  const [count, setCount] = useState(3)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) {
    return <p style={{ fontSize: 12, color: '#666' }}>Save this brand profile first, then generate drafts.</p>
  }

  const run = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/social/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ brand: id, theme: theme || 'General', platform, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(`Created ${data.created.length} draft(s). Open Social Posts to review.`)
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: 12, marginTop: 12 }}>
      <strong style={{ color: '#89007a' }}>Generate drafts</strong>
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="theme" value={theme} onChange={(e) => setTheme(e.target.value)} />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
        </select>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ width: 60 }}
        />
        <button type="button" onClick={run} disabled={busy}>
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
