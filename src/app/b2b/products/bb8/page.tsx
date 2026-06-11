import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import EyebrowTag from '@/components/b2b/EyebrowTag'
import ArrowRight from '@/components/b2b/ArrowRight'
import InlineDemoCTA from '@/components/b2b/InlineDemoCTA'

export const metadata: Metadata = {
  title: 'BB8 Balloon — One Device, Six Functions | excelENT',
  description:
    'The BB8 Balloon performs the function of six devices in one — light-guided navigation, no-navigation-required flexibility, tactile feedback, malleable tip, suction, and irrigation.',
}

const iconProps = {
  width: 75,
  height: 75,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

const SunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const UnlockIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
)

const LinkIcon = () => (
  <svg {...iconProps}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const HandIcon = () => (
  <svg {...iconProps}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
)

const WandIcon = () => (
  <svg {...iconProps}>
    <path d="M3 21c3-3 6-3 9-6s3-6 6-9" />
    <path d="M9 15l-2 2" />
    <path d="M14 10l-2 2" />
    <path d="M19 5l-2 2" />
  </svg>
)

const DropletIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
)

const functions: Array<{ icon: ReactNode; title: string; description: string }> = [
  {
    icon: <SunIcon />,
    title: 'Light-Guided Navigation',
    description:
      'Visible illumination through the sinus tract for accurate, in-office placement without relying on external imaging.',
  },
  {
    icon: <UnlockIcon />,
    title: 'No Navigation Requirements',
    description:
      'Works without a CT-guided navigation system in the room. Cleaner workflow, fewer dependencies, no scheduling around shared equipment.',
  },
  {
    icon: <LinkIcon />,
    title: 'Navigation Compatible',
    description:
      'When you do want to use CT-guided navigation, BB8 plays cleanly with major nav systems.',
  },
  {
    icon: <HandIcon />,
    title: 'Tactile Feedback',
    description:
      'Real-time haptic feedback during placement — the surgeon feels the anatomy, not just the screen.',
  },
  {
    icon: <WandIcon />,
    title: 'Malleable Tip',
    description:
      'Shapeable to the patient anatomy in the moment, reducing the need for multiple instrument exchanges.',
  },
  {
    icon: <DropletIcon />,
    title: 'Integrated Suction & Irrigation',
    description:
      'Suction and irrigation built into the same device — reduces instrument count, room turnover, and time on case.',
  },
]

const performance: Array<{ value: string; label: string; caption?: string }> = [
  {
    value: '750+',
    label: 'Patients Operated',
    caption: 'Across multiple partner ENT practices and markets.',
  },
  {
    value: '3,000+',
    label: 'Sinuses Addressed',
    caption: 'Average ~4 sinuses per patient procedure.',
  },
  {
    value: '100%',
    label: 'Surgical Success Rate',
    caption: 'Sinus access and dilation achieved in every recorded case.',
  },
  {
    value: '0%',
    label: 'Intra/Post-Op Complication Rate',
    caption: 'No recorded intra-operative or post-operative complications.',
  },
]

const support: Array<{ title: string; description: string }> = [
  {
    title: 'Live Trials in Your Office',
    description:
      'Our sales team performs live trials on-site so you can evaluate BB8 in the actual workflow it would replace.',
  },
  {
    title: 'Anesthesia Protocol Training',
    description:
      'We provide anesthesia tips, ICD-10 coding context, and procedural anatomy training to your team during onboarding.',
  },
  {
    title: 'Pre-Op, Intra-Op, and Post-Op Flow Review',
    description:
      'We walk through the full procedural workflow with your team to identify friction and align on best practice.',
  },
  {
    title: 'Ongoing Provider Training',
    description:
      'New staff onboarding, refresher sessions, and continuing-education touchpoints. Your reps stay engaged after the sale.',
  },
]

