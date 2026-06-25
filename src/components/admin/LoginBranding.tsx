import React from 'react'

// Rendered above the login form via admin.components.beforeLogin
export default function LoginBranding() {
  return (
    <p
      style={{
        textAlign: 'center',
        margin: '0 0 20px',
        fontSize: 14,
        color: 'var(--theme-elevation-600)',
      }}
    >
      Social &amp; Content Admin
    </p>
  )
}
