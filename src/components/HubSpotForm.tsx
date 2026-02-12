'use client'

import { useEffect, useRef } from 'react'

interface HubSpotFormProps {
  formId: string
  portalId?: string
  region?: string
}

declare global {
  interface Window {
    hbspt?: {
      forms: {
        create: (options: {
          region: string
          portalId: string
          formId: string
          target: string
        }) => void
      }
    }
  }
}

export default function HubSpotForm({
  formId,
  portalId = '23456789', // Replace with actual portal ID
  region = 'na1',
}: HubSpotFormProps) {
  const formRef = useRef<HTMLDivElement>(null)
  const formContainerId = `hubspot-form-${formId}`

  useEffect(() => {
    // Load HubSpot script if not already loaded
    const existingScript = document.querySelector(
      'script[src*="js.hsforms.net"]'
    )

    const createForm = () => {
      if (window.hbspt && formRef.current) {
        window.hbspt.forms.create({
          region,
          portalId,
          formId,
          target: `#${formContainerId}`,
        })
      }
    }

    if (existingScript) {
      // Script already exists, just create the form
      createForm()
    } else {
      // Load the script
      const script = document.createElement('script')
      script.src = '//js.hsforms.net/forms/embed/v2.js'
      script.async = true
      script.onload = createForm
      document.head.appendChild(script)
    }
  }, [formId, portalId, region, formContainerId])

  return (
    <div className="hubspot-form-container">
      <div id={formContainerId} ref={formRef} />
      <style jsx>{`
        .hubspot-form-container :global(.hs-form) {
          font-family: inherit;
        }
        .hubspot-form-container :global(.hs-form-field) {
          margin-bottom: 1rem;
        }
        .hubspot-form-container :global(.hs-form-field label) {
          display: block;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }
        .hubspot-form-container :global(.hs-input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.15s ease-in-out;
        }
        .hubspot-form-container :global(.hs-input:focus) {
          outline: none;
          border-color: #89007a;
          box-shadow: 0 0 0 3px rgba(137, 0, 122, 0.1);
        }
        .hubspot-form-container :global(.hs-button) {
          width: 100%;
          padding: 0.75rem 1.5rem;
          background-color: #89007a;
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background-color 0.15s ease-in-out;
        }
        .hubspot-form-container :global(.hs-button:hover) {
          background-color: #6d0062;
        }
        .hubspot-form-container :global(.hs-error-msgs) {
          color: #dc2626;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
      `}</style>
    </div>
  )
}
