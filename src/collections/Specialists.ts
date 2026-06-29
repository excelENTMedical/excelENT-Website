import type { CollectionConfig } from 'payload'

export const Specialists: CollectionConfig = {
  slug: 'specialists',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'practiceName', 'location', 'phone'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'credentials',
      type: 'text',
      admin: {
        description: 'e.g., MD, FACS',
      },
    },
    {
      name: 'practiceName',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              name: 'specialties',
              type: 'array',
              admin: {
                components: { RowLabel: '/components/admin/ArrayRowLabel' },
              },
              fields: [
                {
                  name: 'specialty',
                  type: 'text',
                },
              ],
            },
            {
              name: 'bio',
              type: 'richText',
              localized: true,
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'phone',
              type: 'text',
              required: true,
            },
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'address',
              type: 'group',
              fields: [
                {
                  name: 'street',
                  type: 'text',
                },
                {
                  name: 'city',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'state',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'zip',
                  type: 'text',
                },
              ],
            },
            {
              name: 'website',
              type: 'text',
            },
            {
              name: 'location',
              type: 'text',
              admin: {
                description: 'Location identifier for filtering (e.g., raleigh-nc, savannah-ga)',
                position: 'sidebar',
              },
            },
          ],
        },
        {
          label: 'Settings',
          fields: [
            {
              name: 'hubspotFormId',
              type: 'text',
              admin: {
                description: 'HubSpot form ID for contact form',
                position: 'sidebar',
              },
            },
            {
              name: 'acceptingNewPatients',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description: 'Show on homepage',
              },
            },
          ],
        },
      ],
    },
  ],
}
