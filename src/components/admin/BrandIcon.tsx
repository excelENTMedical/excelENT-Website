import React from 'react'

// Rendered in the nav header via admin.components.graphics.Icon
export default function BrandIcon() {
  return (
    <span
      style={{
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: '-0.02em',
        color: 'var(--ee-purple, #89007a)',
      }}
    >
      eX
    </span>
  )
  // Alternative (scaled logo):
  // return <img src="/images/logo.png" alt="excelENT" style={{ width: 24, height: 24, objectFit: 'contain' }} />
}
