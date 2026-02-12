import React from 'react'

interface LexicalNode {
  type: string
  tag?: string
  text?: string
  format?: number
  children?: LexicalNode[]
  url?: string
  listType?: string
  value?: number
  direction?: string
  indent?: number
  version?: number
  rel?: string
  target?: string
  fields?: Record<string, unknown>
}

interface LexicalRoot {
  root: LexicalNode
}

interface RichTextProps {
  content: LexicalRoot | null | undefined
  className?: string
}

function serializeNode(node: LexicalNode, index: number): React.ReactNode {
  if (!node) return null

  // Text node
  if (node.type === 'text') {
    let text: React.ReactNode = node.text || ''
    const format = node.format || 0

    if (format & 1) text = <strong key={`b-${index}`}>{text}</strong>
    if (format & 2) text = <em key={`i-${index}`}>{text}</em>
    if (format & 4) text = <s key={`s-${index}`}>{text}</s>
    if (format & 8) text = <u key={`u-${index}`}>{text}</u>
    if (format & 16) text = <code key={`c-${index}`}>{text}</code>

    return text
  }

  // Linebreak
  if (node.type === 'linebreak') {
    return <br key={index} />
  }

  const children = node.children?.map((child, i) => serializeNode(child, i)) || []

  switch (node.type) {
    case 'root':
      return <>{children}</>

    case 'paragraph':
      return <p key={index}>{children}</p>

    case 'heading':
      const HeadingTag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
      return <HeadingTag key={index}>{children}</HeadingTag>

    case 'list':
      if (node.listType === 'number') {
        return <ol key={index}>{children}</ol>
      }
      return <ul key={index}>{children}</ul>

    case 'listitem':
      return <li key={index}>{children}</li>

    case 'link':
    case 'autolink':
      return (
        <a
          key={index}
          href={node.fields?.url as string || node.url || '#'}
          target={node.fields?.newTab ? '_blank' : undefined}
          rel={node.fields?.newTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )

    case 'quote':
      return <blockquote key={index}>{children}</blockquote>

    case 'horizontalrule':
      return <hr key={index} />

    default:
      return <>{children}</>
  }
}

export default function RichText({ content, className }: RichTextProps) {
  if (!content?.root) return null

  return (
    <div className={className || 'prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-600'}>
      {serializeNode(content.root, 0)}
    </div>
  )
}

/**
 * Extract plain text from Lexical JSON content.
 * Used for FAQ answers when plain string is needed.
 */
export function richTextToPlainText(content: LexicalRoot | null | undefined): string {
  if (!content?.root) return ''

  function extractText(node: LexicalNode): string {
    if (node.type === 'text') return node.text || ''
    if (node.type === 'linebreak') return '\n'
    if (!node.children) return ''
    return node.children.map(extractText).join('')
  }

  return extractText(content.root).trim()
}
