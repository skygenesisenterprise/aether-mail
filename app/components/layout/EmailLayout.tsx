import type React from "react";
import { useState } from "react";
import Layout from "./Layout";
import EmailInbox from "../email/EmailInbox";
import type { Email } from "../email/EmailList";

interface EmailLayoutProps {
  children: React.ReactNode;
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const handleReply = (email: Email) => {
    console.log("Reply to email:", email);
    // Implement reply logic
  };

  const handleForward = (email: Email) => {
    console.log("Forward email:", email);
    // Implement forward logic
  };

  const handleDelete = (email: Email) => {
    console.log("Delete email:", email);
    // Implement delete logic
  };

  return (
    <Layout
      selectedEmail={selectedEmail}
      onReply={handleReply}
      onForward={handleForward}
      onDelete={handleDelete}
    >
      {children}
    </Layout>
  );
};

export default EmailLayout;
