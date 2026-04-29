/**
 * Seed script: reads real content from WordPress MySQL database
 * and seeds it into Payload CMS PostgreSQL via the Local API.
 *
 * Usage: npx tsx src/seed-from-wp.ts
 */

// load-env MUST be the first import — it sets process.env before payload.config reads it
import './load-env'
import { getPayload } from 'payload'
import config from './payload.config'
import mysql from 'mysql2/promise'

// ─── WordPress MySQL config ────────────────────────────────────────────────
const WP_DB = {
  host: '127.0.0.1',
  port: 3306,
  user: 'bn_wordpress',
  password: '80ae856948c0d7e7a219ae18d36c8b536ed543589bc87f76146323158079751a',
  database: 'bitnami_wordpress',
}

// ─── HTML to Lexical conversion ────────────────────────────────────────────

/** Strip Elementor, shortcodes, and other WP-specific markup */
function stripWpMarkup(html: string): string {
  let s = html
  // Remove Elementor comments and data attributes
  s = s.replace(/<!--\s*\/?(?:elementor|wp:|\/wp:)[^>]*-->/gi, '')
  // Remove shortcodes like [shortcode attr="val"]...[/shortcode]
  s = s.replace(/\[[^\]]+\]/g, '')
  // Remove style tags and content
  s = s.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  // Remove script tags and content
  s = s.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  // Remove data-* attributes
  s = s.replace(/\s+data-[a-z0-9_-]+="[^"]*"/gi, '')
  // Remove class/id/style attributes
  s = s.replace(/\s+(?:class|id|style|width|height|align|role|aria-[a-z]+)="[^"]*"/gi, '')
  // Normalize whitespace in tags
  s = s.replace(/<(\w+)\s+>/g, '<$1>')
  // Remove empty divs/spans/sections
  s = s.replace(/<(div|span|section|header|footer|nav|aside|article|figure|figcaption)[^>]*>\s*<\/\1>/gi, '')
  // Unwrap remaining divs/spans/sections (keep inner content)
  s = s.replace(/<\/?(div|span|section|header|footer|nav|aside|article|figure|figcaption|main|blockquote)[^>]*>/gi, '')
  // Remove img tags (we don't import images)
  s = s.replace(/<img[^>]*\/?>/gi, '')
  // Normalize <br> variants
  s = s.replace(/<br\s*\/?>/gi, '\n')
  // &nbsp; to space
  s = s.replace(/&nbsp;/gi, ' ')
  // Decode common HTML entities
  s = s.replace(/&amp;/g, '&')
  s = s.replace(/&lt;/g, '<')
  s = s.replace(/&gt;/g, '>')
  s = s.replace(/&quot;/g, '"')
  s = s.replace(/&#039;/g, "'")
  s = s.replace(/&rsquo;/g, "\u2019")
  s = s.replace(/&lsquo;/g, "\u2018")
  s = s.replace(/&rdquo;/g, "\u201C")
  s = s.replace(/&ldquo;/g, "\u201D")
  s = s.replace(/&mdash;/g, "\u2014")
  s = s.replace(/&ndash;/g, "\u2013")
  s = s.replace(/&hellip;/g, "\u2026")
  return s
}

/** Strip all HTML tags from a string */
function stripAllTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

