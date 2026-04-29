import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next`, `/_vercel`, `/admin`, `/media`, `/b2b`
    // - … if they contain a dot (e.g., `favicon.ico`)
    // `/b2b` excluded so the new B2B route group serves without locale rewriting.
    // When hostname middleware lands, this exclusion can be removed.
    '/((?!api|_next|_vercel|admin|media|b2b|.*\\..*).*)',
  ],
}
