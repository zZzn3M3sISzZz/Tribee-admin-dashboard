import Link from "next/link";
import type { ReactNode } from "react";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { withBasePath } from "@/lib/base-path";

const CHILD_SAFETY_EMAIL = "childsafety@offscreen.app";
const SAFETY_EMAIL = "safety@offscreen.app";

function FaqItem({ question, children }: { question: string; children: ReactNode }) {
  return (
    <details className="group rounded-lg border border-surface-border/60 bg-surface/40 px-4 py-3">
      <summary className="cursor-pointer list-none text-sm font-semibold text-brand marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          {question}
          <span className="text-text-secondary transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-text-secondary">{children}</div>
    </details>
  );
}

export default function ChildSafetyStandardsPage() {
  return (
    <LegalPageShell title="Child Safety Standards" updated="June 16, 2026">
      <LegalSection title="Our commitment">
        <p>
          Tribee (operated by offScreen) is committed to keeping children safe on our platform. We
          take seriously the safety of children and work to keep our community free of child sexual
          abuse and exploitation (CSAE). Tribee is a social connection and experiences platform for{" "}
          <strong>adults aged 18 and older only</strong>. We do not permit minors to create accounts
          or use the Service.
        </p>
        <p>
          This page describes our published standards, reporting mechanisms, and compliance practices
          in line with Google Play&apos;s Child Safety Standards policy and applicable child
          protection laws.
        </p>
      </LegalSection>

      <LegalSection title="Scope">
        <p>
          Tribee is categorized as a <strong>Social</strong> app on Google Play. These standards
          apply to all users, hosts, and content on the Tribee mobile apps and related services,
          regardless of whether a feature involves dating, matchmaking, messaging, events, or
          community posts.
        </p>
        <p>
          Even though Tribee is designed exclusively for adults and is age-gated at registration, we
          maintain child safety standards because social products can be misused. We enforce these
          standards through identity verification, moderation, reporting tools, and account
          enforcement.
        </p>
      </LegalSection>

      <LegalSection title="1. Standards against child sexual abuse and exploitation (CSAE)">
        <p>
          Tribee maintains a zero-tolerance policy for CSAE. We prohibit any content or behavior
          that sexually exploits, abuses, or endangers children, including but not limited to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>child sexual abuse material (CSAM);</li>
          <li>grooming a minor for sexual exploitation;</li>
          <li>sextortion or coercion involving minors;</li>
          <li>trafficking or exploitation of a child for sexual purposes;</li>
          <li>sexualization of minors in profiles, messages, posts, images, or event content;</li>
          <li>attempts to contact, solicit, or arrange meetings with minors through Tribee;</li>
          <li>sharing links or instructions intended to facilitate CSAE.</li>
        </ul>
        <p>
          Violations result in immediate account suspension or termination, preservation of evidence
          where legally required, and reporting to appropriate authorities and organizations such as
          the National Center for Missing &amp; Exploited Children (NCMEC) where applicable.
        </p>
        <p>
          These standards are incorporated into our{" "}
          <Link href={withBasePath("/terms")} className="font-medium text-brand hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and enforced alongside our broader community guidelines.
        </p>
      </LegalSection>

      <LegalSection title="2. In-app reporting and user feedback">
        <p>
          Tribee provides multiple in-app mechanisms for users to report safety concerns, including
          child safety issues:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Report a user</strong> — available from profiles and safety settings, with
            categories including harassment, inappropriate behavior, and safety concerns.
          </li>
          <li>
            <strong>Report a message</strong> — available within chat threads to flag harmful
            content to our safety team.
          </li>
          <li>
            <strong>Secure chat with Tribee Safety</strong> — direct in-app channel to our trust
            and safety team for urgent or sensitive reports.
          </li>
          <li>
            <strong>Help &amp; Support</strong> — in-app resources for trust, verification, and
            reporting guidelines.
          </li>
        </ul>
        <p>
          Users may also contact us outside the app using the email addresses listed in the
          &quot;Child safety point of contact&quot; section below. We review all reports and
          prioritize those involving potential harm to minors.
        </p>
      </LegalSection>

      <LegalSection title="3. Addressing child sexual abuse material (CSAM)">
        <p>
          When we obtain actual knowledge of CSAM on Tribee, we take appropriate action promptly,
          including:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>removing or disabling access to the content;</li>
          <li>suspending or terminating the responsible account(s);</li>
          <li>preserving relevant records in accordance with legal requirements;</li>
          <li>
            reporting to NCMEC via CyberTipline and cooperating with law enforcement where required
            by law;
          </li>
          <li>blocking re-uploads and associated identifiers where technically feasible.</li>
        </ul>
        <p>
          Our moderation and safety workflows are designed to detect, escalate, and respond to CSAM
          reports. Staff with access to sensitive reports receive training on handling child safety
          matters and limiting exposure to harmful material.
        </p>
      </LegalSection>

      <LegalSection title="4. Legal compliance">
        <p>
          Tribee complies with applicable child safety and child protection laws in the jurisdictions
          where we operate, including requirements relating to:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>reporting CSAM to designated authorities;</li>
          <li>preserving evidence and cooperating with lawful investigations;</li>
          <li>restricting access to the Service by minors;</li>
          <li>data protection obligations when handling safety reports.</li>
        </ul>
        <p>
          We monitor evolving regulatory guidance and update our practices as needed to maintain
          compliance.
        </p>
      </LegalSection>

      <LegalSection title="5. Age gating and prevention">
        <p>
          Tribee is not directed at children. We require users to confirm they are at least 18 years
          old, and we use identity verification (government ID and live selfie review) before
          granting access to core social features. Accounts that appear to belong to minors, or that
          attempt to target minors, are removed.
        </p>
        <p>
          If you believe a minor is using Tribee, please report it immediately using the in-app
          tools or the contact information below.
        </p>
      </LegalSection>

      <LegalSection title="6. Child safety point of contact">
        <p>
          For child safety matters, CSAM reports, and Google Play policy inquiries, contact our
          designated child safety team:
        </p>
        <p>
          <strong>Child safety (CSAM / CSAE):</strong>{" "}
          <a
            href={`mailto:${CHILD_SAFETY_EMAIL}`}
            className="font-medium text-brand hover:underline"
          >
            {CHILD_SAFETY_EMAIL}
          </a>
        </p>
        <p>
          <strong>General trust &amp; safety:</strong>{" "}
          <a href={`mailto:${SAFETY_EMAIL}`} className="font-medium text-brand hover:underline">
            {SAFETY_EMAIL}
          </a>
        </p>
        <p>
          We aim to acknowledge urgent child safety reports within one business day. Reports
          involving imminent danger should also be directed to local emergency services.
        </p>
      </LegalSection>

      <LegalSection title="Definitions">
        <p>
          <strong>CSAE</strong> — child sexual abuse and exploitation, including content or behavior
          that sexually exploits, abuses, or endangers children (for example grooming, sextortion,
          trafficking of a child for sex, or otherwise sexually exploiting a child).
        </p>
        <p>
          <strong>CSAM</strong> — child sexual abuse material: visual depictions of a minor engaged
          in sexually explicit conduct, or material that otherwise constitutes child sexual abuse
          material under applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Frequently asked questions">
        <div className="space-y-3">
          <FaqItem question="Is Tribee for children or teens?">
            <p>
              No. Tribee is for adults 18+ only. We do not knowingly allow minors to use the
              Service and remove accounts that appear to belong to minors.
            </p>
          </FaqItem>

          <FaqItem question="Why does Tribee publish child safety standards if it is adults-only?">
            <p>
              Tribee is a Social app on Google Play. Social products must publish CSAE standards,
              provide reporting mechanisms, and maintain a child safety contact even when the
              product is age-gated for adults.
            </p>
          </FaqItem>

          <FaqItem question="How can I report a safety concern in the app?">
            <p>
              Use Report a user or Report a message from the relevant screen, or open Secure Chat
              with Tribee Safety from Help &amp; Support or your profile safety settings.
            </p>
          </FaqItem>

          <FaqItem question="Can I report through email instead of the app?">
            <p>
              Yes. Email{" "}
              <a
                href={`mailto:${CHILD_SAFETY_EMAIL}`}
                className="font-medium text-brand hover:underline"
              >
                {CHILD_SAFETY_EMAIL}
              </a>{" "}
              for child safety or CSAM concerns, or{" "}
              <a href={`mailto:${SAFETY_EMAIL}`} className="font-medium text-brand hover:underline">
                {SAFETY_EMAIL}
              </a>{" "}
              for other trust and safety issues.
            </p>
          </FaqItem>

          <FaqItem question="What happens after I submit a report?">
            <p>
              Our safety team reviews reports, may request additional information, and takes
              enforcement action when policies are violated. CSAM reports are escalated immediately
              and may be referred to authorities as required by law.
            </p>
          </FaqItem>

          <FaqItem question="Who is the designated child safety contact?">
            <p>
              The offScreen Trust &amp; Safety team monitors{" "}
              <a
                href={`mailto:${CHILD_SAFETY_EMAIL}`}
                className="font-medium text-brand hover:underline"
              >
                {CHILD_SAFETY_EMAIL}
              </a>
              . This inbox is staffed by personnel responsible for child safety compliance and CSAM
              response coordination.
            </p>
          </FaqItem>
        </div>
      </LegalSection>

      <LegalSection title="Related policies">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link href={withBasePath("/terms")} className="font-medium text-brand hover:underline">
              Terms &amp; Conditions
            </Link>
          </li>
          <li>
            <Link href={withBasePath("/privacy")} className="font-medium text-brand hover:underline">
              Privacy Policy
            </Link>
          </li>
        </ul>
        <p className="text-xs text-text-secondary/80">
          For additional industry guidance, see the Tech Coalition&apos;s best practices for
          combating online child sexual exploitation and abuse.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
