import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Paperclip,
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Eye,
} from "lucide-react";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
}

type ComposeMode = "new" | "reply" | "replyAll" | "forward";

interface ComposeProps {
  isOpen?: boolean;
  onClose?: () => void;
  mode?: ComposeMode;
  originalEmail?: Email;
}

interface Recipient {
  id: string;
  email: string;
  name?: string;
}

export default function Compose({
  isOpen,
  onClose,
  mode = "new",
  originalEmail,
}: ComposeProps) {
  const [to, setTo] = useState<Recipient[]>([]);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions d'emails pour la démo
  const emailSuggestions = [
    { id: "1", email: "jean.dupont@example.com", name: "Jean Dupont" },
    { id: "2", email: "marie.martin@example.com", name: "Marie Martin" },
    { id: "3", email: "lucas.bernard@example.com", name: "Lucas Bernard" },
    {
      id: "4",
      email: "support@skygenesisenterprise.com",
      name: "Support Technique",
    },
    { id: "5", email: "team@aether-mail.com", name: "Équipe Aether Mail" },
  ];

  useEffect(() => {
    if (isOpen && originalEmail && mode !== "new") {
      switch (mode) {
        case "reply":
          setTo([
            {
              id: "reply-1",
              email: originalEmail.fromEmail,
              name: originalEmail.from,
            },
          ]);
          setSubject(`Re: ${originalEmail.subject}`);
          setBody(
            `\n\n---\nLe ${originalEmail.date}, ${originalEmail.from} <${originalEmail.fromEmail}> a écrit :\n${originalEmail.body.replace(/<[^>]*>/g, "")}`,
          );
          break;
        case "replyAll":
          setTo([
            {
              id: "reply-all-1",
              email: originalEmail.fromEmail,
              name: originalEmail.from,
            },
          ]);
          setSubject(`Re: ${originalEmail.subject}`);
          setBody(
            `\n\n---\nLe ${originalEmail.date}, ${originalEmail.from} <${originalEmail.fromEmail}> a écrit :\n${originalEmail.body.replace(/<[^>]*>/g, "")}`,
          );
          setShowCc(true);
          break;
        case "forward":
          setTo([]);
          setSubject(`Fwd: ${originalEmail.subject}`);
          setBody(
            `\n\n--- Message transféré ---\nDe: ${originalEmail.from} <${originalEmail.fromEmail}>\nDate: ${originalEmail.date}\nObjet: ${originalEmail.subject}\n\n${originalEmail.body.replace(/<[^>]*>/g, "")}`,
          );
          break;
      }
    } else if (mode === "new") {
      setTo([]);
      setCc([]);
      setBcc([]);
      setSubject("");
      setBody("");
      setShowCc(false);
      setShowBcc(false);
      setAttachments([]);
      setIsPreview(false);
    }
  }, [isOpen, mode, originalEmail]);

  // Charger le brouillon au montage si c'est un nouveau message
  useEffect(() => {
    if (isOpen && mode === "new") {
      loadDraft();
    }
  }, [isOpen, mode]);

  const addRecipient = (
    email: string,
    name?: string,
    type: "to" | "cc" | "bcc" = "to",
  ) => {
    const recipient = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
    };

    switch (type) {
      case "to":
        if (!to.find((r) => r.email === email)) {
          setTo([...to, recipient]);
        }
        setToInput("");
        break;
      case "cc":
        if (!cc.find((r) => r.email === email)) {
          setCc([...cc, recipient]);
        }
        setCcInput("");
        break;
      case "bcc":
        if (!bcc.find((r) => r.email === email)) {
          setBcc([...bcc, recipient]);
        }
        setBccInput("");
        break;
    }
    setShowToSuggestions(false);
  };

  const removeRecipient = (id: string, type: "to" | "cc" | "bcc") => {
    switch (type) {
      case "to":
        setTo(to.filter((r) => r.id !== id));
        break;
      case "cc":
        setCc(cc.filter((r) => r.id !== id));
        break;
      case "bcc":
        setBcc(bcc.filter((r) => r.id !== id));
        break;
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const saveDraft = () => {
    const draft = {
      to,
      cc,
      bcc,
      subject,
      body,
      attachments: attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      timestamp: new Date().toISOString(),
    };

    // Sauvegarder dans localStorage pour la démo
    localStorage.setItem("aether-mail-draft", JSON.stringify(draft));
    setDraftSaved(true);

    // Masquer l'indication après 3 secondes
    setTimeout(() => setDraftSaved(false), 3000);

    console.log("Brouillon sauvegardé:", draft);
  };

  const loadDraft = () => {
    const savedDraft = localStorage.getItem("aether-mail-draft");
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      setTo(draft.to || []);
      setCc(draft.cc || []);
      setBcc(draft.bcc || []);
      setSubject(draft.subject || "");
      setBody(draft.body || "");
      // Note: les fichiers ne peuvent pas être restaurés depuis localStorage pour des raisons de sécurité
      console.log("Brouillon chargé");
    }
  };

  const filteredSuggestions = emailSuggestions.filter(
    (suggestion) =>
      suggestion.email.toLowerCase().includes(toInput.toLowerCase()) ||
      suggestion.name.toLowerCase().includes(toInput.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* En-tête du compose */}
      <div className="bg-gradient-to-r from-card to-muted border-b border-border">
        <div className="flex items-center justify-between p-4">
          <h3 className="text-lg font-semibold text-card-foreground">
            {mode === "new" && "Nouveau message"}
            {mode === "reply" && "Répondre"}
            {mode === "replyAll" && "Répondre à tous"}
            {mode === "forward" && "Transférer"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Corps du compose */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 space-y-4 flex-shrink-0">
          {/* Section destinataires */}
          <div className="space-y-3">
            {/* Champ À */}
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <span className="text-sm font-medium text-muted-foreground w-12">
                À:
              </span>
              <div className="flex-1 flex flex-wrap items-center gap-2">
                {to.map((recipient) => (
                  <div
                    key={recipient.id}
                    className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-md text-sm"
                  >
                    <span>{recipient.name || recipient.email}</span>
                    <button
                      onClick={() => removeRecipient(recipient.id, "to")}
                      className="p-0.5 hover:bg-blue-600/30 rounded"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onFocus={() => setShowToSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && toInput) {
                      e.preventDefault();
                      addRecipient(toInput);
                    }
                  }}
                  placeholder={
                    to.length === 0 ? "Ajouter des destinataires..." : ""
                  }
                  className="flex-1 bg-transparent text-card-foreground outline-none placeholder-muted-foreground min-w-[200px]"
                />
              </div>
              <button
                onClick={() => setShowCc(!showCc)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Cc
              </button>
              <button
                onClick={() => setShowBcc(!showBcc)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Cci
              </button>
            </div>

            {/* Suggestions d'emails */}
            {showToSuggestions && toInput && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.email}
                    onClick={() =>
                      addRecipient(suggestion.email, suggestion.name)
                    }
                    className="p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="text-sm font-medium text-white">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {suggestion.email}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Champ Cc */}
            {showCc && (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-sm font-medium text-gray-400 w-12">
                  Cc:
                </span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {cc.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-md text-sm"
                    >
                      <span>{recipient.name || recipient.email}</span>
                      <button
                        onClick={() => removeRecipient(recipient.id, "cc")}
                        className="p-0.5 hover:bg-green-600/30 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && ccInput) {
                        e.preventDefault();
                        addRecipient(ccInput, undefined, "cc");
                      }
                    }}
                    placeholder="Ajouter des destinataires en copie..."
                    className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Champ Cci */}
            {showBcc && (
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <span className="text-sm font-medium text-gray-400 w-12">
                  Cci:
                </span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {bcc.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-sm"
                    >
                      <span>{recipient.name || recipient.email}</span>
                      <button
                        onClick={() => removeRecipient(recipient.id, "bcc")}
                        className="p-0.5 hover:bg-purple-600/30 rounded"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={bccInput}
                    onChange={(e) => setBccInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && bccInput) {
                        e.preventDefault();
                        addRecipient(bccInput, undefined, "bcc");
                      }
                    }}
                    placeholder="Ajouter des destinataires en copie cachée..."
                    className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Champ Objet */}
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <span className="text-sm font-medium text-gray-400 w-12">
              Objet:
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet du message"
              className="flex-1 bg-transparent text-white outline-none placeholder-gray-500"
            />
          </div>

          {/* Barre d'outils d'édition */}
          <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg border border-border/30">
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Gras"
            >
              <Bold size={16} className="text-muted-foreground" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Italique"
            >
              <Italic size={16} className="text-muted-foreground" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Souligné"
            >
              <Underline size={16} className="text-muted-foreground" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Aligner à gauche"
            >
              <AlignLeft size={16} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Centrer"
            >
              <AlignCenter size={16} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Aligner à droite"
            >
              <AlignRight size={16} className="text-gray-400" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Liste à puces"
            >
              <List size={16} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Liste numérotée"
            >
              <ListOrdered size={16} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Citation"
            >
              <Quote size={16} className="text-gray-400" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Code"
            >
              <Code size={16} className="text-gray-400" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Lien"
            >
              <Link size={16} className="text-muted-foreground" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Image"
            >
              <Image size={16} className="text-muted-foreground" />
            </button>
            <button
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Émoji"
            >
              <Smile size={16} className="text-muted-foreground" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1"></div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title="Pièce jointe"
            >
              <Paperclip size={16} className="text-gray-400" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Pièces jointes */}
          {attachments.length > 0 && (
            <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={16} className="text-muted-foreground" />
                <span className="text-sm text-gray-300">
                  {attachments.length} pièce{attachments.length > 1 ? "s" : ""}{" "}
                  jointe{attachments.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-700/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                        <Paperclip size={14} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                    >
                      <X size={14} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zone de texte ou aperçu - prend tout l'espace restant */}
        <div className="flex-1 p-6 pt-0">
          {!isPreview ? (
            <div className="relative h-full">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Rédigez votre message..."
                className="w-full h-full bg-muted/50 text-card-foreground rounded-lg p-4 border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground"
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {body.length} caractères
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                {/* En-tête de l'aperçu */}
                <div className="mb-6 pb-4 border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {subject || "Sans objet"}
                  </h2>
                  <div className="space-y-2 text-sm">
                    {to.length > 0 && (
                      <div>
                        <span className="text-gray-400">À: </span>
                        <span className="text-gray-300">
                          {to.map((r) => r.name || r.email).join(", ")}
                        </span>
                      </div>
                    )}
                    {cc.length > 0 && (
                      <div>
                        <span className="text-gray-400">Cc: </span>
                        <span className="text-gray-300">
                          {cc.map((r) => r.name || r.email).join(", ")}
                        </span>
                      </div>
                    )}
                    {bcc.length > 0 && (
                      <div>
                        <span className="text-gray-400">Cci: </span>
                        <span className="text-gray-300">
                          {bcc.map((r) => r.name || r.email).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Corps du message */}
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {body || "Le message est vide..."}
                  </div>
                </div>

                {/* Pièces jointes */}
                {attachments.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">
                      Pièces jointes ({attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 bg-gray-700/50 rounded"
                        >
                          <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center">
                            <Paperclip size={14} className="text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="p-4 border-t border-border bg-gradient-to-r from-card to-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              {draftSaved && <span className="text-green-400">✓</span>}
              Enregistrer brouillon
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Eye size={14} />
              {isPreview ? "Éditer" : "Aperçu"}
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-card-foreground transition-colors"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-colors">
              <Send size={16} />
              <span>Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
