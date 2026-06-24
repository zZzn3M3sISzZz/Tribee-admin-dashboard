import Link from "next/link";
import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { withBasePath } from "@/lib/base-path";

export default function CopyrightPage() {
  return (
    <LegalPageShell title="Copyright Notice" updated="June 24, 2026">
      <LegalSection title="1. Ownership">
        <p>
          Tribee, the offScreen brand, and all related mobile applications, websites, software,
          user interfaces, graphics, logos, icons, product names, and other content made available
          through our services (collectively, the &quot;Materials&quot;) are owned by offScreen and
          its licensors and are protected by copyright, trademark, and other intellectual property
          laws in India and internationally.
        </p>
        <p>
          Unless otherwise stated, © {new Date().getFullYear()} offScreen. All rights reserved.
        </p>
      </LegalSection>

      <LegalSection title="2. Limited license to users">
        <p>
          We grant you a personal, non-exclusive, non-transferable, revocable license to access and
          use the Tribee app and related services for your own lawful, non-commercial use in
          accordance with our{" "}
          <Link href={withBasePath("/terms")} className="font-medium text-brand hover:underline">
            Terms &amp; Conditions
          </Link>
          . This license does not give you any ownership rights in the Materials.
        </p>
      </LegalSection>

      <LegalSection title="3. Restrictions">
        <p>You may not, without our prior written permission:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>copy, modify, distribute, sell, or lease any part of the Materials;</li>
          <li>reverse engineer or attempt to extract source code from our apps or services;</li>
          <li>remove copyright, trademark, or other proprietary notices;</li>
          <li>use offScreen or Tribee names, logos, or branding in a misleading way;</li>
          <li>
            scrape, harvest, or systematically download content except as allowed by applicable law
            or an explicit written agreement with us.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. User-generated content">
        <p>
          You retain ownership of content you submit through the Service. By posting content, you
          grant offScreen a worldwide, royalty-free license to host, display, reproduce, and
          distribute that content solely as needed to operate, promote, and improve the Service, as
          described in our Terms &amp; Conditions and{" "}
          <Link href={withBasePath("/privacy")} className="font-medium text-brand hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Third-party content">
        <p>
          The Service may include third-party software, fonts, images, maps, or other materials
          subject to separate licenses. Those components remain the property of their respective
          owners. Your use of third-party services linked from Tribee is governed by their own
          terms.
        </p>
      </LegalSection>

      <LegalSection title="6. Copyright complaints">
        <p>
          If you believe content on Tribee infringes your copyright, please contact us with:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>your name and contact information;</li>
          <li>identification of the copyrighted work;</li>
          <li>identification of the material you believe is infringing and where it appears;</li>
          <li>
            a statement of good-faith belief that the use is not authorized by the copyright owner;
          </li>
          <li>
            a statement, under penalty of perjury where applicable, that the information is
            accurate and that you are authorized to act on behalf of the owner;
          </li>
          <li>your physical or electronic signature.</li>
        </ul>
        <p>
          Send notices to{" "}
          <a href="mailto:legal@offscreen.app" className="font-medium text-brand hover:underline">
            legal@offscreen.app
          </a>
          . We may remove or disable access to material that we believe infringes copyright and may
          terminate repeat infringers where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="7. Trademarks">
        <p>
          &quot;offScreen,&quot; &quot;Tribee,&quot; and related logos are trademarks or service
          marks of offScreen. Other names and brands appearing in the Service may be trademarks of
          their respective owners. Nothing in this notice grants you any right to use our trademarks
          without written consent.
        </p>
      </LegalSection>

      <LegalSection title="8. Updates">
        <p>
          We may update this Copyright Notice from time to time. The &quot;Last updated&quot; date
          at the top of this page indicates when it was last revised. Continued use of the Service
          after changes become effective constitutes acceptance of the updated notice.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
