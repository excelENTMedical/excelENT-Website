'use client'

import { useState, type FormEvent } from 'react'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const PROVIDER_RANGES = [
  '1 (solo practice)',
  '2–3',
  '4–6',
  '7–10',
  '11–20',
  '20+',
]

export default function DemoForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('submitting')
    setErrorMsg('')

    const data = Object.fromEntries(new FormData(e.currentTarget).entries())

    try {
      // TODO: wire to Payload `DemoRequest` collection via /api/demo-request.
      // For now, fail closed on the network — but in dev, post to a stub
      // endpoint or just simulate success after a beat.
      const res = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(() => null)

      if (!res || !res.ok) {
        // Stub success while the API route doesn't exist yet so the UX
        // is still demonstrable. Remove this fallback once the Payload
        // collection + route handler land.
        await new Promise((r) => setTimeout(r, 500))
        setState('success')
        return
      }

      setState('success')
    } catch {
      setErrorMsg('Something went wrong. Please try again or email demo@excelentmedical.com.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-l-4 border-[color:var(--color-accent-primary)] bg-surface-alt p-8 md:p-10 flex flex-col gap-4"
      >
        <h2 className="font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
          Thanks — we&rsquo;ll be in touch within one business day.
        </h2>
        <p className="body-lead">
          A team member will reach out via email to schedule a working
          session that fits your calendar. In the meantime, you can review
          the platform overview or read more about our partner practices.
        </p>
        <ul role="list" className="flex flex-col gap-2 mt-2">
          <li>
            <a
              href="/b2b/solutions"
              className="text-sm font-semibold text-[color:var(--color-accent-primary)] hover:underline"
            >
              Review the Practice Solutions Platform →
            </a>
          </li>
          <li>
            <a
              href="/b2b/why-excelent"
              className="text-sm font-semibold text-[color:var(--color-accent-primary)] hover:underline"
            >
              See who&rsquo;s behind excelENT →
            </a>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border-l-4 border-[color:var(--color-accent-primary)] p-8 md:p-10 flex flex-col gap-6 bg-surface"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          label="Full Name"
          name="name"
          type="text"
          autoComplete="name"
          required
        />
        <Field
          label="Work Email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
        <Field
          label="Practice Name"
          name="practice"
          type="text"
          autoComplete="organization"
          required
        />
        <Field
          label="Your Role"
          name="role"
          type="text"
          autoComplete="organization-title"
          placeholder="e.g. Practice Administrator"
          required
        />
        <Select
          label="Number of Providers"
          name="providers"
          required
          options={PROVIDER_RANGES}
        />
        <Field
          label="Phone (Optional)"
          name="phone"
          type="tel"
          autoComplete="tel"
        />
      </div>

      <details className="border-t border-edge pt-6">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-sm font-semibold text-ink-secondary hover:text-ink transition-colors duration-fast">
          <span>Add context about your practice (optional)</span>
          <span
            aria-hidden="true"
            className="text-xs text-ink-tertiary"
          >
            +
          </span>
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Field label="Current EMR / EHR" name="emr" type="text" />
          <Field label="Current RCM Provider" name="rcm" type="text" />
          <Textarea
            label="What's Your Biggest Pain Right Now?"
            name="pain"
            rows={3}
            className="md:col-span-2"
          />
        </div>
      </details>

      {errorMsg && (
        <p
          role="alert"
          className="text-sm text-[color:var(--color-status-error)]"
        >
          {errorMsg}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-2">
        <button
          type="submit"
          disabled={state === 'submitting'}
          className="btn-b2b-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === 'submitting' ? 'Submitting…' : 'Request a Demo'}
        </button>
        <p className="text-sm text-ink-secondary">
          We respond within one business day.
        </p>
      </div>

      <p className="text-xs text-ink-tertiary border-t border-edge pt-4 mt-2">
        We collect this information only to schedule your demo. We do not
        sell or share it. See our{' '}
        <a
          href="/b2b/privacy"
          className="underline hover:text-ink"
        >
          privacy notice
        </a>
        .
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  required = false,
}: {
  label: string
  name: string
  type: string
  autoComplete?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-[color:var(--color-status-error)] ml-1">
            *
          </span>
        )}
      </span>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        className="px-4 py-3 border border-edge bg-surface text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-[color:var(--color-accent-primary)] focus:shadow-focus transition-shadow duration-fast"
        style={{ borderRadius: 'var(--radius-input)' }}
      />
    </label>
  )
}

function Select({
  label,
  name,
  required = false,
  options,
}: {
  label: string
  name: string
  required?: boolean
  options: string[]
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-[color:var(--color-status-error)] ml-1">
            *
          </span>
        )}
      </span>
      <select
        name={name}
        required={required}
        aria-required={required}
        defaultValue=""
        className="px-4 py-3 border border-edge bg-surface text-ink focus:outline-none focus:border-[color:var(--color-accent-primary)] focus:shadow-focus transition-shadow duration-fast"
        style={{ borderRadius: 'var(--radius-input)' }}
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function Textarea({
  label,
  name,
  rows = 3,
  className = '',
}: {
  label: string
  name: string
  rows?: number
  className?: string
}) {
  return (
    <label className={`flex flex-col gap-2 text-sm ${className}`}>
      <span className="font-semibold text-ink">{label}</span>
      <textarea
        name={name}
        rows={rows}
        className="px-4 py-3 border border-edge bg-surface text-ink placeholder:text-ink-tertiary focus:outline-none focus:border-[color:var(--color-accent-primary)] focus:shadow-focus transition-shadow duration-fast resize-y"
        style={{ borderRadius: 'var(--radius-input)' }}
      />
    </label>
  )
}
