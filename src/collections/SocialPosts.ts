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
    {
      name: 'preview',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PostPreview' } },
    },
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
      name: 'graphicStyle',
      type: 'select',
      defaultValue: 'hook',
      admin: { position: 'sidebar', description: 'Which generated graphic to render. The generator suggests one.' },
      options: [
        { label: 'None', value: 'none' },
        { label: 'Hook card', value: 'hook' },
        { label: 'Stat hero', value: 'stat' },
        { label: 'Data-viz', value: 'dataviz' },
      ],
    },
    {
      name: 'graphic',
      type: 'group',
      admin: { description: 'Text rendered onto the graphic. Pre-filled by the generator; edit freely.' },
      fields: [
        { name: 'headline', type: 'text', admin: { description: 'Hook/main line (hook card).' } },
        { name: 'subtext', type: 'text', admin: { description: 'Supporting line (stat hero).' } },
        { name: 'statFrom', type: 'text', admin: { description: 'e.g. "11.8%" — stat/data-viz.' } },
        { name: 'statTo', type: 'text', admin: { description: 'e.g. "2.5%" — stat/data-viz.' } },
        { name: 'statLabel', type: 'text', admin: { description: 'e.g. "ENT Denial Rate".' } },
        { name: 'caption', type: 'text', admin: { description: 'Small footer line (data-viz).' } },
      ],
    },
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
      name: 'revise',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ReviseDraftButton' } },
    },
    {
      name: 'scheduledTime',
      type: 'date',
      admin: {
        description: 'Optional. Empty = publish immediately when you click Publish. Set = the scheduler posts it at this time.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'publish',
      type: 'group',
      admin: { readOnly: true, description: 'Set automatically when the post is sent to LinkedIn.' },
      fields: [
        {
          name: 'state',
          type: 'select',
          defaultValue: 'pending',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Scheduled', value: 'scheduled' },
            { label: 'Publishing', value: 'publishing' },
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
        },
        { name: 'postUrn', type: 'text' },
        { name: 'sentAt', type: 'date' },
        { name: 'error', type: 'textarea' },
        { name: 'attempts', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'publishToLinkedIn',
      type: 'ui',
      admin: { components: { Field: '/components/admin/PublishToLinkedInButton' } },
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
