'use client'
import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function PublishToLinkedInButton() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save and approve the post before publishing.</p>

  const publish = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/publish', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg(data.scheduled ? 'Scheduled — the worker will publish it at the set time.' : `Published to LinkedIn (${data.postUrn || 'ok'}).`)
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <button type="button" onClick={publish} disabled={busy}>
        {busy ? 'Publishing…' : 'Publish to LinkedIn'}
      </button>
      <p style={{ marginTop: 6, fontSize: 12, color: '#52525b' }}>
        Only approved posts publish. Empty Scheduled Time = now; a future time queues it for the scheduler.
      </p>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
