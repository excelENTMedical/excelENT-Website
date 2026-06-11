export const title = 'HIPAA Notice of Privacy Practices'

export const lastUpdated = '2026-04-30'

export type LegalBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }

export const blocks: LegalBlock[] = [
  {
    type: 'p',
    text: 'This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.',
  },
  { type: 'h2', text: 'Our commitment to your privacy' },
  {
    type: 'p',
    text: 'ExcelENT, Inc. ("ExcelENT," "we," "us," or "our") is a referral network that connects patients with independent partner ENT practices. Once you book an appointment, your care is provided by the partner practice, which is responsible for your protected health information ("PHI") under the Health Insurance Portability and Accountability Act ("HIPAA"). This notice explains the information ExcelENT itself may handle when you use this website to find a specialist or schedule an appointment, and how we protect it.',
  },
  { type: 'h2', text: 'Information ExcelENT collects' },
  {
    type: 'p',
    text: 'When you use our scheduling tools, we may collect information that can identify you, including:',
  },
  {
    type: 'ul',
    items: [
      'Your name, email address, and phone number',
      'Your zip code or city for matching you with the closest partner practice',
      'A general description of your symptoms or reason for visit, if you choose to provide one',
      'Appointment date, time, and the partner practice you booked with',
    ],
  },
  {
    type: 'p',
    text: 'We do not collect detailed clinical records. Once you arrive at a partner practice for care, that practice — not ExcelENT — collects and maintains your medical record under its own HIPAA privacy practices.',
  },
  { type: 'h2', text: 'How we use your information' },
  {
    type: 'p',
    text: 'ExcelENT uses the information you provide to:',
  },
  {
    type: 'ul',
    items: [
      'Match you with the partner practice closest to you and route your appointment request',
      'Send appointment confirmations, reminders, and updates by SMS or email',
      'Respond to questions you send through this website',
      'Improve the scheduling experience and the educational content we provide',
      'Comply with applicable laws and regulations',
    ],
  },
  { type: 'h2', text: 'How we share your information' },
  {
    type: 'p',
    text: 'We share the information you submit through our scheduling tools only as needed to fulfill your request:',
  },
  {
    type: 'ul',
    items: [
      'With the partner practice you select, so they can contact you and prepare for your visit',
      'With service providers we use to operate our website, scheduling system, and SMS/email delivery — bound by contract to keep your information confidential',
      'When required by law, court order, or to protect the safety of any person',
    ],
  },
  {
    type: 'p',
    text: 'We do not sell your personal information. We do not share information you provide in our scheduling tools with advertisers.',
  },
  { type: 'h2', text: 'Your rights' },
  {
    type: 'p',
    text: 'You have the right to:',
  },
  {
    type: 'ul',
    items: [
      'Ask us what information we have collected about you and request a copy',
      'Ask us to correct inaccurate information',
      'Ask us to delete information we have collected through this website',
      'Opt out of marketing emails or SMS at any time',
      'Receive a copy of the partner practice’s own HIPAA Notice of Privacy Practices when you arrive for care',
    ],
  },
  {
    type: 'p',
    text: 'For information stored in your medical record by a partner practice, please contact that practice directly. They are the legally designated custodian of your medical record under HIPAA.',
  },
  { type: 'h2', text: 'How we protect your information' },
  {
    type: 'p',
    text: 'ExcelENT uses industry-standard administrative, technical, and physical safeguards to protect the information you submit through this website. Our scheduling system encrypts data in transit and at rest. Access is limited to staff who need it to operate the service.',
  },
  { type: 'h2', text: 'Changes to this notice' },
  {
    type: 'p',
    text: 'We may update this notice from time to time. The "last updated" date at the top of this page reflects the most recent revision. Material changes will be communicated through the site.',
  },
  { type: 'h2', text: 'Contact us' },
  {
    type: 'p',
    text: 'If you have questions about this notice or want to exercise any of the rights described above, contact us at privacy@excelentmedical.com or write to ExcelENT, Inc., 68 T.W. Alexander Drive, PO Box 13628, Research Triangle Park, Durham, NC 27709.',
  },
]
