import type { CollectionConfig } from 'payload'

export const SocialPosts: CollectionConfig = {
  slug: 'social-posts',
  versions: { drafts: false, maxPerDoc: 20 }, // keep edit history without a separate publish flow
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'brand', 'platform', 'status', 'updatedAt'],
    description: 'AI-drafted posts. Review, edit, approve/reject here — your feedback trains the next batch.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Short label; auto-filled by the generator, editable.' } },
    { name: 'brand', type: 'relationship', relationTo: 'brand-profiles', required: true },
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
      name: 'language',
      type: 'select',
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Spanish', value: 'es' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'theme', type: 'text' },
    { name: 'copy', type: 'textarea', required: true, admin: { description: 'The post text. Edit freely before approving.' } },
    { name: 'cta', type: 'text' },
    { name: 'asset', type: 'relationship', relationTo: 'social-assets' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: { position: 'sidebar', description: 'Set to Approved when ready, or leave feedback and set Needs changes / Rejected.' },
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Needs changes', value: 'needs-changes' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'reviewerFeedback',
      type: 'textarea',
      admin: { description: 'Why it needs changes or was rejected. This text trains the next generation.' },
    },
    {
      name: 'generationMeta',
      type: 'group',
      admin: { description: 'Provenance — read only.' },
      fields: [
        { name: 'model', type: 'text', admin: { readOnly: true } },
        { name: 'promptVersion', type: 'text', admin: { readOnly: true } },
        { name: 'originalCopy', type: 'textarea', admin: { readOnly: true, description: 'Copy as generated, before edits.' } },
        { name: 'guardrailFlags', type: 'textarea', admin: { readOnly: true, description: 'Non-empty means a banned term or missing disclaimer — review before approving.' } },
      ],
    },
  ],
}
