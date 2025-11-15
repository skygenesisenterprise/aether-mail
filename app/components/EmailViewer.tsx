import { useState } from "react";
import {
  Reply,
  ReplyAll,
  Forward,
  Star,
  Archive,
  Trash2,
  MoreVertical,
  Download,
  Mail,
  Paperclip,
} from "lucide-react";

interface EmailViewerProps {
  emailId?: string;
}

export default function EmailViewer({ emailId }: EmailViewerProps) {
  const [isStarred, setIsStarred] = useState(false);

  if (!emailId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-gray-600" />
          </div>
          <p className="text-lg font-medium">Sélectionnez un e-mail</p>
          <p className="text-sm mt-2">
            Choisissez un e-mail dans la liste pour afficher son contenu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">
            Réunion projet Aether
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStarred(!isStarred)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Star
                size={18}
                className={
                  isStarred
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-400"
                }
              />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Archive size={18} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Trash2 size={18} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">J</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">Jean Dupont</h3>
                  <span className="text-sm text-gray-400">
                    &lt;jean.dupont@example.com&gt;
                  </span>
                </div>
                <div className="text-sm text-gray-400">À: moi</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">Aujourd'hui, 14:30</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {true && (
            <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <Paperclip size={16} />
                <span>2 pièces jointes</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">PDF</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">rapport-projet.pdf</p>
                      <p className="text-xs text-gray-400">2.4 MB</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Download size={16} className="text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-white">XLS</span>
                    </div>
                    <div>
                      <p className="text-sm text-white">budget-2024.xlsx</p>
                      <p className="text-xs text-gray-400">856 KB</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                    <Download size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 leading-relaxed">Bonjour,</p>
            <p className="text-gray-200 leading-relaxed">
              Je voulais confirmer notre réunion de demain concernant le
              développement de l'interface Aether Mail. Voici les points que
              nous devrons aborder :
            </p>
            <ul className="text-gray-200 list-disc list-inside space-y-2">
              <li>Validation du design final de l'interface</li>
              <li>Intégration de l'API backend existante</li>
              <li>Gestion de l'authentification et des sessions</li>
              <li>
                Implémentation des fonctionnalités principales (envoi,
                réception, recherche)
              </li>
            </ul>
            <p className="text-gray-200 leading-relaxed">
              J'ai préparé quelques mockups que je vous présenterai lors de la
              réunion. Vous trouverez également en pièce jointe le rapport
              d'avancement du projet.
            </p>
            <p className="text-gray-200 leading-relaxed">
              N'hésitez pas à me faire savoir si vous avez des questions ou si
              vous souhaitez ajouter des points à l'ordre du jour.
            </p>
            <p className="text-gray-200 leading-relaxed">À demain,</p>
            <p className="text-gray-200 leading-relaxed">Jean</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
            <Reply size={16} />
            <span>Répondre</span>
          </button>
          <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
            <ReplyAll size={16} />
            <span>Répondre à tous</span>
          </button>
          <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
            <Forward size={16} />
            <span>Transférer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
