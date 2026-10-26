import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <LegalLayout>
      <h1>Privacy</h1>
      <p>We keep this short because we keep very little.</p>

      <h2>What we store</h2>
      <ul>
        <li>Hosts: name, work email, company, role, mobile number, LinkedIn if given, and the details of the tables they request.</li>
        <li>Guests: name, email if we have it, title, company, LinkedIn if given, which times they picked, whether they confirmed, and anything they chose to tell us about what the table should talk about.</li>
        <li>People who leave their name for a future table: name, email, LinkedIn if given, city and topics of interest.</li>
        <li>A log of the emails we sent you, so we can see what went out and fix problems.</li>
      </ul>

      <h2>What other guests see</h2>
      <p>
        Once a guest confirms, their name, title and company appear on the invitation page of that table so the other guests know who is coming. Email addresses, phone numbers and LinkedIn profiles are never shown to other guests. Guests who have not confirmed are not shown.
      </p>

      <h2>Email</h2>
      <p>
        We only email you about tables you are part of: the invitation, the confirmation, the final time and address, and a reminder. We do not use open or click tracking. We do not sell or share your details with anyone else, and we do not pass them to the host beyond what appears at the table.
      </p>

      <h2>Where it lives</h2>
      <p>Our data is stored in a managed Postgres database and our email is sent through Resend. Both are hosted in the United States.</p>

      <h2>Deleting your data</h2>
      <p>
        Reply to any email from us, or write to the address in the footer of one, and ask. We delete your details within a few days, except where we need to keep a record of a paid table.
      </p>
    </LegalLayout>
  );
}