/** Parse inline formatting (bold, italic, links) into Lexical text children */
function parseInlineContent(html: string): unknown[] {
  const children: unknown[] = []
  // Regex to match <strong>, <b>, <em>, <i>, <a> tags
  const inlineRegex = /<(strong|b|em|i|a)(\s[^>]*)?>[\s\S]*?<\/\1>/gi

  let lastIndex = 0
  let match: RegExpExecArray | null

  // Reset regex
  const workingHtml = html
  const regex = /<(strong|b|em|i|a)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi

  while ((match = regex.exec(workingHtml)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      const before = stripAllTags(workingHtml.slice(lastIndex, match.index)).trim()
      if (before) {
        children.push(makeTextNode(before, 0))
      }
    }

    const tag = match[1].toLowerCase()
    const attrs = match[2] || ''
    const innerHtml = match[3]
    const innerText = stripAllTags(innerHtml).trim()

    if (!innerText) {
      lastIndex = match.index + match[0].length
      continue
    }

    if (tag === 'a') {
      // Extract href
      const hrefMatch = attrs.match(/href="([^"]*)"/)
      const href = hrefMatch ? hrefMatch[1] : ''
      // Bold format = 1, italic = 2, bold+italic = 3
      // For links we just use text format 0 but add link node
      // Lexical uses a link node wrapping a text node
      children.push({
        type: 'link',
        format: '',
        indent: 0,
        version: 3,
        url: href,
        newTab: false,
        rel: 'noopener noreferrer',
        children: [makeTextNode(innerText, 0)],
        direction: 'ltr',
      })
    } else if (tag === 'strong' || tag === 'b') {
      // Check for nested em/i
      if (/<(em|i)>/i.test(innerHtml)) {
        children.push(makeTextNode(innerText, 3)) // bold+italic
      } else {
        children.push(makeTextNode(innerText, 1)) // bold
      }
    } else if (tag === 'em' || tag === 'i') {
      if (/<(strong|b)>/i.test(innerHtml)) {
        children.push(makeTextNode(innerText, 3)) // bold+italic
      } else {
        children.push(makeTextNode(innerText, 2)) // italic
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining text after last match
  if (lastIndex < workingHtml.length) {
    const remaining = stripAllTags(workingHtml.slice(lastIndex)).trim()
    if (remaining) {
      children.push(makeTextNode(remaining, 0))
    }
  }

  // If no children were produced, return a single text node
  if (children.length === 0) {
    const text = stripAllTags(html).trim()
    if (text) {
      children.push(makeTextNode(text, 0))
    }
  }

  return children
}

function makeTextNode(text: string, format: number) {
  return {
    type: 'text',
    format,
    style: '',
    detail: 0,
    mode: 'normal',
    version: 1,
    text,
  }
}

function makeParagraphNode(children: unknown[]) {
  return {
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    children: children.length > 0 ? children : [makeTextNode('', 0)],
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
  }
}

function makeHeadingNode(tag: string, children: unknown[]) {
  return {
    type: 'heading',
    format: '',
    indent: 0,
    version: 1,
    tag,
    children: children.length > 0 ? children : [makeTextNode('', 0)],
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
  }
}

function makeListNode(items: unknown[][]) {
  return {
    type: 'list',
    format: '',
    indent: 0,
    version: 1,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    children: items.map((itemChildren) => ({
      type: 'listitem',
      format: '',
      indent: 0,
      version: 1,
      value: 1,
      children: itemChildren.length > 0 ? itemChildren : [makeTextNode('', 0)],
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
    })),
    direction: 'ltr',
  }
}

function makeOrderedListNode(items: unknown[][]) {
  return {
    type: 'list',
    format: '',
    indent: 0,
    version: 1,
    listType: 'number',
    start: 1,
    tag: 'ol',
    children: items.map((itemChildren, i) => ({
      type: 'listitem',
      format: '',
      indent: 0,
      version: 1,
      value: i + 1,
      children: itemChildren.length > 0 ? itemChildren : [makeTextNode('', 0)],
      direction: 'ltr',
      textFormat: 0,
      textStyle: '',
    })),
    direction: 'ltr',
  }
}

/** Convert WordPress HTML content to Lexical JSON */
function htmlToLexical(rawHtml: string): object {
  const html = stripWpMarkup(rawHtml)
  const children: unknown[] = []

  // Split on block-level tags
  // We'll process the HTML by finding block elements
  const blockRegex = /<(h[1-6]|p|ul|ol)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(html)) !== null) {
    // Any text between blocks becomes a paragraph
    if (match.index > lastIndex) {
      const between = html.slice(lastIndex, match.index).trim()
      if (between && stripAllTags(between).trim()) {
        // Split on double newlines for separate paragraphs
        const parts = between.split(/\n\s*\n/).filter((p) => stripAllTags(p).trim())
        for (const part of parts) {
          children.push(makeParagraphNode(parseInlineContent(part)))
        }
      }
    }

    const tag = match[1].toLowerCase()
    const innerHtml = match[3]

    if (tag.startsWith('h')) {
      const inlineChildren = parseInlineContent(innerHtml)
      if (inlineChildren.length > 0) {
        children.push(makeHeadingNode(tag, inlineChildren))
      }
    } else if (tag === 'p') {
      const text = stripAllTags(innerHtml).trim()
      if (text) {
        children.push(makeParagraphNode(parseInlineContent(innerHtml)))
      }
    } else if (tag === 'ul') {
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
      const items: unknown[][] = []
      let liMatch: RegExpExecArray | null
      while ((liMatch = liRegex.exec(innerHtml)) !== null) {
        const liContent = parseInlineContent(liMatch[1])
        if (liContent.length > 0) {
          items.push(liContent)
        }
      }
      if (items.length > 0) {
        children.push(makeListNode(items))
      }
    } else if (tag === 'ol') {
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
      const items: unknown[][] = []
      let liMatch: RegExpExecArray | null
      while ((liMatch = liRegex.exec(innerHtml)) !== null) {
        const liContent = parseInlineContent(liMatch[1])
        if (liContent.length > 0) {
          items.push(liContent)
        }
      }
      if (items.length > 0) {
        children.push(makeOrderedListNode(items))
      }
    }

    lastIndex = match.index + match[0].length
  }

  // Any remaining text after last block
  if (lastIndex < html.length) {
    const remaining = html.slice(lastIndex).trim()
    if (remaining && stripAllTags(remaining).trim()) {
      const parts = remaining.split(/\n\s*\n/).filter((p) => stripAllTags(p).trim())
      for (const part of parts) {
        children.push(makeParagraphNode(parseInlineContent(part)))
      }
    }
  }

  // If nothing was parsed, create a single paragraph
  if (children.length === 0) {
    const plainText = stripAllTags(html).trim()
    if (plainText) {
      children.push(makeParagraphNode([makeTextNode(plainText, 0)]))
    } else {
      children.push(makeParagraphNode([makeTextNode('', 0)]))
    }
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children,
      direction: 'ltr',
    },
  }
}

