export default function ArrowRight({
  className = '',
}: {
  className?: string
}) {
  return (
    <svg
      className={`inline-block w-[1em] h-[1em] flex-shrink-0 ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 8h11M9 3.5l4.5 4.5L9 12.5" />
    </svg>
  )
}
