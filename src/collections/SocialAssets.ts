import type { CollectionConfig } from 'payload'
import path from 'path'

export const SocialAssets: CollectionConfig = {
  slug: 'social-assets',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'brand', 'source'],
    description: 'Approved images for social posts, tagged by brand and theme.',
    group: 'Social',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    // Absolute path under the project's public dir. A bare relative path like
    // '../public/...' resolves against process.cwd() (the project root in prod),
    // landing at /opt/bitnami/public — which doesn't exist and isn't writable,
    // so uploads failed with EACCES. MUST stay in sync with DEFAULT_BASE in
    // src/lib/social/image/refs.ts (same process.cwd()+public/social-assets base).
    staticDir: path.join(process.cwd(), 'public', 'social-assets'),
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 400, position: 'centre' },
      { name: 'preview', width: 1200, height: 1200, position: 'centre' },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true, admin: { description: 'Accessibility text / internal label.' } },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brand-profiles',
      admin: { description: 'Leave empty to make the asset usable by any brand.' },
    },
    {
      name: 'tags',
      type: 'array',
      labels: { singular: 'Tag', plural: 'Tags' },
      admin: {
        description: 'Theme tags the generator matches against (e.g. "Denials").',
        components: { RowLabel: '/components/admin/ArrayRowLabel' },
      },
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'uploaded',
      admin: { position: 'sidebar', description: 'AI-generated is a future source; everything is uploaded in Phase A.' },
      options: [
        { label: 'Uploaded', value: 'uploaded' },
        { label: 'AI-generated', value: 'ai-generated' },
      ],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
