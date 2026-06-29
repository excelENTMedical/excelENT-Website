'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

// Field keys checked in order; first non-empty string wins as the row label.
const LABEL_KEYS = ['theme', 'cta', 'term', 'specialty', 'email', 'text', 'name']

export default function ArrayRowLabel() {
  const { data, rowNumber } = useRowLabel<Record<string, unknown>>()
  const fallback = `Row ${String((rowNumber ?? 0) + 1).padStart(2, '0')}`

  let label = ''
  for (const key of LABEL_KEYS) {
    const value = data?.[key]
    if (typeof value === 'string' && value.trim()) {
      label = value.trim()
      break
    }
  }
  if (!label) return <span>{fallback}</span>
  const text = label.length > 50 ? `${label.slice(0, 50)}…` : label
  return <span>{text}</span>
}
