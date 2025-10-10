import type React from "react";
import { useState, useRef } from "react";
import axios from "axios";
import {
  PaperClipIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface EmailComposerProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  replyToEmail?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  initialTo = "",
  initialSubject = "",
  initialBody = "",
  isOpen = false,
  onClose,
}) => {
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [encryption, setEncryption] = useState<
    "none" | "standard" | "end-to-end"
  >("standard");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showEncryptionOptions, setShowEncryptionOptions] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [password, setPassword] = useState("");

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleEncryptionChange = (type: "none" | "standard" | "end-to-end") => {
    setEncryption(type);
    setShowEncryptionOptions(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!to.trim()) newErrors.to = "Recipient is required";
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!body.trim()) newErrors.body = "Body is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    try {
      const token = localStorage.getItem("token");

      const attachmentData = await Promise.all(
        attachments.map(async (file) => {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          return {
            filename: file.name,
            content: base64.split(",")[1],
            contentType: file.type,
          };
        }),
      );

      const payload = {
        to,
        cc: cc || undefined,
        bcc: bcc || undefined,
        subject,
        body,
        password,
        attachments: attachmentData.length > 0 ? attachmentData : undefined,
      };

      await axios.post("/api/emails", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setTo("");
      setCc("");
      setBcc("");
      setSubject("");
      setBody("");
      setAttachments([]);
      alert("Email sent successfully!");
      onClose?.();
    } catch (error) {
      console.error("Send email error:", error);
      alert("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl rounded-xl bg-proton-dark shadow-2xl border border-proton-border">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-proton-border p-6">
            <h2 className="text-xl font-semibold text-proton-text">
              New Email
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary hover:text-proton-text transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-auto max-h-[70vh]">
            <div className="p-6 space-y-6">
              {/* Recipients */}
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="to"
                    className="block text-sm font-medium text-proton-text mb-2"
                  >
                    To
                  </label>
                  <input
                    type="text"
                    id="to"
                    name="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-proton-text focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors ${
                      errors.to
                        ? "border-proton-error bg-proton-error/10"
                        : "border-proton-border bg-proton-dark"
                    }`}
                    placeholder="recipient@example.com"
                  />
                  {errors.to && (
                    <p className="mt-1 text-sm text-proton-error">
                      {errors.to}
                    </p>
                  )}
                  <button
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="mt-2 text-sm text-proton-primary hover:text-proton-accent-hover font-medium"
                  >
                    {showCcBcc ? "Hide CC/BCC" : "Add CC/BCC"}
                  </button>
                </div>

                {showCcBcc && (
                  <>
                    <div>
                      <label
                        htmlFor="cc"
                        className="block text-sm font-medium text-proton-text mb-2"
                      >
                        CC
                      </label>
                      <input
                        type="text"
                        id="cc"
                        name="cc"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="w-full rounded-lg border border-proton-border bg-proton-dark text-proton-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors"
                        placeholder="cc@example.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bcc"
                        className="block text-sm font-medium text-proton-text mb-2"
                      >
                        BCC
                      </label>
                      <input
                        type="text"
                        id="bcc"
                        name="bcc"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        className="w-full rounded-lg border border-proton-border bg-proton-dark text-proton-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors"
                        placeholder="bcc@example.com"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-proton-text mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm text-proton-text focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors ${
                    errors.subject
                      ? "border-proton-error bg-proton-error/10"
                      : "border-proton-border bg-proton-dark"
                  }`}
                  placeholder="Email subject"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-proton-error">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Password for SMTP */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-proton-text mb-2"
                >
                  Email Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-proton-border bg-proton-dark text-proton-text px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors"
                  placeholder="Your email password"
                />
              </div>

              {/* Email Body */}
              <div>
                <label
                  htmlFor="body"
                  className="block text-sm font-medium text-proton-text mb-2"
                >
                  Message
                </label>
                <textarea
                  id="body"
                  ref={bodyRef}
                  name="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={`h-64 w-full resize-none rounded-lg border px-3 py-2 text-sm text-proton-text focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors ${
                    errors.body
                      ? "border-proton-error bg-proton-error/10"
                      : "border-proton-border bg-proton-dark"
                  }`}
                  placeholder="Write your message here..."
                />
                {errors.body && (
                  <p className="mt-1 text-sm text-proton-error">
                    {errors.body}
                  </p>
                )}
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-proton-text mb-3">
                    Attachments ({attachments.length})
                  </h4>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-proton-border bg-proton-dark-tertiary"
                      >
                        <div className="flex items-center">
                          <PaperClipIcon className="h-4 w-4 text-proton-text-secondary mr-2" />
                          <span className="text-sm text-proton-text">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-proton-text-secondary hover:text-proton-text transition-colors"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
              />
            </div>
          </div>

          {/* Footer with actions */}
          <div className="border-t border-proton-border p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="inline-flex items-center px-6 py-2 rounded-lg bg-proton-primary text-white text-sm font-medium hover:bg-proton-accent-hover focus:outline-none focus:ring-2 focus:ring-proton-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {isSending ? "Sending..." : "Send Email"}
                </button>

                <div className="relative">
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-proton-border bg-proton-dark text-proton-text text-sm font-medium hover:bg-proton-dark-tertiary focus:outline-none focus:ring-2 focus:ring-proton-primary focus:ring-offset-2 transition-colors"
                    onClick={() =>
                      setShowEncryptionOptions(!showEncryptionOptions)
                    }
                  >
                    {encryption === "none" && (
                      <>
                        <LockOpenIcon className="mr-2 h-4 w-4 text-proton-text-muted" />
                        Not encrypted
                      </>
                    )}
                    {encryption === "standard" && (
                      <>
                        <LockClosedIcon className="mr-2 h-4 w-4 text-proton-primary" />
                        Standard encryption
                      </>
                    )}
                    {encryption === "end-to-end" && (
                      <>
                        <LockClosedIcon className="mr-2 h-4 w-4 text-proton-success" />
                        End-to-end encrypted
                      </>
                    )}
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </button>

                  {showEncryptionOptions && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-proton-dark shadow-xl border border-proton-border py-1">
                      <button
                        className="flex w-full items-center px-4 py-3 text-left text-sm text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
                        onClick={() => handleEncryptionChange("none")}
                      >
                        <LockOpenIcon className="mr-3 h-4 w-4 text-proton-text-muted" />
                        Not encrypted
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-3 text-left text-sm text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
                        onClick={() => handleEncryptionChange("standard")}
                      >
                        <LockClosedIcon className="mr-3 h-4 w-4 text-proton-primary" />
                        Standard encryption
                      </button>
                      <button
                        className="flex w-full items-center px-4 py-3 text-left text-sm text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
                        onClick={() => handleEncryptionChange("end-to-end")}
                      >
                        <LockClosedIcon className="mr-3 h-4 w-4 text-proton-success" />
                        End-to-end encrypted
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-proton-border bg-proton-dark text-proton-text text-sm font-medium hover:bg-proton-dark-tertiary focus:outline-none focus:ring-2 focus:ring-proton-primary focus:ring-offset-2 transition-colors"
                >
                  <PaperClipIcon className="mr-2 h-4 w-4" />
                  Attach
                </button>
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-proton-border bg-proton-dark text-proton-text text-sm font-medium hover:bg-proton-dark-tertiary focus:outline-none focus:ring-2 focus:ring-proton-primary focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
