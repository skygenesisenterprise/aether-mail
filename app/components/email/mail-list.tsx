"use client";

import { ComponentProps, useEffect, useRef, useState } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import { useMail } from "@/components/email/use-mail";

interface MailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
  read: boolean;
  starred?: boolean;
  labels: string[];
  folderId?: string;
}

interface MailListProps {
  items: MailItem[];
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail();
  const prevItemsRef = useRef<Set<string>>(new Set());
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const hasMountedRef = useRef(false);

  const sortedItems = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Detect newly arrived items for animation
  useEffect(() => {
    const currentIds = new Set(sortedItems.map((item) => item.id));

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevItemsRef.current = currentIds;
      return;
    }

    const newlyArrived = sortedItems.filter(
      (item) => !prevItemsRef.current.has(item.id)
    );

    if (newlyArrived.length > 0) {
      const newIds = new Set(newlyArrived.map((item) => item.id));
      setNewItemIds((prev) => {
        const merged = new Set(prev);
        newIds.forEach((id) => merged.add(id));
        return merged;
      });

      // Remove highlight after 8 seconds
      const timeout = setTimeout(() => {
        setNewItemIds((prev) => {
          const next = new Set(prev);
          newIds.forEach((id) => next.delete(id));
          return next;
        });
      }, 8000);

      return () => clearTimeout(timeout);
    }

    prevItemsRef.current = currentIds;
  }, [items]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {sortedItems.map((item) => {
          const isNew = newItemIds.has(item.id);

          return (
            <motion.div
              key={item.id}
              initial={
                isNew
                  ? { opacity: 0, y: -12, backgroundColor: "rgba(59, 130, 246, 0.12)" }
                  : false
              }
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(59, 130, 246, 0)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <button
                className={cn(
                  "hover:bg-accent/50 flex items-start gap-3 border-b p-4 text-left transition-all w-full",
                  mail.selected === item.id && "bg-muted",
                  isNew && !mail.selected && "bg-blue-50/40 dark:bg-blue-900/15"
                )}
                onClick={() =>
                  setMail({
                    ...mail,
                    selected: item.id,
                  })
                }
              >
                <div className="flex flex-col items-center gap-1 pt-1">
                  {!item.read && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                  {item.starred && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={cn(
                          "font-semibold truncate",
                          item.read ? "text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        &lt;{item.email}&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isNew && (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0 h-4 bg-blue-600 hover:bg-blue-600"
                        >
                          Nouveau
                        </Badge>
                      )}
                      <span
                        className={cn(
                          "text-xs whitespace-nowrap",
                          mail.selected === item.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatEmailDate(item.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm truncate flex-1",
                        item.read
                          ? "text-muted-foreground"
                          : "font-medium text-foreground"
                      )}
                    >
                      {item.subject || "(No subject)"}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-xs text-muted-foreground line-clamp-1 flex-1">
                      {cleanTextPreview(item.text)}
                    </span>
                  </div>

                  {item.labels.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      {item.labels.map((label) => (
                        <Badge
                          key={label}
                          variant={getBadgeVariantFromLabel(label)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          );
        })}
        {sortedItems.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No emails
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function cleanTextPreview(text: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 200);
}

function formatEmailDate(dateStr: string): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return format(date, "HH:mm");
  }

  if (isYesterday(date)) {
    return "Hier";
  }

  if (isThisWeek(date, { locale: fr })) {
    return format(date, "EEE", { locale: fr });
  }

  return format(date, "dd/MM/yyyy");
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work", "important"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
