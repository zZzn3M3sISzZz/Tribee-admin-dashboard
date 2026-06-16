import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { withBasePath } from "@/lib/base-path";

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms & Conditions" updated="June 10, 2026">
      <LegalSection title="1. Agreement">
        <p>
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of Tribee
          and related offScreen services (the &quot;Service&quot;). By creating an account or using
          the Service, you agree to these Terms and our{" "}
          <Link href={withBasePath("/privacy")} className="font-medium text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old and able to form a binding contract. You are responsible
          for ensuring that your use of the Service complies with applicable laws in your location.
        </p>
      </LegalSection>

      <LegalSection title="3. Account and verification">
        <p>
          You agree to provide accurate information and to keep your credentials secure. Tribee is a
          verification-first community. We may require government ID, a live selfie, and manual
          review before granting access to certain features such as messaging, event booking, or
          hosting.
        </p>
        <p>
          We may approve, reject, suspend, or revoke verification at our discretion to protect
          community safety.
        </p>
      </LegalSection>

      <LegalSection title="4. Community standards">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>harass, threaten, discriminate against, or endanger others;</li>
          <li>use false identity information or impersonate another person;</li>
          <li>spam, scrape, reverse engineer, or disrupt the Service;</li>
          <li>post illegal, exploitative, or sexually explicit content involving minors;</li>
          <li>use the Service for unauthorized commercial solicitation or fraud.</li>
        </ul>
        <p>
          We may remove content, restrict features, or terminate accounts that violate these
          standards or create risk for the community.
        </p>
      </LegalSection>

      <LegalSection title="5. Experiences and offline meetings">
        <p>
          Tribee facilitates introductions and curated experiences but does not guarantee outcomes,
          chemistry, attendance, or safety of third-party venues. You are responsible for your
          conduct and decisions when meeting others offline. Use common sense, meet in public when
          appropriate, and report concerns through in-app safety tools.
        </p>
      </LegalSection>

      <LegalSection title="6. Hosts">
        <p>
          Hosts must comply with additional guidelines and local laws governing events, capacity,
          alcohol service, and participant safety. Tribee may review host applications and remove
          hosting privileges for policy violations or poor community standing.
        </p>
      </LegalSection>

      <LegalSection title="7. Intellectual property">
        <p>
          The Service, branding, and underlying technology are owned by offScreen or its licensors.
          You retain rights to content you submit, but grant us a limited license to host, display,
          and process that content solely to operate the Service.
        </p>
      </LegalSection>

      <LegalSection title="8. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; TO THE MAXIMUM
          EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE
          OPERATION.
        </p>
      </LegalSection>

      <LegalSection title="9. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OFFSCREEN AND ITS AFFILIATES WILL NOT BE LIABLE
          FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
          PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          You may stop using the Service at any time and may delete your account through in-app
          settings or the{" "}
          <Link
            href={withBasePath("/delete-account")}
            className="font-medium text-brand hover:underline"
          >
            account deletion page
          </Link>
          . We may suspend or terminate access if you breach these Terms or if continued access
          would create legal or safety risk.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may modify these Terms from time to time. Continued use after changes become effective
          constitutes acceptance of the updated Terms. If you do not agree, you must stop using the
          Service and delete your account.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of India, without regard to conflict-of-law rules.
          Courts located in Mumbai, Maharashtra shall have exclusive jurisdiction, subject to
          mandatory consumer protections in your jurisdiction.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms:{" "}
          <a href="mailto:legal@offscreen.app" className="font-medium text-brand hover:underline">
            legal@offscreen.app
          </a>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
