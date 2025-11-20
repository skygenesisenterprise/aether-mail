import { useState, useEffect, useRef, useCallback } from "react";
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
  Maximize2,
  Minimize2,
  Type,
  Palette,
  Hash,
  AtSign,
  Users,
  Clock,
  Zap,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  CheckCircle,
  AlertCircle,
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
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left",
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Suggestions d'emails génériques
  const emailSuggestions = [
    { id: "1", email: "contact@example.com", name: "Contact" },
    { id: "2", email: "info@example.com", name: "Info" },
    { id: "3", email: "support@example.com", name: "Support" },
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

  const sendEmail = () => {
    // Validation basique
    if (to.length === 0) {
      alert("Veuillez ajouter au moins un destinataire");
      return;
    }
    if (!subject.trim()) {
      alert("Veuillez ajouter un objet");
      return;
    }
    if (!body.trim()) {
      alert("Veuillez rédiger un message");
      return;
    }

    const email = {
      id: Date.now().toString(),
      to: to.map((r) => r.email).join(", "),
      cc: cc.map((r) => r.email).join(", "),
      bcc: bcc.map((r) => r.email).join(", "),
      subject,
      body,
      attachments: attachments.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      timestamp: new Date().toISOString(),
    };

    // Simuler l'envoi
    console.log("Email envoyé:", email);

    // Sauvegarder dans les emails envoyés (pour la démo)
    const sentEmails = JSON.parse(
      localStorage.getItem("aether-mail-sent") || "[]",
    );
    sentEmails.push(email);
    localStorage.setItem("aether-mail-sent", JSON.stringify(sentEmails));

    // Afficher une confirmation
    alert("Email envoyé avec succès !");

    // Fermer la fenêtre de composition
    onClose?.();
  };

  // Calcul du nombre de mots
  useEffect(() => {
    const words = body
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [body]);

  // Gestion de la sélection de texte
  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.substring(start, end);
    setSelectedText(selected);
  }, [body]);

  // Fonctions améliorées pour la barre d'outils
  const formatText = useCallback(
    (command: string, value?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = body.substring(start, end);
      let newText = "";

      switch (command) {
        case "bold":
          newText = `**${selectedText || "texte en gras"}**`;
          setIsBold(!isBold);
          break;
        case "italic":
          newText = `*${selectedText || "texte en italique"}*`;
          setIsItalic(!isItalic);
          break;
        case "underline":
          newText = `__${selectedText || "texte souligné"}__`;
          setIsUnderline(!isUnderline);
          break;
        case "link": {
          const url = prompt("Entrez l'URL:");
          if (url) {
            newText = `[${selectedText || "Lien"}](${url})`;
          }
          break;
        }
        case "list":
          newText = `\n• ${selectedText || "Élément de liste"}`;
          break;
        case "orderedList":
          newText = `\n1. ${selectedText || "Premier élément"}`;
          break;
        case "quote":
          newText = `> ${selectedText || "Citation"}`;
          break;
        case "code":
          newText = `\`${selectedText || "code"}\``;
          break;
        case "heading":
          newText = `\n## ${selectedText || "Titre"}`;
          break;
        default:
          return;
      }

      const newBody = body.substring(0, start) + newText + body.substring(end);
      setBody(newBody);

      // Repositionner le curseur
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + newText.length,
          start + newText.length,
        );
      }, 0);
    },
    [body, isBold, isItalic, isUnderline],
  );

  const insertEmoji = () => {
    const emojis = ["😀", "😊", "😎", "👍", "❤️", "🎉", "🔥", "✨", "🚀", "💯"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newBody = body.substring(0, start) + emoji + body.substring(start);
    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
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

  // Améliorer les suggestions avec recherche floue et fréquence
  const getEnhancedSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];

    const inputLower = input.toLowerCase();
    return emailSuggestions
      .map((suggestion) => ({
        ...suggestion,
        score: suggestion.name.toLowerCase().startsWith(inputLower)
          ? 3
          : suggestion.email.toLowerCase().startsWith(inputLower)
            ? 2
            : suggestion.name.toLowerCase().includes(inputLower)
              ? 1
              : suggestion.email.toLowerCase().includes(inputLower)
                ? 1
                : 0,
      }))
      .filter((suggestion) => suggestion.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, []);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "Enter":
            e.preventDefault();
            sendEmail();
            break;
          case "s":
            e.preventDefault();
            saveDraft();
            break;
          case "b":
            e.preventDefault();
            formatText("bold");
            break;
          case "i":
            e.preventDefault();
            formatText("italic");
            break;
          case "u":
            e.preventDefault();
            formatText("underline");
            break;
          case "k":
            e.preventDefault();
            formatText("link");
            break;
        }
      }

      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, formatText, sendEmail, saveDraft]);

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

          {/* Barre d'outils d'édition améliorée */}
          <div className="flex items-center gap-1 p-3 bg-muted/30 rounded-lg border border-border/30">
            {/* Formatage de texte */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => formatText("bold")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${isBold ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Gras (Ctrl+B)"
              >
                <Bold
                  size={16}
                  className={isBold ? "text-primary" : "text-muted-foreground"}
                />
              </button>
              <button
                onClick={() => formatText("italic")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${isItalic ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Italique (Ctrl+I)"
              >
                <Italic
                  size={16}
                  className={
                    isItalic ? "text-primary" : "text-muted-foreground"
                  }
                />
              </button>
              <button
                onClick={() => formatText("underline")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${isUnderline ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Souligné (Ctrl+U)"
              >
                <Underline
                  size={16}
                  className={
                    isUnderline ? "text-primary" : "text-muted-foreground"
                  }
                />
              </button>
              <button
                onClick={() => formatText("heading")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Titre"
              >
                <Type size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-2"></div>

            {/* Alignement */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTextAlign("left")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${textAlign === "left" ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Aligner à gauche"
              >
                <AlignLeft
                  size={16}
                  className={
                    textAlign === "left"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              </button>
              <button
                onClick={() => setTextAlign("center")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${textAlign === "center" ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Centrer"
              >
                <AlignCenter
                  size={16}
                  className={
                    textAlign === "center"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              </button>
              <button
                onClick={() => setTextAlign("right")}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${textAlign === "right" ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Aligner à droite"
              >
                <AlignRight
                  size={16}
                  className={
                    textAlign === "right"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }
                />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-2"></div>

            {/* Listes et éléments */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => formatText("list")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Liste à puces"
              >
                <List size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => formatText("orderedList")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Liste numérotée"
              >
                <ListOrdered size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => formatText("quote")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Citation"
              >
                <Quote size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => formatText("code")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Code"
              >
                <Code size={16} className="text-muted-foreground" />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-2"></div>

            {/* Médias et liens */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => formatText("link")}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Lien (Ctrl+K)"
              >
                <Link size={16} className="text-muted-foreground" />
              </button>
              <button
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Insérer une image"
              >
                <ImageIcon size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${showEmojiPicker ? "bg-primary/20 text-primary shadow-sm" : "hover:bg-muted"}`}
                title="Émoji"
              >
                <Smile
                  size={16}
                  className={
                    showEmojiPicker ? "text-primary" : "text-muted-foreground"
                  }
                />
              </button>
            </div>

            <div className="w-px h-6 bg-border mx-2"></div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Pièce jointe"
              >
                <Paperclip size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Raccourcis clavier"
              >
                <Zap size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-muted rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Plein écran"
              >
                {isFullscreen ? (
                  <Minimize2 size={16} className="text-muted-foreground" />
                ) : (
                  <Maximize2 size={16} className="text-muted-foreground" />
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Sélecteur d'émojis */}
          {showEmojiPicker && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-8 gap-2">
                {[
                  "😀",
                  "😊",
                  "😎",
                  "👍",
                  "❤️",
                  "🎉",
                  "🔥",
                  "✨",
                  "🚀",
                  "💯",
                  "😂",
                  "🥰",
                  "😍",
                  "🤔",
                  "👏",
                  "🎯",
                  "💡",
                  "🌟",
                  "⭐",
                  "🔔",
                  "📧",
                  "📎",
                  "📁",
                  "📊",
                ].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      const textarea = textareaRef.current;
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const newBody =
                          body.substring(0, start) +
                          emoji +
                          body.substring(start);
                        setBody(newBody);
                        setShowEmojiPicker(false);
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(
                            start + emoji.length,
                            start + emoji.length,
                          );
                        }, 0);
                      }
                    }}
                    className="p-2 hover:bg-muted rounded text-lg transition-colors transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Raccourcis clavier */}
          {showShortcuts && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Zap size={14} />
                Raccourcis clavier
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gras:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+B
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Italique:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+I
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Souligné:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+U
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lien:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+K
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envoyer:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brouillon:</span>
                  <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs">
                    Ctrl+S
                  </kbd>
                </div>
              </div>
            </div>
          )}

          {/* Pièces jointes améliorées */}
          {attachments.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Paperclip size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {attachments.length} pièce
                    {attachments.length > 1 ? "s" : ""} jointe
                    {attachments.length > 1 ? "s" : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (
                    {(
                      attachments.reduce(
                        (total, file) => total + file.size,
                        0,
                      ) /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB)
                  </span>
                </div>
                <button
                  onClick={() => setAttachments([])}
                  className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                >
                  Tout supprimer
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {attachments.map((file, index) => {
                  const getFileIcon = (type: string) => {
                    if (type.startsWith("image/"))
                      return <ImageIcon size={16} className="text-green-500" />;
                    if (type.startsWith("video/"))
                      return <Film size={16} className="text-purple-500" />;
                    if (type.startsWith("audio/"))
                      return <Music size={16} className="text-pink-500" />;
                    if (type.includes("pdf") || type.includes("document"))
                      return <FileText size={16} className="text-blue-500" />;
                    if (type.includes("zip") || type.includes("rar"))
                      return <Archive size={16} className="text-orange-500" />;
                    return (
                      <Paperclip size={16} className="text-muted-foreground" />
                    );
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/30 hover:bg-background/70 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <span>•</span>
                            <span>{file.type || "Type inconnu"}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="p-2 hover:bg-destructive/20 rounded-lg transition-all duration-200 text-destructive hover:text-destructive/80 opacity-0 group-hover:opacity-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Zone de texte ou aperçu - prend tout l'espace restant */}
        <div className="flex-1 p-6 pt-0">
          {!isPreview ? (
            <div className="relative h-full">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Rédigez votre message..."
                className="w-full h-full bg-muted/50 text-card-foreground rounded-lg p-4 border border-border/50 resize-none focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground"
                style={{
                  fontWeight: isBold ? "bold" : "normal",
                  fontStyle: isItalic ? "italic" : "normal",
                  textDecoration: isUnderline ? "underline" : "none",
                  textAlign: textAlign,
                }}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Type size={12} />
                  <span>{wordCount} mots</span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash size={12} />
                  <span>{body.length} caractères</span>
                </div>
                {isComposing && (
                  <div className="flex items-center gap-1 text-primary">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>En cours d'écriture...</span>
                  </div>
                )}
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

      {/* Barre d'actions améliorée */}
      <div className="p-4 border-t border-border bg-gradient-to-r from-card to-muted">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className={`text-sm transition-all duration-200 flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                draftSaved
                  ? "text-green-400 bg-green-500/10 hover:bg-green-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {draftSaved ? (
                <>
                  <CheckCircle size={14} />
                  <span>Brouillon enregistré</span>
                </>
              ) : (
                <>
                  <Clock size={14} />
                  <span>Enregistrer brouillon</span>
                </>
              )}
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50"
            >
              <Eye size={14} />
              <span>{isPreview ? "Éditer" : "Aperçu"}</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {to.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {to.length} destinataire{to.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-muted/50 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={sendEmail}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-primary/25"
              >
                <Send size={16} />
                <span>Envoyer</span>
                {to.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-primary-foreground/20 rounded-full text-xs">
                    {to.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
