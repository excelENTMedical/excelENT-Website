'use client'
import React, { useMemo, useState, useEffect } from 'react'
import { useDocumentInfo, useAllFormFields } from '@payloadcms/ui'

const CHROME: Record<string, { sub: string }> = {
  linkedin: { sub: 'Revenue Cycle Management · Promoted' },
  facebook: { sub: 'Sponsored' },
  instagram: { sub: 'Sponsored' },
}

export default function PostPreview() {
  const { id } = useDocumentInfo()
  const [fields] = useAllFormFields()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [imgError, setImgError] = useState(false)

  const get = (k: string) => (fields[k]?.value as string) || ''
  const platform = get('platform') || 'linkedin'
  const copy = get('copy')
  const style = get('graphicStyle')
  // Layouts render landscape; only the legacy cards are square. A hardcoded
  // 1/1 box letterboxed every layout preview.
  const LAYOUTS = ['object', 'twoband', 'contrast', 'orbit', 'statement']
  const ratio = LAYOUTS.includes(style) ? '3 / 2' : '1 / 1'

  // The publish path sends the attached asset, so when one exists the preview
  // must show it — the /api/social/graphic render below is only the fallback.
  const assetId = fields['asset']?.value as string | number | undefined
  const [assetUrl, setAssetUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!assetId) {
      setAssetUrl(null)
      return
    }
    fetch(`/api/social-assets/${assetId}?depth=0`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((doc) => {
        if (!cancelled) setAssetUrl(doc?.url || null)
      })
      .catch(() => {
        if (!cancelled) setAssetUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [assetId])

  // Cache-bust the preview image whenever copy/style/graphic fields change.
  const ver = useMemo(() => {
    const keys = ['copy', 'graphicStyle', 'platform', 'graphic.headline', 'graphic.subtext',
      'graphic.statFrom', 'graphic.statTo', 'graphic.statLabel', 'graphic.caption',
      'graphic.items', 'graphic.descriptor', 'graphic.artefact']
    return encodeURIComponent(keys.map((k) => (fields[k]?.value as string) || '').join('|')).slice(0, 64)
  }, [fields])

  React.useEffect(() => { setImgError(false) }, [ver])

  if (!id) return <p style={{ fontSize: 12, color: '#666' }}>Save the draft to see its preview.</p>

  const save = async () => {
    setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/social/graphic', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        credentials: 'include', body: JSON.stringify({ postId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      setMsg('Graphic saved to the post asset. Refreshing…')
      setTimeout(() => window.location.reload(), 1000)
    } catch (e) {
      setMsg(`Error: ${e instanceof Error ? e.message : 'failed'}`)
    } finally { setBusy(false) }
  }

  return (
    <div style={{ margin: '12px 0 20px' }}>
      <div style={{ maxWidth: 540, border: '1px solid #e4e4e7', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 8px' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: '#061b42', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>PS</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#18181b' }}>PS | RCM</div>
            <div style={{ fontSize: 12, color: '#52525b' }}>{(CHROME[platform] || CHROME.linkedin).sub}</div>
          </div>
        </div>
        <div style={{ padding: '4px 16px 12px', fontSize: 14, lineHeight: 1.5, color: '#18181b', whiteSpace: 'pre-line' }}>{copy}</div>
        {assetUrl ? (
          <img
            key={assetUrl}
            alt="attached post image"
            src={assetUrl}
            style={{ width: '100%', display: 'block', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}
          />
        ) : style !== 'none' && (imgError ? (
          <div style={{ padding: '24px 16px', fontSize: 13, color: '#b91c1c', borderTop: '1px solid #e4e4e7' }}>
            Couldn't render the graphic preview. Save the record, then reopen.
          </div>
        ) : (
          <img
            key={ver}
            alt="generated graphic"
            src={`/api/social/graphic?postId=${id}&v=${ver}`}
            onError={() => setImgError(true)}
            style={{ width: '100%', aspectRatio: ratio, display: 'block', borderTop: '1px solid #e4e4e7', borderBottom: '1px solid #e4e4e7' }}
          />
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0', fontSize: 13, color: '#52525b', fontWeight: 600 }}>
          <span>👍 Like</span><span>💬 Comment</span><span>↗ Share</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <button type="button" onClick={save} disabled={busy || style === 'none'}>
          {busy ? 'Saving…' : assetUrl ? 'Regenerate graphic' : 'Save graphic to asset'}
        </button>
        <span style={{ fontSize: 12, color: '#52525b' }}>
          {assetUrl
            ? 'Replaces the attached image with a fresh render of the saved graphic fields.'
            : 'Save the record first — the graphic and this preview use the saved values.'}
        </span>
      </div>
      {msg && <p style={{ marginTop: 8, fontSize: 13 }}>{msg}</p>}
    </div>
  )
}
