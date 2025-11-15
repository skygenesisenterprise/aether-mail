import {
  Mail,
  Send,
  FileText,
  Trash2,
  Archive,
  Star,
  Search,
  Settings,
  Plus,
} from "lucide-react";

interface SidebarProps {
  selectedFolder?: string;
  onFolderSelect?: (folder: string) => void;
  onCompose?: () => void;
}

export default function Sidebar({
  selectedFolder = "inbox",
  onFolderSelect,
  onCompose,
}: SidebarProps) {
  const folders = [
    { id: "inbox", name: "Boîte de réception", icon: Mail, count: 12 },
    { id: "sent", name: "Envoyés", icon: Send, count: 0 },
    { id: "drafts", name: "Brouillons", icon: FileText, count: 3 },
    { id: "starred", name: "Suivis", icon: Star, count: 5 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
    { id: "trash", name: "Corbeille", icon: Trash2, count: 0 },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-4">
        <button
          type="button"
          onClick={onCompose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Nouveau message</span>
        </button>
      </div>

      <div className="px-4 pb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
      </div>

      <nav className="flex-1 px-2">
        {folders.map((folder) => {
          const Icon = folder.icon;
          const isActive = selectedFolder === folder.id;

          return (
            <button
              type="button"
              key={folder.id}
              onClick={() => onFolderSelect?.(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="text-sm font-medium">{folder.name}</span>
              </div>
              {folder.count > 0 && (
                <span className="bg-gray-700 text-gray-300 text-xs rounded-full px-2 py-1">
                  {folder.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Paramètres</span>
        </button>
      </div>
    </div>
  );
}
