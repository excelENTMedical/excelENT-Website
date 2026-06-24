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
      name: 'reviewers',
      type: 'array',
      labels: { singular: 'Reviewer', plural: 'Reviewers' },
      admin: { description: "Email(s) notified to review/approve this brand's posts." },
      fields: [{ name: 'email', type: 'email', required: true }],
    },
    {
      name: 'voice',
      type: 'textarea',
      required: true,
      admin: { description: 'Voice and tone guidance the writer must follow.' },
    },
    { name: 'audience', type: 'textarea', admin: { description: 'Who these posts are for.' } },
    {
      name: 'themes',
      type: 'array',
      labels: { singular: 'Theme', plural: 'Themes' },
      admin: { description: 'Content pillars the generator can write about.' },
      fields: [
        { name: 'theme', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
    {
      name: 'defaultCtas',
      type: 'array',
      labels: { singular: 'CTA', plural: 'CTAs' },
      fields: [{ name: 'cta', type: 'text', required: true }],
    },
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
      name: 'bannedTerms',
      type: 'array',
      labels: { singular: 'Banned term', plural: 'Banned terms' },
      admin: { description: 'Words/phrases that must never appear. Compliance guardrail.' },
      fields: [{ name: 'term', type: 'text', required: true }],
    },
    {
      name: 'requiredDisclaimers',
      type: 'array',
      labels: { singular: 'Required disclaimer', plural: 'Required disclaimers' },
      admin: { description: 'Text that must appear verbatim in every post.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
    },
    {
      name: 'seedExamples',
      type: 'array',
      labels: { singular: 'Seed example', plural: 'Seed examples' },
      admin: { description: 'A few example posts that anchor the brand style.' },
      fields: [{ name: 'text', type: 'textarea', required: true }],
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
}
