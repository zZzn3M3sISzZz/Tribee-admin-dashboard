import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy" updated="June 10, 2026">
      <LegalSection title="1. Who we are">
        <p>
          Tribee (operated by offScreen) is a trust-first community platform for curated offline
          experiences and meaningful connections. This Privacy Policy explains how we collect, use,
          and protect personal information when you use our mobile apps, website, and related
          services (collectively, the &quot;Service&quot;).
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>
          <strong>Account information:</strong> email address, display name, profile details,
          preferences, and authentication credentials managed through our identity provider.
        </p>
        <p>
          <strong>Identity verification:</strong> government ID images and live selfies submitted
          for manual review. These are used solely to verify that members are real people and to
          reduce fraud.
        </p>
        <p>
          <strong>Usage and device data:</strong> app interactions, device identifiers, push
          notification tokens, approximate location or city preference, and technical logs needed
          to operate and secure the Service.
        </p>
        <p>
          <strong>Community and social data:</strong> posts, messages, connection requests, event
          participation, feedback, and safety reports you submit through the platform.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>create and manage your account;</li>
          <li>verify identity and maintain community safety;</li>
          <li>match you to experiences and connections according to your preferences;</li>
          <li>operate chat, notifications, hosting tools, and customer support;</li>
          <li>detect abuse, enforce our Terms, and comply with law;</li>
          <li>improve reliability, security, and product quality.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Legal bases and consent">
        <p>
          We process information as needed to perform our contract with you, to pursue legitimate
          interests such as fraud prevention and platform safety, and where required, with your
          consent (for example, optional marketing or certain device permissions).
        </p>
      </LegalSection>

      <LegalSection title="5. Sharing">
        <p>
          We do not sell your personal information. We share data only with service providers that
          help us operate the Service (such as cloud hosting, authentication, email delivery, and
          push notifications), with other members as you choose through your profile and social
          features, and when required by law or to protect rights, safety, and security.
        </p>
      </LegalSection>

      <LegalSection title="6. Retention">
        <p>
          We retain information for as long as your account is active and as needed to provide the
          Service, resolve disputes, enforce agreements, and meet legal obligations. Identity
          verification materials are retained only for as long as necessary for verification and
          compliance, then deleted or anonymized according to our retention schedule.
        </p>
      </LegalSection>

      <LegalSection title="7. Your choices">
        <p>
          You may update profile information in the app, manage notification permissions on your
          device, and request account deletion through the self-service deletion page or in-app
          settings. Deletion removes sign-in access and anonymizes your profile, subject to
          limited retention required by law or legitimate safety needs.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use administrative, technical, and organizational safeguards including encryption in
          transit, access controls, and manual review workflows for sensitive verification data.
          No method of transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          The Service is intended for adults. We do not knowingly collect personal information from
          anyone under 18. If you believe a minor has provided us data, contact us so we can
          delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          Your information may be processed in countries other than where you live. We take steps
          designed to ensure an appropriate level of protection wherever your data is handled.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this Privacy Policy from time to time. We will post the revised version on
          this page and update the &quot;Last updated&quot; date. Material changes may also be
          communicated in the app or by email where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Privacy questions or requests:{" "}
          <a href="mailto:privacy@offscreen.app" className="font-medium text-brand hover:underline">
            privacy@offscreen.app
          </a>
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
