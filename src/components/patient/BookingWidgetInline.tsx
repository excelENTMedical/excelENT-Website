'use client'

export default function BookingWidgetInline() {
  return (
    <div
      id="excelent-booking-widget"
      data-excelent-booking-widget
      style={{
        minHeight: '600px',
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-modal)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '500px',
          gap: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <p className="body-patient" style={{ color: 'var(--color-text-secondary)' }}>
          Loading booking widget...
        </p>
        <a
          href="https://app.excelentmedical.com/excelvoice/booking-test"
          className="btn-patient-primary btn-patient-md"
        >
          Open booking page directly
        </a>
      </div>
    </div>
  )
}
