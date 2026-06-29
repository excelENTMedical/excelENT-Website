import type { CollectionConfig } from 'payload'

export const BrandProfiles: CollectionConfig = {
  slug: 'brand-profiles',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'active'],
    description: 'One editable "agent" per product: voice, audience, themes, CTAs, and guardrails.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, admin: { description: 'e.g. "PS | RCM"' } },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Lowercase id, e.g. "ps-rcm". Used by the generator.' },
    },
    { name: 'active', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identity',
          fields: [
            {
              name: 'voice',
              type: 'textarea',
              required: true,
              admin: { description: 'Voice and tone guidance the writer must follow.' },
            },
            { name: 'audience', type: 'textarea', admin: { description: 'Who these posts are for.' } },
            {
              name: 'reviewers',
              type: 'array',
              labels: { singular: 'Reviewer', plural: 'Reviewers' },
              admin: {
                description: "Email(s) notified to review/approve this brand's posts.",
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [{ name: 'email', type: 'email', required: true }],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'themes',
              type: 'array',
              labels: { singular: 'Theme', plural: 'Themes' },
              admin: {
                description: 'Content pillars the generator can write about.',
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [
                { name: 'theme', type: 'text', required: true },
                { name: 'description', type: 'textarea' },
              ],
            },
            {
              name: 'defaultCtas',
              type: 'array',
              labels: { singular: 'CTA', plural: 'CTAs' },
              admin: { components: { RowLabel: '/components/admin/ArrayRowLabel' } },
              fields: [{ name: 'cta', type: 'text', required: true }],
            },
            {
              name: 'seedExamples',
              type: 'array',
              labels: { singular: 'Seed example', plural: 'Seed examples' },
              admin: {
                description: 'A few example posts that anchor the brand style.',
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
            {
              name: 'seedImages',
              type: 'relationship',
              relationTo: 'social-assets',
              hasMany: true,
              admin: {
                description:
                  `Example images that define this brand's visual style. Used as references when generating new post images, and selectable as a post's image. Use "Create New" in the picker to upload.`,
              },
            },
            {
              name: 'imageStyleGuidance',
              type: 'textarea',
              admin: {
                description:
                  'Optional. Free-text visual direction for generated images (e.g. "clean clinical, generous whitespace, navy/purple accents, no stock-photo people").',
              },
            },
            {
              name: 'generate',
              type: 'ui',
              admin: {
                components: {
                  Field: '/components/admin/GenerateDraftsButton',
                },
              },
            },
          ],
        },
        {
          label: 'Schedule',
          fields: [
            {
              name: 'platforms',
              type: 'select',
              hasMany: true,
              defaultValue: ['linkedin'],
              options: [
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
              ],
            },
            {
              name: 'cadence',
              type: 'text',
              admin: { description: 'Free text for now, e.g. "3 posts/week". Guidance only in Phase A.' },
            },
            {
              name: 'postingSlots',
              type: 'array',
              labels: { singular: 'Posting slot', plural: 'Posting slots' },
              admin: {
                description: 'Machine-readable cadence. Each row = one recurring weekly slot the planner fills. (Supersedes the free-text "cadence" field above.)',
                components: { RowLabel: '/components/admin/PostingSlotRowLabel' },
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  defaultValue: 'linkedin',
                  options: [
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'Facebook', value: 'facebook' },
                    { label: 'Instagram', value: 'instagram' },
                  ],
                },
                {
                  name: 'dayOfWeek',
                  type: 'select',
                  required: true,
                  admin: { description: 'Day of week (Eastern Time).' },
                  options: [
                    { label: 'Sunday', value: '0' },
                    { label: 'Monday', value: '1' },
                    { label: 'Tuesday', value: '2' },
                    { label: 'Wednesday', value: '3' },
                    { label: 'Thursday', value: '4' },
                    { label: 'Friday', value: '5' },
                    { label: 'Saturday', value: '6' },
                  ],
                },
                { name: 'time', type: 'text', required: true, defaultValue: '09:00', admin: { description: 'Time of day in ET, 24h "HH:mm" (e.g. 09:00, 14:30).' } },
              ],
            },
          ],
        },
        {
          label: 'Guardrails',
          fields: [
            {
              name: 'bannedTerms',
              type: 'array',
              labels: { singular: 'Banned term', plural: 'Banned terms' },
              admin: {
                description: 'Words/phrases that must never appear. Compliance guardrail.',
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [{ name: 'term', type: 'text', required: true }],
            },
            {
              name: 'requiredDisclaimers',
              type: 'array',
              labels: { singular: 'Required disclaimer', plural: 'Required disclaimers' },
              admin: {
                description: 'Text that must appear verbatim in every post.',
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [{ name: 'text', type: 'textarea', required: true }],
            },
          ],
        },
      ],
    },
  ],
}
