import type { Metadata } from "next";
import LegalPage from "@/logaxp/components/LegalPage";

export const metadata: Metadata = { title: "Website Terms | LogaXP", description: "Terms for using the LogaXP public website." };

export default function TermsPage() {
  return <LegalPage title="Website terms" intro="These terms describe use of the LogaXP public website. Subscription purchases, paid projects, and individual products are subject to the agreements presented for those services. This page does not replace an agreement signed with your organization."
    sections={[
      { title: "Using this website", text: "You may browse the site to learn about LogaXP and contact us about our services. Use the site lawfully. Do not attempt unauthorized access, interfere with its operation, introduce malicious software, or submit information you are not entitled to share." },
      { title: "Product information and previews", text: "Showcase images and interface previews illustrate products and concepts. They are not a guarantee of a particular result or a commitment that every feature is available in every plan. Confirm current scope, availability, pricing, and delivery expectations with us before making a purchase decision." },
      { title: "Enquiries and agreements", text: "Sending an enquiry or requesting a demonstration does not create a subscription, purchase, or delivery commitment. Commercial work requires the relevant order, subscription terms, or written agreement. That agreement sets out fees, service scope, cancellation, and support arrangements." },
      { title: "Content and intellectual property", text: "LogaXP branding, website materials, and product content belong to LogaXP or their respective owners and licensors. Browsing this site does not transfer ownership or grant permission to reproduce materials for commercial use. Contact us for permission where needed." },
      { title: "Linked services", text: "Links to product websites and other resources are provided for convenience. Those services have their own terms and privacy notices. Review them before creating an account, booking, or paying for a service." },
      { title: "Availability and accuracy", text: "We may update website content and make changes to the site. Access may be interrupted for maintenance or other reasons. Contact us if you notice an error or need confirmation of information. Nothing on this page limits rights that cannot lawfully be excluded." },
      { title: "Privacy and changes", text: "Our privacy notice explains information handling for this website and contact channels. Updates to these website terms will appear here with a revised date; separate service agreements govern changes to those services." },
    ]} />;
}
