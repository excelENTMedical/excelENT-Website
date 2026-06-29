import type { CollectionConfig } from 'payload'

export const SocialCampaigns: CollectionConfig = {
  slug: 'social-campaigns',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'startDate', 'endDate', 'priority'],
    description: 'Time-boxed campaigns. While active, the planner draws themes from here instead of the brand pool.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'brand', type: 'relationship', relationTo: 'brand-profiles', required: true },
    { name: 'startDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'endDate', type: 'date', required: true, admin: { date: { pickerAppearance: 'dayOnly' } } },
    {
      name: 'platforms',
      type: 'select',
      hasMany: true,
      admin: { description: 'Empty = applies to all of the brand\'s platforms.' },
      options: [
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Facebook', value: 'facebook' },
        { label: 'Instagram', value: 'instagram' },
      ],
    },
    { name: 'priority', type: 'number', defaultValue: 0, admin: { description: 'Higher wins when campaign windows overlap.' } },
    {
      name: 'themes',
      type: 'array',
      labels: { singular: 'Theme', plural: 'Themes' },
      admin: { components: { RowLabel: '/components/admin/ArrayRowLabel' } },
      fields: [
        { name: 'theme', type: 'text', required: true },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
}
