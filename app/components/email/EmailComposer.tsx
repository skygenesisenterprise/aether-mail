import React from "react";
import { useState, useRef } from "react";
import {
  PaperClipIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface EmailComposerProps {
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  replyToEmail?: boolean;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  initialTo = "",
  initialSubject = "",
  initialBody = "",
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

  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const handleEncryptionChange = (type: "none" | "standard" | "end-to-end") => {
    setEncryption(type);
    setShowEncryptionOptions(false);
  };

  return (
    <div className="flex h-full flex-col border-l border-gray-200 dark:border-gray-700">
      <div className="flex-1 overflow-auto p-4">
        {/* Recipients */}
        <div className="space-y-3">
          <div className="flex items-center">
            <label
              htmlFor="to"
              className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              To:
            </label>
            <input
              type="text"
              id="to"
              name="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-md p-2 border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="Recipients"
            />
            <button
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="ml-2 text-sm text-aether-primary"
            >
              {showCcBcc ? "Hide" : "Cc/Bcc"}
            </button>
          </div>

          {showCcBcc && (
            <>
              <div className="flex items-center">
                <label
                  htmlFor="cc"
                  className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cc:
                </label>
                <input
                  type="text"
                  id="cc"
                  name="cc"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="w-full rounded-md p-2 border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Carbon copy recipients"
                />
              </div>

              <div className="flex items-center">
                <label
                  htmlFor="bcc"
                  className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Bcc:
                </label>
                <input
                  type="text"
                  id="bcc"
                  name="bcc"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  className="w-full rounded-md p-2 border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Blind carbon copy recipients"
                />
              </div>
            </>
          )}
        </div>

        {/* Subject */}
        <div className="mt-4">
          <input
            type="text"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md p-2 border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Subject"
          />
        </div>

        {/* Email Body */}
        <div className="mt-4">
          <textarea
            ref={bodyRef}
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="h-64 w-full resize-none rounded-md p-2 border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            placeholder="Write your message here..."
          />
        </div>
      </div>

      {/* Footer with actions */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex space-x-2">
            <button className="inline-flex items-center rounded-md bg-aether-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aether-accent focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900">
              Send
            </button>

            <div className="relative">
              <button
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                onClick={() => setShowEncryptionOptions(!showEncryptionOptions)}
              >
                {encryption === "none" && (
                  <>
                    <LockOpenIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                    Not encrypted
                  </>
                )}
                {encryption === "standard" && (
                  <>
                    <LockClosedIcon className="mr-1.5 h-4 w-4 text-aether-primary" />
                    Standard encryption
                  </>
                )}
                {encryption === "end-to-end" && (
                  <>
                    <LockClosedIcon className="mr-1.5 h-4 w-4 text-green-600" />
                    End-to-end encrypted
                  </>
                )}
                <ChevronDownIcon className="ml-1.5 h-4 w-4" />
              </button>

              {showEncryptionOptions && (
                <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => handleEncryptionChange("none")}
                    >
                      <LockOpenIcon className="mr-3 h-4 w-4 text-gray-500" />
                      Not encrypted
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => handleEncryptionChange("standard")}
                    >
                      <LockClosedIcon className="mr-3 h-4 w-4 text-aether-primary" />
                      Standard encryption
                    </button>
                    <button
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => handleEncryptionChange("end-to-end")}
                    >
                      <LockClosedIcon className="mr-3 h-4 w-4 text-green-600" />
                      End-to-end encrypted
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <button className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <PaperClipIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailComposer;
