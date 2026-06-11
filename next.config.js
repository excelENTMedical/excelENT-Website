import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      // WordPress legacy URLs → new patient-site equivalents.
      // Permanent (308) so SEO juice carries over at WP cutover.
      { source: '/about-excelent', destination: '/about', permanent: true },
      { source: '/about-excelent/', destination: '/about', permanent: true },
      { source: '/our-team', destination: '/about', permanent: true },
      { source: '/our-team/', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/find-a-specialist', permanent: true },
      { source: '/contact-us/', destination: '/find-a-specialist', permanent: true },
      { source: '/sinus-conditions', destination: '/sinusitis', permanent: true },
      { source: '/sinus-conditions/', destination: '/sinusitis', permanent: true },
      { source: '/what-is-sinusitis', destination: '/sinusitis/what-is-sinusitis', permanent: true },
      { source: '/what-is-sinusitis/', destination: '/sinusitis/what-is-sinusitis', permanent: true },
      { source: '/sinusitis-symptoms', destination: '/sinusitis/symptoms', permanent: true },
      { source: '/sinusitis-symptoms/', destination: '/sinusitis/symptoms', permanent: true },
      { source: '/sinusitis-management-and-treatment', destination: '/sinusitis/treatment', permanent: true },
      { source: '/sinusitis-management-and-treatment/', destination: '/sinusitis/treatment', permanent: true },
      { source: '/sinusitis/management-and-treatment', destination: '/sinusitis/treatment', permanent: true },
      { source: '/sinusitis/management-and-treatment/', destination: '/sinusitis/treatment', permanent: true },
      { source: '/sinus-and-nasal-procedures', destination: '/sinusitis/treatment', permanent: true },
      { source: '/sinus-and-nasal-procedures/', destination: '/sinusitis/treatment', permanent: true },
      { source: '/balloon-sinuplasty-faqs', destination: '/sinusitis/faqs', permanent: true },
      { source: '/balloon-sinuplasty-faqs/', destination: '/sinusitis/faqs', permanent: true },
      { source: '/balloon-sinus-dilation-bsd', destination: '/balloon-sinuplasty', permanent: true },
      { source: '/balloon-sinus-dilation-bsd/', destination: '/balloon-sinuplasty', permanent: true },
      { source: '/local-sinus-specialists', destination: '/find-a-specialist', permanent: true },
      { source: '/local-sinus-specialists/', destination: '/find-a-specialist', permanent: true },
      { source: '/sinus-relief-resources', destination: '/resources', permanent: true },
      { source: '/sinus-relief-resources/', destination: '/resources', permanent: true },
      { source: '/blog', destination: '/resources', permanent: true },
      { source: '/blog/', destination: '/resources', permanent: true },
      { source: '/privacy-policy', destination: '/privacy', permanent: true },
      { source: '/privacy-policy/', destination: '/privacy', permanent: true },
      { source: '/terms-and-conditions', destination: '/terms', permanent: true },
      { source: '/terms-and-conditions/', destination: '/terms', permanent: true },
      { source: '/cookie-policy', destination: '/cookies', permanent: true },
      { source: '/cookie-policy/', destination: '/cookies', permanent: true },
    ]
  },
}

export default withPayload(withNextIntl(nextConfig))
