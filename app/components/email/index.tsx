import { Mail } from "@/components/email/mail";
import { accounts, mails } from "@/components/email/data";

export default function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />;
}