export default function BB8Page() {
  return (
    <>
      {/* Hero — text left, product image right */}
      <section
        aria-labelledby="bb8-hero-headline"
        className="border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <EyebrowTag tone="accent">BB8 Balloon</EyebrowTag>
              <h1
                id="bb8-hero-headline"
                className="font-display font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
              >
                One device. Six functions. 100% surgical success.
              </h1>
              <p className="body-lead max-w-2xl text-pretty">
                Built for in-office balloon sinuplasty by ENT surgeons who do
                the procedure themselves. BB8 collapses six tools into one —
                no navigation system required, malleable to the patient&rsquo;s
                anatomy, with integrated suction and irrigation.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <Link href="/b2b/request-demo" className="btn-b2b-primary">
                  Request a Demo
                </Link>
                <Link
                  href="/b2b/products"
                  className="text-sm md:text-base font-semibold text-ink hover:text-[color:var(--color-accent-primary)] transition-colors duration-fast inline-flex items-center gap-2"
                >
                  <ArrowRight className="rotate-180" />
                  All Products
                </Link>
              </div>
            </div>

            <aside aria-label="BB8 device" className="lg:col-span-5">
              <div className="relative w-full aspect-[4/3] flex items-center justify-center bg-surface p-6 md:p-8">
                <Image
                  src="/images/products/bb8.webp"
                  alt="BB8 Balloon device — single-use ENT balloon dilation tool with light-guided navigation, malleable tip, integrated suction and irrigation"
                  fill
                  priority
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain p-4"
                />
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Clinical performance — navy bg, white text */}
      <section
        aria-labelledby="performance-heading"
        className="relative border-b border-edge"
        style={{ background: '#061b42' }}
      >
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px bg-[color:var(--color-accent-primary)]"
        />
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-10 md:mb-12">
            <EyebrowTag tone="inverse">Clinical performance</EyebrowTag>
            <h2
              id="performance-heading"
              className="font-display font-bold tracking-tight leading-tight text-2xl md:text-3xl lg:text-4xl text-white text-balance"
            >
              The metrics behind 750+ procedures.
            </h2>
          </div>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
          >
            {performance.map((p) => (
              <li key={p.label} className="flex flex-col gap-2 text-white">
                <div className="stat-display text-5xl md:text-6xl text-white">
                  {p.value}
                </div>
                <div className="text-sm md:text-base font-semibold text-white leading-snug">
                  {p.label}
                </div>
                {p.caption && (
                  <div className="text-xs md:text-sm text-white leading-snug">
                    {p.caption}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6 functions, 1 device — icons replace 01-06 */}
      <section
        aria-labelledby="functions-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col gap-3 max-w-3xl mb-12 md:mb-16">
            <EyebrowTag tone="accent">6 functions, 1 device</EyebrowTag>
            <h2
              id="functions-heading"
              className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl lg:text-5xl text-ink text-balance"
            >
              Each function pulled from a tool you&rsquo;d otherwise carry separately.
            </h2>
          </div>

          <ul
            role="list"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {functions.map((f) => (
              <li
                key={f.title}
                className="p-6 md:p-8 lg:p-10 flex flex-col gap-4"
              >
                <span className="text-[color:var(--color-accent-primary)] self-center">
                  {f.icon}
                </span>
                <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug text-balance">
                  {f.title}
                </h3>
                <p className="text-sm md:text-base text-ink-secondary leading-relaxed text-pretty">
                  {f.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sales support — purple left borders */}
      <section
        aria-labelledby="support-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4 flex flex-col gap-3">
              <EyebrowTag tone="accent">Sales support</EyebrowTag>
              <h2
                id="support-heading"
                className="font-display font-bold tracking-tight leading-[1.1] text-3xl md:text-4xl text-ink text-balance"
              >
                Our team trains your team.
              </h2>
              <p className="body-lead mt-2">
                We don&rsquo;t just ship a device. Our reps come on-site to
                educate, run live trials, and stay engaged after the sale.
              </p>
            </div>
            <ul
              role="list"
              className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-10"
            >
              {support.map((s) => (
                <li
                  key={s.title}
                  className="flex flex-col gap-3 border-l-4 border-[color:var(--color-accent-primary)] pl-5"
                >
                  <h3 className="font-display font-bold text-lg md:text-xl text-ink leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-sm md:text-base text-ink-secondary leading-relaxed">
                    {s.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <InlineDemoCTA />
    </>
  )
}
