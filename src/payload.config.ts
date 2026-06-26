import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import { sesAdapter } from './lib/sesEmailAdapter'

// Collections
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Articles } from './collections/Articles'
import { Specialists } from './collections/Specialists'
import { FAQs } from './collections/FAQs'
import { Testimonials } from './collections/Testimonials'
import { LandingPages } from './collections/LandingPages'
import { DemoRequests } from './collections/DemoRequests'
import { BrandProfiles } from './collections/BrandProfiles'
import { SocialAssets } from './collections/SocialAssets'
import { SocialPosts } from './collections/SocialPosts'
import { SocialCampaigns } from './collections/SocialCampaigns'

// Globals
import { LinkedInConnection } from './collections/globals/LinkedInConnection'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const emailFromAddress = process.env.EMAIL_FROM_ADDRESS || 'noreply@excelentmedical.com'
const emailFromName = process.env.EMAIL_FROM_NAME || 'excelENT Medical'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        socialCalendar: {
          Component: '/components/admin/SocialCalendar',
          path: '/social-calendar',
        },
        socialNotifications: {
          Component: '/components/admin/SocialNotifications',
          path: '/social-notifications',
        },
      },
    },
  },
  email: sesAdapter({
    defaultFromAddress: emailFromAddress,
    defaultFromName: emailFromName,
    region: process.env.AWS_REGION || 'us-east-1',
  }),
  collections: [
    Users,
    Media,
    Pages,
    Articles,
    Specialists,
    FAQs,
    Testimonials,
    LandingPages,
    DemoRequests,
    BrandProfiles,
    SocialAssets,
    SocialPosts,
    SocialCampaigns,
  ],
  globals: [LinkedInConnection],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    push: true,
  }),
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Spanish',
        code: 'es',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
})
