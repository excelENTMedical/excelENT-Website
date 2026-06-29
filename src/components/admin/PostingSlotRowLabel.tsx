'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type SlotData = { dayOfWeek?: string; time?: string; platform?: string }

export default function PostingSlotRowLabel() {
  const { data, rowNumber } = useRowLabel<SlotData>()
  const day = DAYS[Number(data?.dayOfWeek)] ?? ''
  const time = data?.time ?? ''
  const platform = data?.platform
    ? data.platform.charAt(0).toUpperCase() + data.platform.slice(1)
    : ''
  const parts = [day, time, platform].filter(Boolean)
  if (!parts.length) return <span>{`Slot ${(rowNumber ?? 0) + 1}`}</span>
  return <span>{parts.join(' · ')}</span>
}
