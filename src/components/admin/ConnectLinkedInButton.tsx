'use client'
import React, { useEffect, useState } from 'react'

export default function ConnectLinkedInButton() {
  const [justConnected, setJustConnected] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('connected') === '1') {
      setJustConnected(true)
    }
  }, [])
  return (
    <div style={{ margin: '12px 0 20px' }}>
      <a href="/api/social/linkedin/connect" className="btn btn--style-primary" style={{ textDecoration: 'none' }}>
        Connect LinkedIn
      </a>
      <p style={{ marginTop: 8, fontSize: 12, color: '#52525b' }}>
        Authorizes the ExcelENT Company Page for publishing. Re-run this if posting starts failing with a token error.
      </p>
      {justConnected && <p style={{ marginTop: 6, fontSize: 13, color: '#15803d' }}>LinkedIn connected.</p>}
    </div>
  )
}
