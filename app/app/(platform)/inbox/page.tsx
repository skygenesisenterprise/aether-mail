"use client";

import * as React from "react";
import { EmailFolder } from "@/components/email/EmailFolder";
import { EmailList } from "@/components/email/EmailList";
import { Footer } from "@/components/email/Footer";
// import { Header } from "@/components/email/Header";
import { Mail } from "lucide-react";

export default function InboxPage() {
  const [activeFolder, setActiveFolder] = React.useState("INBOX");
  const [selectedEmail, setSelectedEmail] = React.useState<string | null>(null);

  const handleFolderChange = (folderId: string) => {
    setActiveFolder(folderId);
    setSelectedEmail(null);
  };

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmail(emailId);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* <Header /> */}

      <div className="flex flex-1 overflow-hidden">
        <EmailFolder activeFolder={activeFolder} onFolderChange={handleFolderChange} />

        <div className="flex flex-1 overflow-hidden">
          <div className="w-96 border-r flex flex-col overflow-hidden bg-background">
            <div className="border-b px-4 py-3 shrink-0">
              <h1 className="text-xl font-semibold capitalize">{activeFolder.toLowerCase()}</h1>
            </div>
            <EmailList
              key={activeFolder}
              folderId={activeFolder}
              onEmailSelect={handleEmailSelect}
            />
          </div>

          <div className="flex-1 flex flex-col bg-background">
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center text-muted-foreground">
                <Mail className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">No email selected</p>
                <p className="text-xs">Select an email to view its content</p>
              </div>
            </div>
            <Footer className="py-3 text-xs text-muted-foreground text-center" />
          </div>
        </div>
      </div>
    </div>
  );
}
