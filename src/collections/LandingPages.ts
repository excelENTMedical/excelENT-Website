import type { CollectionConfig } from 'payload'

export const LandingPages: CollectionConfig = {
  slug: 'landing-pages',
  admin: {
    useAsTitle: 'locationName',
    defaultColumns: ['locationName', 'slug', 'status'],
    description: 'Location-specific ad landing pages',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
        description: 'URL path (e.g., raleigh-nc-sinus-treatment)',
      },
    },
    {
      name: 'locationName',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'City name for display (e.g., Raleigh)',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroHeadline',
              type: 'text',
              required: true,
              localized: true,
              admin: {
                description: 'Main headline with {location} placeholder',
              },
            },
            {
              name: 'heroSubheadline',
              type: 'textarea',
              localized: true,
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'localPhone',
              type: 'text',
              required: true,
              admin: {
                description: 'Local phone number to display',
              },
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'specialists',
              type: 'relationship',
              relationTo: 'specialists',
              hasMany: true,
              required: true,
              admin: {
                description: 'Specialists to show on this landing page',
              },
            },
            {
              name: 'faqs',
              type: 'relationship',
              relationTo: 'faqs',
              hasMany: true,
              admin: {
                description: 'FAQs to display on this page',
              },
            },
            {
              name: 'testimonial',
              type: 'relationship',
              relationTo: 'testimonials',
              admin: {
                description: 'Featured testimonial for this page',
              },
            },
            {
              name: 'stats',
              type: 'group',
              fields: [
                {
                  name: 'patientsHelped',
                  type: 'text',
                  defaultValue: '1M+',
                },
                {
                  name: 'successRate',
                  type: 'text',
                  defaultValue: '97%',
                },
                {
                  name: 'yearsExperience',
                  type: 'text',
                  defaultValue: '15+',
                },
                {
                  name: 'specialistsCount',
                  type: 'text',
                  defaultValue: '500+',
                },
              ],
            },
            {
              name: 'threeSteps',
              type: 'group',
              admin: {
                description: 'Connect, Treat, Breathe section',
              },
              fields: [
                {
                  name: 'step1Title',
                  type: 'text',
                  defaultValue: 'Connect',
                  localized: true,
                },
                {
                  name: 'step1Description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'step2Title',
                  type: 'text',
                  defaultValue: 'Treat',
                  localized: true,
                },
                {
                  name: 'step2Description',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'step3Title',
                  type: 'text',
                  defaultValue: 'Breathe',
                  localized: true,
                },
                {
                  name: 'step3Description',
                  type: 'textarea',
                  localized: true,
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              fields: [
                {
                  name: 'metaTitle',
                  type: 'text',
                  localized: true,
                },
                {
                  name: 'metaDescription',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Tracking',
          fields: [
            {
              name: 'tracking',
              type: 'group',
              admin: {
                description: 'Analytics and tracking IDs',
              },
              fields: [
                {
                  name: 'googleAnalyticsId',
                  type: 'text',
                },
                {
                  name: 'facebookPixelId',
                  type: 'text',
                },
                {
                  name: 'excelVoiceId',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
