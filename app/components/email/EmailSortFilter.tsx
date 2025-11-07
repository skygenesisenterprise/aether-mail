import type React from "react";
import { useState } from "react";
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useEmailStore, type SortField, type FilterType } from "../../store/emailStore";

const EmailSortFilter: React.FC = () => {
  const { sortField, sortOrder, filter, toggleSort, setFilter } = useEmailStore();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const sortOptions: { field: SortField; label: string }[] = [
    { field: "date", label: "Date" },
    { field: "from", label: "From" },
    { field: "subject", label: "Subject" },
    { field: "size", label: "Size" },
  ];

  const filterOptions: { type: FilterType; label: string }[] = [
    { type: "all", label: "All" },
    { type: "unread", label: "Unread" },
    { type: "read", label: "Read" },
    { type: "starred", label: "Starred" },
    { type: "attachments", label: "With attachments" },
  ];

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
      <div className="text-xs text-tertiary font-medium">
        {useEmailStore.getState().getFilteredAndSortedEmails().length} emails
      </div>
      
      <div className="flex gap-2">
        {/* Filter Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            className={`btn-ghost text-xs p-2 flex items-center gap-1 ${
              filter !== "all" ? "bg-gray-800 text-blue-400" : ""
            }`}
            aria-label="Filter emails"
          >
            <FunnelIcon className="h-4 w-4" />
            {filter !== "all" && (
              <span className="text-xs">{filterOptions.find((f) => f.type === filter)?.label}</span>
            )}
          </button>
          
          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 min-w-[180px] z-20">
                {filterOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => {
                      setFilter(option.type);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      filter === option.type
                        ? "bg-gray-700 text-blue-400"
                        : "text-secondary hover:bg-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sort Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            className="btn-ghost text-xs p-2 flex items-center gap-1"
            aria-label="Sort emails"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
            <ChevronDownIcon className="h-3 w-3" />
          </button>
          
          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 min-w-[180px] z-20">
                {sortOptions.map((option) => (
                  <button
                    key={option.field}
                    onClick={() => {
                      toggleSort(option.field);
                      setShowSortMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                      sortField === option.field
                        ? "bg-gray-700 text-blue-400"
                        : "text-secondary hover:bg-gray-700"
                    }`}
                  >
                    <span>{option.label}</span>
                    {sortField === option.field && (
                      <span className="text-xs">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailSortFilter;





