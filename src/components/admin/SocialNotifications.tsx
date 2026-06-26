import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import SocialNotificationsClient from './SocialNotificationsClient'

// Registered as a Payload custom admin view at /admin/social-notifications.
// Wrapped in DefaultTemplate so the admin sidebar nav + chrome stay visible
// (a bare custom view renders without the nav).
export default function SocialNotifications({
  initPageResult,
  params,
  searchParams,
}: AdminViewServerProps) {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      req={initPageResult.req}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <SocialNotificationsClient />
      </Gutter>
    </DefaultTemplate>
  )
}
