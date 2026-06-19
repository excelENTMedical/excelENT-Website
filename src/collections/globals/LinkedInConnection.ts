import type { GlobalConfig } from 'payload'

export const LinkedInConnection: GlobalConfig = {
  slug: 'linkedin-connection',
  label: 'LinkedIn Connection',
  admin: { group: 'Social', description: 'Connect the ExcelENT LinkedIn Company Page for publishing.' },
  access: {
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'connect',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ConnectLinkedInButton' } },
    },
    { name: 'orgUrn', type: 'text', admin: { readOnly: true, description: 'Connected organization URN.' } },
    { name: 'accessToken', type: 'text', admin: { hidden: true } },
    { name: 'refreshToken', type: 'text', admin: { hidden: true } },
    { name: 'accessExpiresAt', type: 'date', admin: { readOnly: true } },
    { name: 'refreshExpiresAt', type: 'date', admin: { readOnly: true } },
    { name: 'connectedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'connectedAt', type: 'date', admin: { readOnly: true } },
  ],
}
