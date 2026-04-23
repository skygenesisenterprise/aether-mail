import * as React from "react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Contact } from "@/components/email/data";
import { useContacts } from "@/components/contacts/use-contacts";

interface ContactListProps {
  items: Contact[];
}

export function ContactList({ items }: ContactListProps) {
  const [contact, setContact] = useContacts();

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <button
            key={item.email}
            className={cn(
              "hover:bg-accent hover:text-accent-foreground flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
              contact.selected === item.email && "bg-muted"
            )}
            onClick={() =>
              setContact({
                selected: item.email,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{item.name}</div>
              </div>
              <div className="text-xs text-muted-foreground">{item.email}</div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}