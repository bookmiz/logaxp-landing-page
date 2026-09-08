import type { Metadata } from "next";
import LegalPage from "@/logaxp/components/LegalPage";

export const metadata: Metadata = { title: "Privacy | LogaXP", description: "Privacy information for the LogaXP website and contact channels." };

export default function PrivacyPage() {
  return <LegalPage title="Privacy notice" intro="This notice covers the LogaXP public website and communications with our team. Linked products and organization workspaces may have separate notices and agreements that describe their handling of account, employee, booking, or payment information."
    sections={[
      { title: "Information you provide", text: "When you contact us, you may provide your name, email address, company, team size, interests, and the message or attachments you choose to share. Please do not send passwords, payment-card details, or confidential employee records through a general enquiry." },
      { title: "Website and account technology", text: "Website requests include technical information such as IP address, browser details, and the requested page. Hosting and delivery services process this information to deliver the site and diagnose problems. Sign-in features use browser storage or cookies to maintain sessions. You can control storage through your browser settings; clearing it may sign you out." },
      { title: "How information is used", text: "Information supplied to our team is used to respond to enquiries, discuss services, provide requested support, and maintain the related business correspondence. Technical information supports website operation, troubleshooting, and protection against misuse." },
      { title: "Service providers and external links", text: "Hosting, communications, and other service providers may process information as part of delivering the services you use. Following a link to BookMiz, HireAFixer, GatherPlux, LogaDash, or another website takes you to a service with its own data practices. Review that service’s privacy information before submitting personal data." },
      { title: "Retention and security", text: "Retention depends on the purpose of the information, the service involved, and applicable recordkeeping requirements. Contact us to ask about a particular record or request deletion. Internet transmission and storage cannot be guaranteed completely secure; avoid sharing information that is unnecessary for your enquiry." },
      { title: "Your choices and requests", text: "You can ask about personal information associated with your communications, request a correction or deletion, or ask us to stop optional follow-up. We may need to verify your identity before responding. Available rights and any exceptions depend on the laws that apply. For employee records managed by your organization, contact your workspace administrator first." },
      { title: "Updates", text: "Changes to this notice will be published on this page with an updated date. Check the notice for the particular product you use as well as this website notice." },
    ]} />;
}
