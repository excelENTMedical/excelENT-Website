import ScheduleButton from './ScheduleButton'

interface Props {
  title: string
  body?: string
  variant?: 'default' | 'subtle'
}

export default function ScheduleCTABreakout({ title, body, variant = 'default' }: Props) {
  const subtle = variant === 'subtle'
  return (
    <section
      aria-label="Schedule call to action"
      className={subtle ? 'bg-surface-subtle border-y border-edge' : 'bg-[color:var(--color-accent-primary)]'}
    >
      <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div
          className={`max-w-4xl mx-auto text-center flex flex-col gap-6 ${
            subtle ? '' : 'text-[color:var(--color-accent-primary-fg)]'
          }`}
        >
          <h2
            className="heading-2-patient text-balance"
            style={subtle ? undefined : { color: 'var(--color-accent-primary-fg)' }}
          >
            {title}
          </h2>
          {body && (
            <p
              className="body-lead-patient max-w-2xl mx-auto"
              style={subtle ? undefined : { color: 'rgba(255,255,255,0.88)' }}
            >
              {body}
            </p>
          )}
          <div className="mt-2 flex justify-center">
            <ScheduleButton
              size="lg"
              className={
                subtle
                  ? ''
                  : '!bg-[color:var(--color-accent-primary-fg)] !text-[color:var(--color-accent-primary)] hover:!opacity-90'
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
