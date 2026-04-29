import type { Metadata } from 'next'
import Link from 'next/link'
import PageHero from '@/components/b2b/PageHero'

export const metadata: Metadata = {
  title: 'Privacy Policy — excelENT Medical',
  description:
    'How ExcelENT, Inc. collects, uses, and discloses information through the excelentmedical.com marketing site and Practice Solutions platform.',
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        variant="compact"
        eyebrow="Privacy"
        title="Privacy Policy"
        description="How ExcelENT, Inc. collects, uses, and discloses information collected through this site and our services."
      />

      <section className="bg-surface border-b border-edge">
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <p>
              <strong>ExcelENT, Inc</strong> respects your privacy and wants you
              to be familiar with how we collect, use, and disclose information.
              This Privacy Policy describes our practices in connection with
              information that we or our service providers collect through the
              website or application (hereinafter the &ldquo;Service&rdquo;)
              operated and controlled by us from which you are accessing this
              Privacy Policy.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Use by Minors
            </h2>
            <p>
              The Service is not directed to individuals under the age of 18,
              and we request that these individuals not provide personal
              information through the Service.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Information Collection
            </h2>
            <p>
              We may ask you to submit personal information in order for you to
              benefit from certain features or to participate in a particular
              activity. We may combine the information you submit with other
              information we have collected from you, whether on or offline,
              including your purchase history and information from other sources
              such as ExcelENT Affiliates, publicly available information
              sources, and other third-party information providers.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Sensitive Information
            </h2>
            <p>
              We ask that you not send us, and you not disclose, any sensitive
              personal information (e.g., Social Security numbers, information
              related to racial or ethnic origin, political opinions, religion
              or philosophical beliefs, health or medical condition, or
              biometric or genetic data for the purpose of uniquely identifying
              an individual).
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Automatic Information Collection and Use
            </h2>
            <p>
              We and our service providers may automatically collect and use
              information in the following ways as you navigate around the
              Service:
            </p>
            <p>
              <strong>Through your browser:</strong> Certain information is
              collected by most browsers, such as your Media Access Control
              (MAC) address, computer type, screen resolution, operating system
              name and version, and Internet browser type and version.
            </p>
            <p>
              <strong>Using cookies:</strong> Cookies are pieces of information
              stored directly on the computer you are using. Cookies allow us
              to collect information such as browser type, time spent on the
              Service, pages visited, and language preferences.
            </p>
            <p>
              <strong>
                Using pixel tags, web beacons, clear GIFs, or other similar
                technologies:
              </strong>{' '}
              These may be used in connection with some Service pages and HTML
              formatted email messages to track the actions of users and email
              recipients, measure the success of our marketing campaigns, and
              compile statistics about Service usage.
            </p>
            <p>
              <strong>Device Information:</strong> We may collect information
              about your mobile device, such as a unique device identifier.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              How We Use and Disclose Information
            </h2>
            <p>
              We use and disclose information you provide to us as described to
              you at the point of collection. Where required by applicable law,
              we will obtain your consent to our use of your personal
              information at the point of information collection.
            </p>
            <p>
              <strong>
                Providing the functionality of the Service and fulfilling your
                requests:
              </strong>
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                To provide the functionality of the Service to you and providing
                you with related customer service
              </li>
              <li>To respond to your inquiries and fulfill your requests</li>
              <li>
                To send you important information regarding our relationship
                with you or regarding the Service, changes to our terms,
                conditions, and policies and/or other administrative information
              </li>
            </ul>
            <p>
              <strong>Accomplishing our business purposes:</strong>
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>For data analysis, to improve the efficiency of the Service</li>
              <li>
                For audits, to verify that our internal processes function as
                intended and are compliant with legal, regulatory, or
                contractual requirements
              </li>
              <li>For fraud and security monitoring purposes</li>
              <li>For developing new products and services</li>
              <li>
                For enhancing, improving or modifying our website or products
                and services
              </li>
              <li>For identifying Service usage trends</li>
              <li>For determining the effectiveness of our promotional campaigns</li>
            </ul>
            <p>
              <strong>
                Analysis of Personal Information to provide personalized
                services:
              </strong>
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                To better understand you so that we can personalize our
                interactions with you
              </li>
              <li>
                To better understand your preferences so that we can deliver
                content via the Service that we believe will be relevant and
                interesting to you
              </li>
            </ul>
            <p>We also disclose information collected through the Service:</p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                To our third-party partners with whom we offer a co-branded or
                co-marketed promotion
              </li>
              <li>
                To our third-party service providers who provide services such
                as website hosting, mobile application hosting, data analysis,
                payment processing, order fulfillment, infrastructure provision,
                IT services, customer service, email and direct mail delivery
                services, auditing, and other services
              </li>
              <li>
                As permitted by applicable law, to a third party in the event of
                any reorganization, merger, sale, joint venture, assignment,
                transfer, or other disposition of all or any portion of our
                business, assets, or stock
              </li>
            </ul>
            <p>
              In addition, we may use and disclose your information as we
              believe to be necessary or appropriate: (a) to comply with legal
              process or applicable law; (b) to respond to requests from public
              and government authorities; (c) to enforce our terms and
              conditions; and (d) to protect our rights, privacy, safety, or
              property.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Choices and Access
            </h2>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              Your choices regarding our use and disclosure of your personal
              information
            </h3>
            <p>
              We give you choices regarding our use and disclosure of your
              personal information for marketing purposes. You may opt-out from:
            </p>
            <p>
              <strong>Receiving marketing communications from us:</strong> If
              you no longer want to receive marketing communications from us on
              a going forward basis, you may opt-out of receiving them by
              contacting us via 919-314-2891. You may also opt-out of receiving
              marketing communications from us by visiting the Service to
              update your online profile. In addition, you may opt-out of
              receiving marketing emails from us by following the unsubscribe
              instructions provided in any such message.
            </p>
            <p>
              <strong>Receiving reminders from us:</strong> If you no longer
              want to receive medical reminders from us on a going forward
              basis, you may opt-out of receiving them by contacting us via
              919-314-2891.
            </p>
            <p>
              <strong>
                Our sharing of your personal information with affiliates and
                third party partners:
              </strong>{' '}
              If you previously opted-in to receiving marketing communications
              from our affiliates or third party partners, you may opt-out of
              our sharing of your personal information with those parties for
              their direct marketing purposes on a going forward basis by
              contacting us via 919-314-2891.
            </p>
            <p>
              We will seek to comply with your request(s) as soon as reasonably
              practicable. Please note that if you opt-out as described above,
              we may not be able to directly remove your personal information
              from the databases of our affiliates with which we have already
              shared your information. However, we will make reasonable efforts
              to inform our affiliates of your request. Please also note that
              if you opt-out of receiving marketing related messages from us,
              we may still send you important transactional and administrative
              messages from which you cannot opt-out.
            </p>
            <h3 className="font-display font-semibold text-lg text-ink mt-2">
              How you can access, change, or delete your personal information
            </h3>
            <p>
              If you would like to review, correct, update, restrict, or delete
              your personal information, or if you would like to request an
              electronic copy of your personal information for purposes of
              transmitting it to another company (to the extent these rights
              are provided to you by applicable law), please contact us at
              919-314-2891. We will respond to your request as soon as
              reasonably practicable and no later than one month after receipt.
              If circumstances cause any delay in our response, you will be
              promptly notified and provided a date for our response. You may
              also visit the Service to update your online profile.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Cross Border Transfer
            </h2>
            <p>
              Your personal information may be stored and processed in any
              country where we have facilities or service providers, and by
              using our Service or by providing consent to us (where required
              by law), your information may be transferred to countries outside
              of your country of residence, including to the United States,
              which may provide for different data protection rules than in
              your country of residence. Nonetheless, appropriate contractual
              and other measures are in place to protect personal information
              when it is transferred to our affiliates or third parties in
              other countries.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Security
            </h2>
            <p>
              We seek to use reasonable organizational, technical, and
              administrative measures designed to protect personal information
              under our control. However, no data transmission over the
              Internet or data storage system can be guaranteed to be 100%
              secure. If you have reason to believe that your interaction with
              us is no longer secure (for example, if you feel that the
              security of any account you have with us has been compromised),
              please immediately notify us in accordance with the
              &ldquo;Contacting Us&rdquo; section below.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Retention Period
            </h2>
            <p>
              We will retain your personal information for as long as needed or
              permitted in light of the purpose(s) for which it was obtained.
              The criteria used to determine our retention periods include: (i)
              the length of time we have an ongoing relationship with you and
              provide the Service to you; (ii) whether there is a legal
              obligation to which we are subject; and (iii) whether retention
              is advisable in light of our legal position (such as in regard to
              applicable statutes of limitations, litigation, or regulatory
              investigations).
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Third Party Sites and Services
            </h2>
            <p>
              This Service may contain links to sites of third parties. This
              Privacy Policy does not address, and we are not responsible for,
              the privacy, information, or practices of any third parties,
              including any third party operating any site or online service
              (including, without limitation, any application) that is
              available through this Service or to which this Service contains
              a link. The availability of, or inclusion of a link to, any such
              site or property on the Service does not imply endorsement of it
              by us or by our affiliates.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Patient Information (HIPAA)
            </h2>
            <p>
              The excelENT Practice Solutions platform handles protected health
              information (PHI) under separate HIPAA-compliant agreements with
              partner practices. See our{' '}
              <Link
                href="/b2b/hipaa"
                className="text-[color:var(--color-accent-primary)] underline hover:no-underline"
              >
                HIPAA notice
              </Link>{' '}
              for details on our infrastructure and Business Associate
              Agreements.
            </p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Contacting Us
            </h2>
            <p>
              <strong>ExcelENT, Inc,</strong> located at 68 T.W. Alexander
              Drive, PO Box 13628, Research Triangle Park, Durham, NC 27709, is
              the company responsible for collection, use, and disclosure of
              personal information under this Privacy Policy.
            </p>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us via:
            </p>
            <p>
              Postal Address:
              <br />
              68 T.W. Alexander Drive,
              <br />
              PO Box 13628,
              <br />
              Research Triangle Park,
              <br />
              Durham, NC 27709
            </p>
            <p>Telephone: 919-314-2891</p>

            <h2 className="font-display font-bold text-xl md:text-2xl text-ink mt-6">
              Updates to this Privacy Policy
            </h2>
            <p>
              We may change this Privacy Policy. Any changes to this Privacy
              Policy will become effective when we post the revised Privacy
              Policy on the Service. Your use of the Service following these
              changes means that you accept the revised Privacy Policy. We
              recommend that you regularly review the Privacy Policy when you
              visit the Service. This policy was last updated on January 1,
              2023.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="us-supp-heading"
        className="bg-surface-alt border-b border-edge"
      >
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <h2
              id="us-supp-heading"
              className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight"
            >
              US Supplemental Privacy Notice
            </h2>
            <p className="text-sm text-ink-tertiary italic">
              Last Updated January 1, 2023
            </p>
            <p>
              This US Supplemental Privacy Notice (&ldquo;Supplemental
              Notice&rdquo;) applies only to information collected about
              California, Colorado, Virginia, Utah, and Connecticut consumers.
              It provides information required under the following laws,
              (collectively, &ldquo;US State Privacy Laws&rdquo;):
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                California Consumer Privacy Act of 2018 and California Privacy
                Rights Act of 2020 (collectively, the &ldquo;CPRA&rdquo;)
              </li>
              <li>Colorado Privacy Act of 2021 (the &ldquo;CPA&rdquo;)</li>
              <li>Connecticut Data Privacy Act (&ldquo;CTDPA&rdquo;)</li>
              <li>Utah Consumer Privacy Act of 2022 (the &ldquo;UCPA&rdquo;)</li>
              <li>
                Virginia Consumer Data Protection Act of 2021 (the
                &ldquo;VCDPA&rdquo;)
              </li>
            </ul>
            <p>
              We also provide information collected about Nevada consumers
              under the heading &ldquo;Privacy Notice for Nevada
              Residents&rdquo; at the end of this Supplemental Notice.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              A. Definitions
            </h3>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>&ldquo;Personal Information&rdquo;</strong> means
                information that identifies, relates to, describes, is
                reasonably capable of being associated with, or could
                reasonably be linked, directly or indirectly, with a particular
                consumer or household.
              </li>
              <li>
                <strong>&ldquo;Sensitive Personal Information&rdquo;</strong>{' '}
                means Personal Information that reveals a consumer&rsquo;s
                social security, driver&rsquo;s license, state identification
                card, or passport number; account log-in, financial account
                number, debit card number, or credit card number in combination
                with any required security or access code, password, or
                credentials allowing access to an account; precise geolocation;
                racial or ethnic origin, religious beliefs, or union
                membership; contents of email or text messages; and genetic
                data.
              </li>
              <li>
                <strong>&ldquo;Third Party&rdquo;</strong> has the meanings
                afforded to it in the applicable US State Privacy Law.
              </li>
              <li>
                <strong>&ldquo;Vendor&rdquo;</strong> means a service provider,
                contractor, or processor as those terms are defined in the
                applicable US State Privacy Law.
              </li>
            </ul>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              B. Collection &amp; Processing of Personal Information
            </h3>
            <p>
              We, and our Vendors, may have collected and processed the
              following categories of Personal Information about you in the
              preceding 12 months:
            </p>
            <ol className="list-decimal pl-6 flex flex-col gap-2">
              <li>
                Identifiers, such as name, alias, online identifiers, account
                name, physical characteristics or description;
              </li>
              <li>
                Contact and financial information, including phone number,
                address, email address, financial information, medical
                information, health insurance information;
              </li>
              <li>
                Characteristics of protected classifications under state or
                federal law, such as age, gender, race, physical or mental
                health conditions, and marital status;
              </li>
              <li>
                Commercial information, such as transaction information,
                payment information, tax withholding information and purchase
                history;
              </li>
              <li>Biometric information;</li>
              <li>
                Internet or other electronic network activity information, such
                as browsing history, search history and interactions with our
                websites or advertisements;
              </li>
              <li>Geolocation data, such as device location;</li>
              <li>
                Audio, electronic, visual and similar information, such as call
                and video recordings;
              </li>
              <li>
                Professional or employment-related information, such as
                specialty, education history, professional qualifications, work
                history and prior employer;
              </li>
              <li>
                Inferences drawn from any of the Personal Information listed
                above to create a profile or summary about, for example, an
                individual&rsquo;s preferences and characteristics; and
              </li>
              <li>
                Sensitive personal information, including (a) Personal
                Information that reveals social security, driver&rsquo;s
                license, state identification card, or passport number; account
                log-in, financial account number, debit card number, or credit
                card number in combination with any required security or
                access code, password, or credentials for allowing access to an
                account; precise geolocation; racial or ethnic origin,
                religious or philosophical beliefs, or union membership;
                genetic data; (b) biometric data processed for the purpose of
                uniquely identifying a consumer; (c) Personal Information
                collected and analyzed concerning a consumer&rsquo;s health;
                and (d) Personal Information collected and analyzed concerning
                a consumer&rsquo;s sex life or sexual orientation.
              </li>
            </ol>
            <p>
              <strong>Retention of Personal Information:</strong> We retain
              your Personal Information for the period reasonably necessary to
              provide goods and services to you and for the period reasonably
              necessary to support our business operational purposes listed in
              Section E.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              C. Categories of Personal Information We Disclose to Vendors
              &amp; Third Parties
            </h3>
            <p>
              We may disclose the categories of Personal Information listed in
              Section B above to Vendors and Third Parties.
            </p>
            <p>
              <strong>Disclosure for California Consumers:</strong> Unless
              specifically stated, we have not sold or shared Personal
              Information about California consumers to third parties for their
              own use in the past twelve months. Relatedly, we do not have
              actual knowledge that we sell or share Personal Information of
              California consumers under 16 years of age. However, we may share
              your personal information with our affiliates and trusted
              partners in arrangements that may meet the broad definition of
              &ldquo;sale&rdquo; or &ldquo;share&rdquo; under California law.
              In these arrangements, use of the information we share is limited
              by policies, contracts, or similar restrictions.
            </p>
            <p>
              For purposes of the CPRA, a &ldquo;sale&rdquo; is the disclosure
              of Personal Information to a Third Party for monetary or other
              valuable consideration, and a &ldquo;share&rdquo; is the
              disclosure of Personal Information to a Third Party for
              cross-context behavioral advertising.
            </p>
            <p>
              <strong>
                Disclosure for Colorado, Virginia, Utah, and Connecticut
                Consumers:
              </strong>{' '}
              Unless specifically stated, we do not sell or share Personal
              Information to Third Parties for their own use. However, we may
              share or process one or more of the above categories of personal
              information with our affiliates and trusted partners in
              arrangements for purposes of targeted advertising, as the terms
              &ldquo;sell,&rdquo; &ldquo;share,&rdquo; &ldquo;process,&rdquo;
              and &ldquo;targeted advertising&rdquo; are defined in the CPA,
              VCDPA, UCPA, and CTDPA. In these arrangements, use of the
              information we share is limited by policies, contracts or similar
              restrictions.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              D. Sources from Which We Collect Personal Information
            </h3>
            <p>
              We collect Personal Information directly from California,
              Colorado, Virginia, Utah, and Connecticut consumers, as well as
              from our affiliates, business partners, joint marketing partners,
              public databases, providers of demographic data, publications,
              professional organizations, social media platforms, caregivers,
              third party information providers, affiliates with whom you have
              a business relationship, service providers with which we have a
              contractual relationship and to which you have provided your
              personal information, cookies and other tracking technologies,
              and Vendors and Third Parties when they share the information
              with us.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              E. Purposes for Processing Personal Information
            </h3>
            <p>
              We, and our Vendors, collect and process the Personal Information
              (excluding Sensitive Personal Information) described in this
              Supplemental Notice to:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>Operate, manage, and maintain our business;</li>
              <li>Respond to your inquiries and to fulfill your requests;</li>
              <li>
                Send you important information regarding our relationship with
                you or regarding this website, changes to our terms,
                conditions, and policies and/or other administrative
                information;
              </li>
              <li>
                Conduct audits, to verify that our internal processes function
                as intended and are compliant with legal, regulatory, or
                contractual requirements;
              </li>
              <li>
                Prevent fraud or crime, and for risk and technical security
                monitoring purposes;
              </li>
              <li>Facilitate the development of new products and services;</li>
              <li>
                Enhance, improve or modify our website or products and services;
              </li>
              <li>Perform research, analytics and, data analysis;</li>
              <li>
                Determine the effectiveness of our promotional campaigns, so
                that we can adapt our campaigns to the needs and interests of
                our users;
              </li>
              <li>Personalize, advertise, and market our products and services;</li>
              <li>Comply with law, legal process, and internal policies;</li>
              <li>Maintain records;</li>
              <li>Exercise and defend legal claims; and</li>
              <li>Otherwise accomplish our business purposes and objectives.</li>
            </ul>
            <p>
              We, and our Vendors, collect and process the Sensitive Personal
              Information described in this Supplemental Notice for performing
              the services or providing the goods reasonably expected by an
              average consumer who requests those goods or services; ensuring
              security and integrity; performing services on our behalf;
              undertaking activities to verify or maintain the quality or
              safety of our service or device; personalizing, advertising, and
              marketing our products and services; conducting research,
              analytics, and data analysis; performing accounting, audit, and
              other internal functions; complying with law, legal process, and
              internal policies; maintaining records; exercising and defending
              legal claims; and otherwise accomplishing our business purposes
              and objectives.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              F. Categories of Entities to Whom We Disclose Personal Information
            </h3>
            <p>
              <strong>Third Parties:</strong> We may disclose your Personal
              Information to the following categories of Third Parties:
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-2">
              <li>
                <strong>At Your Direction:</strong> with your consent or at
                your direction.
              </li>
              <li>
                <strong>Business Transfers or Assignments:</strong> as
                reasonably necessary to facilitate a reorganization, merger,
                sale, joint venture or collaboration, assignment, transfer, or
                other disposition of all or any portion of our business,
                assets, or stock.
              </li>
              <li>
                <strong>Third Party Co-Branding and Co-Marketing Partners:</strong>{' '}
                with whom we offer a co-branded or co-marketed promotion.
              </li>
              <li>
                <strong>Third Party Advertising Partners:</strong> including
                social media, medical journals and publishers.
              </li>
              <li>
                <strong>Legal and Regulatory:</strong> government authorities,
                including regulatory agencies and courts, as reasonably
                necessary for our business operational purposes, to assert and
                defend legal claims, and otherwise as permitted or required by
                law.
              </li>
            </ul>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              G. Data Subject Rights
            </h3>
            <p>
              <strong>Exercising Data Subject Rights:</strong> California,
              Colorado, Virginia, Utah, and Connecticut consumers have certain
              rights with respect to the collection and use of their Personal
              Information. Those rights vary by state. You may exercise the
              data subject rights applicable to you under the applicable US
              State Privacy Law by contacting us at 919-314-2891. While we
              will make reasonable efforts to accommodate your request, we
              reserve the right to impose certain restrictions or requirements
              on your request, if allowed by or required by applicable law.
              Consumers in some states may also authorize an agent to make data
              subject requests on their behalf.
            </p>
            <p>
              <strong>Verification of Data Subject Requests:</strong> We may
              ask you to provide information that will enable us to verify your
              identity in order to comply with your data subject request. In
              some instances, we may decline to honor your request if an
              exception applies under applicable law. We will respond to your
              request consistent with applicable law.
            </p>
            <p>
              <strong>Non-Discrimination:</strong> We will not discriminate
              against you for exercising your data subject rights.
            </p>
            <p>
              <strong>Appeals:</strong> To appeal our decision on your data
              subject requests, you may contact us at 919-314-2891. Please
              enclose a copy of or otherwise specifically reference our
              decision on your data subject request.
            </p>
            <p>
              <strong>Data Subject Rights Disclosure:</strong> Subject to
              applicable law, you have the rights to receive information on
              privacy practices; deletion; correction; the right to know how we
              have handled your Personal Information in the 12 months preceding
              your request; the right to receive information about onward
              disclosures; the right to non-discrimination; the right to
              restrict or limit the use of sensitive personal information; and
              the right to opt out of sharing, disclosure, or sale of personal
              information.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              H. Other Disclosures
            </h3>
            <p>
              <strong>California Residents Under Age 18.</strong> If you are a
              resident of California under the age of 18 and a registered user
              of our website, you may ask us to remove content or data that you
              have posted to the website by contacting us at 919-314-2891.
              Please note that your request does not ensure complete or
              comprehensive removal of the content or data.
            </p>
            <p>
              <strong>Disclosure About Direct Marketing for California Residents.</strong>{' '}
              California Civil Code § 1798.83 permits California residents to
              annually request certain information regarding our disclosure of
              Personal Information to other entities for their direct marketing
              purposes in the preceding calendar year. We do not distribute
              your Personal Information to other entities for their own direct
              marketing purposes.
            </p>
            <p>
              <strong>Financial Incentives for California Consumers.</strong>{' '}
              We offer various types of financial incentives in exchange for
              your personal information, such as coupons, discounts,
              promotions, loyalty points, sweepstakes, contests, surveys, and
              other exclusive offers for California consumers who sign up to
              receive our marketing emails or join our loyalty program.
              Participation in our financial incentives is voluntary.
            </p>
            <p>
              <strong>Changes to our Supplemental Notice.</strong> We reserve
              the right to amend this Supplemental Notice at our discretion and
              at any time. When we make material changes to this Supplemental
              Notice, we will notify you by posting an updated Supplemental
              Notice on our website and listing the effective date of such
              updates.
            </p>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="nv-heading"
        className="bg-surface border-b border-edge"
      >
        <div className="max-w-prose mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col gap-6 text-base text-ink-secondary leading-relaxed">
            <h2
              id="nv-heading"
              className="font-display font-bold text-2xl md:text-3xl text-ink leading-tight"
            >
              Privacy Notice for Nevada Residents
            </h2>
            <p className="text-sm text-ink-tertiary italic">
              Effective: January 1, 2023
            </p>
            <p>
              This Privacy Notice for Nevada Residents adds to the information
              contained in the ExcelENT Global Privacy Policy, and applies only
              to Nevada residents (&ldquo;You,&rdquo; &ldquo;your&rdquo; or
              &ldquo;consumer&rdquo;).
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              Personal Information Collection and Purposes of Use
            </h3>
            <p>
              We collect certain personal information of Nevada consumers
              through our Internet websites or other online service. This
              information includes one or more of the following elements of
              personally identifiable information:
            </p>
            <ol className="list-decimal pl-6 flex flex-col gap-2">
              <li>A first and last name.</li>
              <li>
                A home or other physical address that includes the name of a
                street and the name of a city or town.
              </li>
              <li>An electronic mail address.</li>
              <li>A telephone number.</li>
              <li>A Social Security Number.</li>
              <li>
                An identifier that allows a specific person to be contacted
                either physically or online.
              </li>
              <li>
                Any other information concerning a person collected from the
                person through the Internet website or online service of the
                operator, and maintained by the operator in combination with an
                identifier in a form that makes the information personally
                identifiable.
              </li>
            </ol>
            <p>
              We collect this personal information to respond to your
              inquiries and to fulfill your requests; to send you important
              information regarding our relationship; for audits and compliance
              verification; for fraud or crime prevention; to facilitate the
              development of new products and services; to enhance, improve or
              modify our website; for data analysis on usage trends; to
              determine the effectiveness of our promotional campaigns; and to
              better understand and personalize our interactions with you.
            </p>

            <h3 className="font-display font-bold text-lg text-ink mt-4">
              Your Privacy Rights
            </h3>
            <p>
              <strong>
                Right to access and/or correct your personal information, or
                opt out of sale of personal information.
              </strong>{' '}
              If you would like to review, correct, or update your personal
              information, you or your authorized representative may contact us
              via 919-314-2891. We will respond to your verified request as
              soon as reasonably practicable, but no later than sixty (60) days
              after receipt. If circumstances cause any delay in our response,
              you will be promptly notified and provided a date for our
              response.
            </p>
            <p>
              We generally do not disclose or share personal information for
              profit. Under Nevada law, you have the right to direct us to not
              sell or license your personal information to third parties. To
              exercise this right, if applicable, you or your authorized
              representative may contact us via 919-314-2891.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
