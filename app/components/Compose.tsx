import { useState } from "react";
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
} from "lucide-react";

interface ComposeProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Compose({ isOpen = false, onClose }: ComposeProps) {
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showCc, setShowCc] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Nouveau message</h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-12">À:</span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinataire@example.com"
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        {showCc && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-12">Cc:</span>
            <input
              type="email"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="copie@example.com"
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400 w-12">Objet:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du message"
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        <div className="border-t border-gray-700 pt-3">
          <div className="flex items-center gap-1 mb-3 p-2 bg-gray-800 rounded-lg">
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Bold size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Italic size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Underline size={16} className="text-gray-400" />
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Link size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Image size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Paperclip size={16} className="text-gray-400" />
            </button>
            <button
              type="button"
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <Smile size={16} className="text-gray-400" />
            </button>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Rédigez votre message..."
            className="w-full h-64 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-gray-700">
        <button
          onClick={() => setShowCc(!showCc)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showCc ? "Masquer Cc" : "Ajouter Cc"}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Send size={16} />
            <span>Envoyer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
