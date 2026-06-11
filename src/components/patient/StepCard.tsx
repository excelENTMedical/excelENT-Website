interface Props {
  number: number
  title: string
  body: string
}

export default function StepCard({ number, title, body }: Props) {
  return (
    <article className="bg-surface border-l-4 border-[color:var(--color-accent-primary)] p-6 md:p-8 flex flex-col gap-4">
      <span
        aria-hidden="true"
        className="font-cabin font-bold text-3xl md:text-4xl text-[color:var(--color-accent-primary)] leading-none"
      >
        #{number}
      </span>
      <h3 className="heading-3-patient">{title}</h3>
      <p className="body-patient text-ink-secondary">{body}</p>
    </article>
  )
}
