'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const TARGETS = [
  { label: 'Both copy & graphic', value: 'both' },
  { label: 'Copy only', value: 'copy' },
  { label: 'Graphic only', value: 'graphic' },
]

export default function ReviseDraftButton() {
  const { id } = useDocumentInfo()
  const [note, setNote] = useState('')
  const [target, setTarget] = useState('both')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the draft before requesting an AI revision.</p>

  const revise = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/revise', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ postId: id, note: note.trim(), target }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg('Revised — reloading to show the new draft…')
      window.location.reload()
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
      setBusy(false)
    }
  }

  return (
    <div style={{ margin: '12px 0 20px', maxWidth: 540 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#18181b', marginBottom: 4 }}>
        Ask the AI to revise this post
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Make the hook punchier and lead with the denial-rate stat."
        rows={3}
        disabled={busy}
        style={{ width: '100%', padding: 8, fontSize: 13, borderRadius: 6, border: '1px solid #e4e4e7', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <select value={target} onChange={(e) => setTarget(e.target.value)} disabled={busy}
          style={{ padding: '6px 8px', fontSize: 13, borderRadius: 6, border: '1px solid #e4e4e7' }}>
          {TARGETS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <button type="button" onClick={revise} disabled={busy || !note.trim()}>
          {busy ? 'Revising…' : 'Revise with AI'}
        </button>
      </div>
      <p style={{ marginTop: 6, fontSize: 12, color: '#52525b' }}>
        Overwrites this draft (version history is kept) and resets status to Draft for re-review.
      </p>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
