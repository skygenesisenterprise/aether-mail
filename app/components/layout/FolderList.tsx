import type React from "react";
import { Link, useParams } from "react-router-dom";
import { useEmailStore } from "../../store/emailStore";

const FolderList: React.FC = () => {
  const { folders } = useEmailStore();
  const { folder } = useParams<{ folder: string }>();

  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
        Folders
      </h2>
      <ul className="space-y-2">
        {folders.map((f) => (
          <li key={f}>
            <Link
              to={`/${f.toLowerCase()}`}
              className={`block rounded px-3 py-2 text-sm transition ${
                folder === f.toLowerCase()
                  ? "bg-aether-primary text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {f}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FolderList;
