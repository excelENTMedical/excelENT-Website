interface Props {
  /** A single JSON-LD object or an array of them. */
  data: object | object[]
}

/**
 * Renders one or more JSON-LD <script type="application/ld+json"> blocks.
 *
 * Server component — JSON is serialized at build/SSR time, so the markup
 * shows up in the initial HTML where Google's crawler can read it.
 *
 * Note: we don't escape `</script>` because schema.org structured data
 * comes from our own constants/content, never user-supplied input.
 */
export default function StructuredData({ data }: Props) {
  const blocks = Array.isArray(data) ? data : [data]
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