/** Create simple Lexical content from plain text */
function makeLexicalContent(text: string): object {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children: [
        makeParagraphNode([makeTextNode(text, 0)]),
      ],
      direction: 'ltr',
    },
  }
}

// ─── Category detection ────────────────────────────────────────────────────

function detectCategory(title: string, content: string): string {
  const t = (title + ' ' + content).toLowerCase()
  if (/patient|story|stories|journey|testimon|experience|review/i.test(t)) return 'patient-stories'
  if (/balloon|sinuplasty|surgery|treatment|procedure|endoscop/i.test(title.toLowerCase())) return 'treatment-options'
  if (/news|update|announce|press|launch|award/i.test(title.toLowerCase())) return 'news'
  return 'sinus-health'
}

// ─── Main seed function ────────────────────────────────────────────────────

async function seed() {
  console.log('=== ExcelENT Seed from WordPress ===\n')

  // Connect to WordPress MySQL
  console.log('Connecting to WordPress MySQL...')
  let wpConn: mysql.Connection
  try {
    wpConn = await mysql.createConnection(WP_DB)
    console.log('  Connected to WordPress database.\n')
  } catch (err) {
    console.error('Failed to connect to WordPress MySQL:', err)
    process.exit(1)
  }

  // Initialize Payload
  console.log('Initializing Payload CMS...')
  const payload = await getPayload({ config })
  console.log('  Payload initialized.\n')

  // ─── Clear existing data ─────────────────────────────────────────────
  console.log('Clearing existing data...')
  const collectionsToClear = ['landing-pages', 'testimonials', 'articles', 'faqs', 'specialists'] as const
  for (const collection of collectionsToClear) {
    try {
      const existing = await payload.find({ collection, limit: 200 })
      for (const doc of existing.docs) {
        await payload.delete({ collection, id: doc.id })
      }
      console.log(`  Cleared ${collection}: ${existing.docs.length} docs`)
    } catch (err) {
      console.log(`  Warning clearing ${collection}: ${(err as Error).message}`)
    }
  }
  console.log()

  // ─── 1. Read WordPress blog posts ────────────────────────────────────
  console.log('Reading WordPress blog posts...')
  const [wpPosts] = await wpConn.execute(
    `SELECT ID, post_title, post_name, post_content, post_excerpt, post_date
     FROM wp_posts
     WHERE post_type = 'post'
       AND post_status = 'publish'
     ORDER BY post_date DESC`
  ) as [any[], any]
  console.log(`  Found ${wpPosts.length} published posts.\n`)

  // ─── 2. Create Articles from WP posts ────────────────────────────────
  console.log('Creating articles from WordPress posts...')
  for (const post of wpPosts) {
    const title = post.post_title || 'Untitled'
    const slug = post.post_name || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const rawContent = post.post_content || ''
    const strippedText = stripAllTags(stripWpMarkup(rawContent)).trim()
    const excerpt = strippedText.slice(0, 200) + (strippedText.length > 200 ? '...' : '')
    const category = detectCategory(title, rawContent)
    const publishedDate = post.post_date ? new Date(post.post_date).toISOString() : new Date().toISOString()

    try {
      const lexicalContent = htmlToLexical(rawContent)
      await payload.create({
        collection: 'articles',
        data: {
          title,
          slug,
          excerpt,
          content: lexicalContent,
          category,
          publishedDate,
          author: 'ExcelENT Medical',
          status: 'published',
        } as never,
      })
      console.log(`  [OK] ${title.substring(0, 60)}`)
    } catch (err) {
      // Fallback: use plain text content if Lexical validation fails
      try {
        const plainContent = makeLexicalContent(strippedText || title)
        await payload.create({
          collection: 'articles',
          data: {
            title,
            slug,
            excerpt,
            content: plainContent,
            category,
            publishedDate,
            author: 'ExcelENT Medical',
            status: 'published',
          } as never,
        })
        console.log(`  [OK] ${title.substring(0, 60)} (plain text fallback)`)
      } catch (err2) {
        console.error(`  [FAIL] ${title.substring(0, 60)}: ${(err2 as Error).message}`)
      }
    }
  }
  console.log()

  // ─── 3. Create Specialists ───────────────────────────────────────────
  console.log('Creating specialists...')
  const specialistsData = [
    {
      name: 'Coastal Ear, Nose & Throat',
      credentials: '',
      practiceName: 'Coastal Ear, Nose & Throat',
      phone: '(912) 597-2878',
      email: 'info@coastalent.com',
      address: { street: '4849 Paulsen St', city: 'Savannah', state: 'GA', zip: '31405' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sinus Surgery' }],
      location: 'savannah-ga',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'East Texas Sinus & Dizziness Center',
      credentials: '',
      practiceName: 'East Texas Sinus & Dizziness Center',
      phone: '(430) 209-5700',
      email: 'info@easttexassinus.com',
      address: { city: 'Tyler', state: 'TX' },
      specialties: [{ specialty: 'Chronic Sinusitis' }, { specialty: 'Balloon Sinuplasty' }],
      location: 'tyler-tx',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'Florence ENT & Facial Plastic Surgery',
      credentials: '',
      practiceName: 'Florence ENT & Facial Plastic Surgery',
      phone: '(843) 942-1274',
      email: 'info@florenceent.com',
      address: { city: 'Florence', state: 'SC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Facial Plastic Surgery' }],
      location: 'florence-sc',
      featured: true,
      acceptingNewPatients: true,
    },
    {
      name: 'Triangle Sinus Center',
      credentials: '',
      practiceName: 'Triangle Sinus Center',
      phone: '(984) 464-3984',
      email: 'info@trianglesinus.com',
      address: { city: 'Raleigh', state: 'NC' },
      specialties: [{ specialty: 'Sinus Surgery' }, { specialty: 'Balloon Sinuplasty' }],
      location: 'raleigh-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Mountain Ear, Nose & Throat',
      credentials: '',
      practiceName: 'Mountain Ear, Nose & Throat',
      phone: '(828) 633-3090',
      email: 'info@mountainent.com',
      address: { city: 'Spruce Pine', state: 'NC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Allergy Treatment' }],
      location: 'spruce-pine-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Island ENT',
      credentials: '',
      practiceName: 'Island ENT',
      phone: '(941) 205-9444',
      email: 'info@islandent.com',
      address: { city: 'Sarasota', state: 'FL' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sleep Apnea' }],
      location: 'sarasota-fl',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Asheville ENT',
      credentials: '',
      practiceName: 'Asheville Ear, Nose & Throat',
      phone: '(828) 633-3090',
      email: 'info@ashevilleent.com',
      address: { city: 'Asheville', state: 'NC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Chronic Sinusitis' }],
      location: 'asheville-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Charlotte Sinus Center',
      credentials: '',
      practiceName: 'Charlotte Sinus Center',
      phone: '(704) 555-0190',
      email: 'info@charlottesinus.com',
      address: { city: 'Charlotte', state: 'NC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sinus Surgery' }],
      location: 'charlotte-nc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Columbia ENT',
      credentials: '',
      practiceName: 'Columbia Ear, Nose & Throat',
      phone: '(803) 555-0200',
      email: 'info@columbiaent.com',
      address: { city: 'Columbia', state: 'SC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Allergy Treatment' }],
      location: 'columbia-sc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Greenville Sinus Specialists',
      credentials: '',
      practiceName: 'Greenville Sinus Specialists',
      phone: '(864) 555-0210',
      email: 'info@greenvillesinus.com',
      address: { city: 'Greenville', state: 'SC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Chronic Sinusitis' }],
      location: 'greenville-sc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Myrtle Beach ENT',
      credentials: '',
      practiceName: 'Myrtle Beach Ear, Nose & Throat',
      phone: '(843) 555-0220',
      email: 'info@myrtlebeachent.com',
      address: { city: 'Myrtle Beach', state: 'SC' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sinus Surgery' }],
      location: 'myrtle-beach-sc',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Miami Sinus Center',
      credentials: '',
      practiceName: 'Miami Sinus Center',
      phone: '(305) 555-0230',
      email: 'info@miamisinus.com',
      address: { city: 'Miami', state: 'FL' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Facial Plastic Surgery' }],
      location: 'miami-fl',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Fort Lauderdale ENT',
      credentials: '',
      practiceName: 'Fort Lauderdale Ear, Nose & Throat',
      phone: '(954) 555-0240',
      email: 'info@ftlauderdaleent.com',
      address: { city: 'Fort Lauderdale', state: 'FL' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Chronic Sinusitis' }],
      location: 'fort-lauderdale-fl',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Venice Sinus Specialists',
      credentials: '',
      practiceName: 'Venice Sinus Specialists',
      phone: '(941) 555-0250',
      email: 'info@venicesinus.com',
      address: { city: 'Venice', state: 'FL' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Sleep Apnea' }],
      location: 'venice-fl',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Minneapolis Sinus Center',
      credentials: '',
      practiceName: 'Minneapolis Sinus Center',
      phone: '(612) 555-0260',
      email: 'info@minneapolissinus.com',
      address: { city: 'Minneapolis', state: 'MN' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Allergy Treatment' }],
      location: 'minneapolis-mn',
      featured: false,
      acceptingNewPatients: true,
    },
    {
      name: 'Longview Sinus Specialists',
      credentials: '',
      practiceName: 'Longview Sinus Specialists',
      phone: '(903) 555-0270',
      email: 'info@longviewsinus.com',
      address: { city: 'Longview', state: 'TX' },
      specialties: [{ specialty: 'Balloon Sinuplasty' }, { specialty: 'Chronic Sinusitis' }],
      location: 'longview-tx',
      featured: false,
      acceptingNewPatients: true,
    },
  ]

  const createdSpecialists: Record<string, number> = {}
  for (const data of specialistsData) {
    try {
      const s = await payload.create({ collection: 'specialists', data: data as never })
      createdSpecialists[data.name] = s.id as number
      console.log(`  [OK] ${data.name} - ${data.address.city}, ${data.address.state}`)
    } catch (err) {
      console.error(`  [FAIL] ${data.name}: ${(err as Error).message}`)
    }
  }
  console.log()

  // ─── 4. Create FAQs ─────────────────────────────────────────────────
  console.log('Creating FAQs...')
  const faqsData = [
    {
      question: 'What is Sinusitis?',
      answer: makeLexicalContent(
        'Sinusitis is inflammation or swelling of the tissue lining the sinuses. Sinuses are empty spaces within tiny bones between your eyes, cheeks, and over your eyes. They make mucus secretions, which keeps the inside of your nose moist, helping protect against dust, allergens, and pollutants. Healthy sinuses are filled with air. But when they become blocked and filled with fluid, germs can grow and cause an infection.'
      ),
      category: 'general' as const,
      order: 1,
    },
    {
      question: 'What Are the Symptoms of Sinusitis?',
      answer: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          children: [
            makeParagraphNode([makeTextNode('Common symptoms of sinusitis include:', 0)]),
            makeListNode([
              [makeTextNode('Facial pain or pressure', 0)],
              [makeTextNode('Stuffed-up nose', 0)],
              [makeTextNode('Runny nose', 0)],
              [makeTextNode('Loss of smell', 0)],
              [makeTextNode('Cough or congestion', 0)],
              [makeTextNode('Fever', 0)],
              [makeTextNode('Bad breath', 0)],
              [makeTextNode('Fatigue', 0)],
              [makeTextNode('Dental pain', 0)],
            ]),
          ],
          direction: 'ltr',
        },
      },
      category: 'general' as const,
      order: 2,
    },
    {
      question: 'Can Sinusitis Be Treated Effectively?',
      answer: makeLexicalContent(
        'Yes. With a proper diagnosis and precision treatment, you will see a dramatic change in your condition. In some cases the symptoms can be treated with medication. If that doesn\'t work or your sinus infections come back, our physician may recommend a quick 20 minute in-office balloon sinuplasty to dilate your sinus passages. 9 out 10 patients treated with balloon sinuplasty see dramatic long lasting improvements in their condition.'
      ),
      category: 'treatment' as const,
      order: 3,
    },
    {
      question: 'Is balloon sinuplasty covered by insurance?',
      answer: makeLexicalContent(
        'Yes, balloon sinuplasty is FDA-approved and covered by most major insurance plans, including Medicare. Our specialists have a 97% insurance approval rate.'
      ),
      category: 'insurance' as const,
      order: 4,
    },
    {
      question: 'How long is the recovery from balloon sinuplasty?',
      answer: makeLexicalContent(
        'Most patients return to normal activities within 24-48 hours.'
      ),
      category: 'recovery' as const,
      order: 5,
    },
    {
      question: 'Is the balloon sinuplasty procedure painful?',
      answer: makeLexicalContent(
        'Most patients report little to no pain during the procedure. Local anesthesia is used.'
      ),
      category: 'balloon-sinuplasty' as const,
      order: 6,
    },
    {
      question: 'What is the success rate of balloon sinuplasty?',
      answer: makeLexicalContent(
        'Clinical studies show 97% success rate with 95% symptom improvement.'
      ),
      category: 'general' as const,
      order: 7,
    },
    {
      question: 'How can I find a sinus specialist in my area?',
      answer: makeLexicalContent(
        'ExcelENT connects you with board-certified ENT specialists who specialize in balloon sinuplasty.'
      ),
      category: 'general' as const,
      order: 8,
    },
  ]

  const createdFaqs: Record<string, number> = {}
  for (const data of faqsData) {
    try {
      const f = await payload.create({ collection: 'faqs', data: data as never })
      createdFaqs[data.question] = f.id as number
      console.log(`  [OK] ${data.question.substring(0, 50)}`)
    } catch (err) {
      console.error(`  [FAIL] ${data.question.substring(0, 50)}: ${(err as Error).message}`)
    }
  }
  console.log()

  // ─── 5. Create Testimonial ──────────────────────────────────────────
  console.log('Creating testimonial...')
  let testimonialId: number | null = null
  try {
    const t = await payload.create({
      collection: 'testimonials',
      data: {
        name: 'Audrey',
        location: 'Patient',
        type: 'video',
        content: "Learn more about Audrey's journey from debilitating sinusitis to freedom from pain and congestion.",
        videoUrl: 'https://vimeo.com/850210355',
        rating: 5,
        featured: true,
      } as never,
    })
    testimonialId = t.id as number
    console.log('  [OK] Audrey - Video testimonial\n')
  } catch (err) {
    console.error(`  [FAIL] Testimonial: ${(err as Error).message}\n`)
  }

  // ─── 6. Create Landing Pages ────────────────────────────────────────
  console.log('Creating landing pages...')
  const allFaqIds = Object.values(createdFaqs)
  const landingPagesData = [
    {
      slug: 'savannah-ga-sinusitis-specialist',
      locationName: 'Savannah',
      heroHeadline: 'Savannah, Find Relief from Chronic Sinusitis',
      heroSubheadline: 'Our board-certified specialists in Savannah offer balloon sinuplasty - get back to enjoying the coastal life without sinus problems.',
      localPhone: '(912) 597-2878',
      specialists: [createdSpecialists['Coastal Ear, Nose & Throat']],
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['What Are the Symptoms of Sinusitis?'],
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'tyler-tx-sinus-treatment',
      locationName: 'Tyler',
      heroHeadline: 'Hey Tyler, Are You Sick and Tired of Sinus Problems?',
      heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our East Texas specialists are ready to help.',
      localPhone: '(430) 209-5700',
      specialists: [createdSpecialists['East Texas Sinus & Dizziness Center']],
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'florence-sc-sinusitis-specialists',
      locationName: 'Florence',
      heroHeadline: 'Florence, SC - Your Solution for Sinus Relief',
      heroSubheadline: 'Stop suffering from sinus problems. Our Florence specialists offer quick, in-office balloon sinuplasty treatment.',
      localPhone: '(843) 942-1274',
      specialists: [createdSpecialists['Florence ENT & Facial Plastic Surgery']],
      faqs: [
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'raleigh-nc-sinus-treatment',
      locationName: 'Raleigh',
      heroHeadline: 'Hey Raleigh, Are You Sick and Tired of Sinus Problems?',
      heroSubheadline: 'Find lasting relief with balloon sinuplasty - a minimally invasive, in-office procedure that can help you breathe easier. Our Raleigh-area specialists are ready to help.',
      localPhone: '(984) 464-3984',
      specialists: [createdSpecialists['Triangle Sinus Center']],
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'sarasota-fl-sinus-specialists',
      locationName: 'Sarasota',
      heroHeadline: 'Sarasota, FL - Breathe Easy Again',
      heroSubheadline: 'Our Sarasota specialists help you get back to enjoying paradise without sinus problems. Quick, in-office treatment available.',
      localPhone: '(941) 205-9444',
      specialists: [createdSpecialists['Island ENT']],
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is the balloon sinuplasty procedure painful?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    // North Carolina — additional locations
    {
      slug: 'asheville-nc-sinus-specialists',
      locationName: 'Asheville',
      heroHeadline: 'Asheville, NC — Expert Sinus Specialist, Find Relief Today',
      heroSubheadline: 'Our Asheville ENT specialists provide minimally-invasive balloon sinuplasty to help you breathe easier. Quick in-office procedure, fast recovery.',
      localPhone: '(828) 633-3090',
      specialists: [createdSpecialists['Asheville ENT']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'asheville-nc-sinusitis-specialist',
      locationName: 'Asheville',
      heroHeadline: 'Asheville, NC — Sinusitis Specialist',
      heroSubheadline: 'Stop suffering from chronic sinusitis. Our Asheville ENT specialists are ready to help you breathe easier.',
      localPhone: '(828) 633-3090',
      specialists: [createdSpecialists['Asheville ENT']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['What Are the Symptoms of Sinusitis?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'charlotte-nc-sinus-specialist',
      locationName: 'Charlotte',
      heroHeadline: 'Charlotte, NC — Your Sinus Specialist',
      heroSubheadline: 'Finally, relief from chronic sinusitis. Our Charlotte ENT specialists offer quick, in-office balloon sinuplasty treatment.',
      localPhone: '(704) 555-0190',
      specialists: [createdSpecialists['Charlotte Sinus Center']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    // South Carolina — additional locations
    {
      slug: 'columbia-sc-sinus-specialist',
      locationName: 'Columbia',
      heroHeadline: 'Columbia, SC — Your Sinus Specialist',
      heroSubheadline: 'Stop letting sinus problems control your life. Our Columbia ENT specialists offer balloon sinuplasty — a minimally-invasive in-office procedure.',
      localPhone: '(803) 555-0200',
      specialists: [createdSpecialists['Columbia ENT']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'greenville-sc-sinus-specialist',
      locationName: 'Greenville',
      heroHeadline: 'Greenville, SC — Your Sinus Specialist',
      heroSubheadline: 'Our Greenville ENT specialists provide balloon sinuplasty — a quick in-office procedure that helps you breathe easier in 20 minutes.',
      localPhone: '(864) 555-0210',
      specialists: [createdSpecialists['Greenville Sinus Specialists']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'greenville-sinus-specialists',
      locationName: 'Greenville',
      heroHeadline: 'Greenville — Sinus Specialists',
      heroSubheadline: 'Find lasting relief with balloon sinuplasty. Our Greenville specialists are ready to help.',
      localPhone: '(864) 555-0210',
      specialists: [createdSpecialists['Greenville Sinus Specialists']].filter(Boolean),
      faqs: [
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'myrtle-beach-sc-sinus-specialist',
      locationName: 'Myrtle Beach',
      heroHeadline: 'Myrtle Beach, SC — Your Sinus Specialist',
      heroSubheadline: 'Get back to enjoying the coast without sinus problems. Our Myrtle Beach ENT specialists offer balloon sinuplasty.',
      localPhone: '(843) 555-0220',
      specialists: [createdSpecialists['Myrtle Beach ENT']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    // Florida — additional locations
    {
      slug: 'miami-fl-sinus-specialist',
      locationName: 'Miami',
      heroHeadline: 'Miami, FL — Your Sinus Specialist',
      heroSubheadline: 'Stop suffering from chronic sinus problems. Our Miami ENT specialists offer quick, in-office balloon sinuplasty.',
      localPhone: '(305) 555-0230',
      specialists: [createdSpecialists['Miami Sinus Center']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is the balloon sinuplasty procedure painful?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'miami-fl-sinusitis-specialist',
      locationName: 'Miami',
      heroHeadline: 'Miami, FL — Sinusitis Specialist',
      heroSubheadline: 'Finally, relief from chronic sinusitis. Our Miami specialists are ready to help.',
      localPhone: '(305) 555-0230',
      specialists: [createdSpecialists['Miami Sinus Center']].filter(Boolean),
      faqs: [
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'fort-lauderdale-sinus-specialists',
      locationName: 'Fort Lauderdale',
      heroHeadline: 'Fort Lauderdale — Sinus Specialists',
      heroSubheadline: 'Our Fort Lauderdale ENT specialists provide balloon sinuplasty to give you lasting relief from chronic sinusitis.',
      localPhone: '(954) 555-0240',
      specialists: [createdSpecialists['Fort Lauderdale ENT']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'fort-lauderdale-sinusitis-specialists',
      locationName: 'Fort Lauderdale',
      heroHeadline: 'Fort Lauderdale — Sinusitis Specialists',
      heroSubheadline: 'Stop suffering. Our Fort Lauderdale specialists offer minimally-invasive treatment for chronic sinusitis.',
      localPhone: '(954) 555-0240',
      specialists: [createdSpecialists['Fort Lauderdale ENT']].filter(Boolean),
      faqs: [
        createdFaqs['Can Sinusitis Be Treated Effectively?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'venice-sinus-specialists',
      locationName: 'Venice',
      heroHeadline: 'Venice, FL — Sinus Specialists',
      heroSubheadline: 'Get the sinus relief you deserve. Our Venice ENT specialists offer balloon sinuplasty — quick, in-office, lasting relief.',
      localPhone: '(941) 555-0250',
      specialists: [createdSpecialists['Venice Sinus Specialists']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['How long is the recovery from balloon sinuplasty?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    // Other states
    {
      slug: 'minneapolis-sinus-specialists',
      locationName: 'Minneapolis',
      heroHeadline: 'Minneapolis — Sinus Specialists',
      heroSubheadline: 'Cold weather shouldn\'t mean suffering through sinusitis. Our Minneapolis ENT specialists offer balloon sinuplasty for lasting relief.',
      localPhone: '(612) 555-0260',
      specialists: [createdSpecialists['Minneapolis Sinus Center']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['What Are the Symptoms of Sinusitis?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
    {
      slug: 'longview-tx-sinusitis-specialists',
      locationName: 'Longview',
      heroHeadline: 'Longview, TX — Sinusitis Specialists',
      heroSubheadline: 'Stop letting sinus problems hold you back. Our Longview ENT specialists provide minimally-invasive balloon sinuplasty.',
      localPhone: '(903) 555-0270',
      specialists: [createdSpecialists['Longview Sinus Specialists']].filter(Boolean),
      faqs: [
        createdFaqs['What is Sinusitis?'],
        createdFaqs['Is balloon sinuplasty covered by insurance?'],
      ].filter(Boolean),
      testimonial: testimonialId,
      stats: { patientsHelped: '1M+', successRate: '97%', yearsExperience: '15+', specialistsCount: '500+' },
      status: 'published',
    },
  ]

  for (const data of landingPagesData) {
    try {
      await payload.create({ collection: 'landing-pages', data: data as never })
      console.log(`  [OK] ${data.slug}`)
    } catch (err) {
      console.error(`  [FAIL] ${data.slug}: ${(err as Error).message}`)
    }
  }
  console.log()

  // ─── Summary ────────────────────────────────────────────────────────
  console.log('=== Seed Summary ===')
  console.log(`  Articles:     ${wpPosts.length} (from WordPress)`)
  console.log(`  Specialists:  ${Object.keys(createdSpecialists).length}`)
  console.log(`  FAQs:         ${Object.keys(createdFaqs).length}`)
  console.log(`  Testimonials: ${testimonialId ? 1 : 0}`)
  console.log(`  Landing Pages: ${landingPagesData.length}`)
  console.log('\nSeed complete!')

  // Cleanup
  await wpConn.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('\nSeed failed:', err)
  process.exit(1)
})
