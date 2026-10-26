import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <LegalLayout>
      <h1>Terms</h1>
      <p>Short and plain. These terms cover hosting a Smallroom table and taking a seat at one. Smallroom is run by FoundryDocs.</p>

      <h2>What a host pays for</h2>
      <p>
        A table is a hosted conversation for about seven people, including the host, in a café or quiet restaurant in the host&apos;s chosen city. The table fee covers finding and personally inviting the guests, confirming who is coming, choosing and booking the place, and sending the invitations, the final details and the reminders. It does not cover food and drinks at the table unless we say so in writing. Founding hosts get their first table free.
      </p>

      <h2>Full table promise</h2>
      <p>
        At least five guests who fit the description the host gave take their seat at the table, or the table fee is refunded in full. If the host paid nothing for the table, there is nothing to refund, and we will offer to run the table again.
      </p>

      <h2>Cancelling and changing</h2>
      <ul>
        <li>A host can cancel free of charge up to 72 hours before the confirmed start time. Later than that, the table fee is due.</li>
        <li>We confirm the time, place and first guests within two business days of a request. If we cannot fill a table, we tell the host and nothing is charged.</li>
        <li>We may move a table to another offered time if that is the one that fills first.</li>
      </ul>

      <h2>House rules</h2>
      <ul>
        <li>No pitching, no slides, phones down.</li>
        <li>Chatham House rule: you may use what you hear at the table, but not say who said it or where they work.</li>
        <li>Photos of guests are only shared, by the host or by us, with the permission of the people in them.</li>
        <li>Be on time, and tell us as early as you can if you cannot come after all.</li>
      </ul>

      <h2>Who sits at the table</h2>
      <p>
        Seats are by invitation. We may decline any request to host, decline any guest, or ask anyone to leave a table, before or during it, if we believe it is better for the conversation. We do not promise exact titles or companies, only people as close to the host&apos;s description as we can find.
      </p>

      <h2>Liability</h2>
      <p>
        We bring people together and book a place. We are not responsible for what is said or agreed at the table, for the venue, or for anything that happens between guests after the table. Our total liability to a host is limited to the table fee paid.
      </p>

      <h2>Contact</h2>
      <p>Questions about these terms: reply to any email from us.</p>
    </LegalLayout>
  );
}
