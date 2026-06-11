export type ArticleBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export interface Article {
  slug: string
  title: string
  excerpt: string
  category: 'sinus-health' | 'treatment-options' | 'patient-stories' | 'news'
  author: string
  publishedDate: string
  readingTimeMinutes: number
  featuredImage: string
  blocks: ArticleBlock[]
}
