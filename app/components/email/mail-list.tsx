import { ComponentProps } from "react";
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { fr } from "date-fns/locale";

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
  const sortedItems = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {sortedItems.map((item) => (
          <button
            key={item.id}
            className={cn(
              "hover:bg-accent/50 flex items-start gap-3 border-b p-4 text-left transition-all",
              mail.selected === item.id && "bg-muted"
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
                  <span className={cn(
                    "font-semibold truncate",
                    item.read ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    &lt;{item.email}&gt;
                  </span>
                </div>
                <span className={cn(
                  "text-xs whitespace-nowrap",
                  mail.selected === item.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {formatEmailDate(item.date)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm truncate flex-1",
                  item.read ? "text-muted-foreground" : "font-medium text-foreground"
                )}>
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
        ))}
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

function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>["variant"] {
  if (["work", "important"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}