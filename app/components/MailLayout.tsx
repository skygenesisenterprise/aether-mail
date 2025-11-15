"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import EmailList from "./EmailList";
import EmailViewer, { emailsData } from "./EmailViewer";
import Compose from "./Compose";

export default function MailLayout() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<
    "new" | "reply" | "replyAll" | "forward"
  >("new");

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Colonne de gauche : Dossiers */}
      <Sidebar
        selectedFolder={selectedFolder}
        onFolderSelect={(folder) => {
          setSelectedFolder(folder);
          setSelectedEmail(undefined); // Réinitialiser l'email sélectionné quand on change de dossier
        }}
        onCompose={() => {
          setComposeMode("new");
          setIsComposeOpen(true);
        }}
      />

      {/* Colonne du centre : Liste des emails */}
      <EmailList
        selectedEmail={selectedEmail}
        onEmailSelect={setSelectedEmail}
        selectedFolder={selectedFolder}
        onEmailDelete={(emailId) => {
          setSelectedEmail(undefined);
        }}
        onEmailArchive={(emailId) => {
          setSelectedEmail(undefined);
        }}
      />

      {/* Colonne de droite : Email Viewer ou Compose */}
      <div className="flex-1 flex flex-col">
        {isComposeOpen ? (
          <Compose
            isOpen={isComposeOpen}
            onClose={() => setIsComposeOpen(false)}
            mode={composeMode}
            originalEmail={
              selectedEmail ? emailsData[selectedEmail] : undefined
            }
          />
        ) : (
          <EmailViewer
            emailId={selectedEmail}
            onReply={(emailId) => {
              setComposeMode("reply");
              setIsComposeOpen(true);
            }}
            onReplyAll={(emailId) => {
              setComposeMode("replyAll");
              setIsComposeOpen(true);
            }}
            onForward={(emailId) => {
              setComposeMode("forward");
              setIsComposeOpen(true);
            }}
            onDelete={(emailId) => {
              setSelectedEmail(undefined);
            }}
            onArchive={(emailId) => {
              setSelectedEmail(undefined);
            }}
            onToggleStar={(emailId) => {
              // Toggle star logic would go here
            }}
            onClose={() => {
              setSelectedEmail(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
