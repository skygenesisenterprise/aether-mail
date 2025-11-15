"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import EmailList from "./EmailList";
import EmailViewer from "./EmailViewer";
import Compose from "./Compose";

export default function MailLayout() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
      />
      <div className="flex-1 flex">
        <EmailList
          selectedEmail={selectedEmail}
          onEmailSelect={setSelectedEmail}
        />
        <EmailViewer emailId={selectedEmail} />
      </div>
      <Compose isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
    </div>
  );
}
