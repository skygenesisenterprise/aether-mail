import {
  Archive,
  ArchiveX,
  MoreVertical,
  Trash2,
  Star,
  X,
} from "lucide-react";

import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Contact } from "@/components/email/data";

interface ContactDisplayProps {
  contact: Contact | null;
  onClose?: () => void;
}

export function ContactDisplay({ contact, onClose }: ContactDisplayProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} title="Fermer">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={!contact} title="Archive">
            <Archive className="h-4 w-4" />
            <span className="sr-only">Archive</span>
          </Button>
          <Button variant="ghost" size="icon" disabled={!contact} title="Move to junk">
            <ArchiveX className="h-4 w-4" />
            <span className="sr-only">Move to junk</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={!contact} 
            title="Move to trash"
            className="text-destructive hover:text-destructive focus-visible:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Move to trash</span>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="icon" disabled={!contact} title="Add to favorites">
            <Star className="h-4 w-4" />
            <span className="sr-only">Add to favorites</span>
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!contact}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit contact</DropdownMenuItem>
            <DropdownMenuItem>Add to favorites</DropdownMenuItem>
            <DropdownMenuItem>Delete contact</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {contact ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar className="h-16 w-16">
                <AvatarImage alt={contact.name} />
                <AvatarFallback>
                  {contact.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="text-xl font-semibold">{contact.name}</div>
                <div className="line-clamp-1 text-xs text-muted-foreground">{contact.email}</div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex-1 p-4 text-sm">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Email</div>
                <div className="text-sm">{contact.email}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Phone</div>
                <div className="text-sm text-muted-foreground">-</div>
              </div>
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Address</div>
                <div className="text-sm text-muted-foreground">-</div>
              </div>
              <div className="grid gap-2">
                <div className="text-xs font-medium text-muted-foreground">Notes</div>
                <div className="text-sm text-muted-foreground">-</div>
              </div>
            </div>
          </div>
          <Separator className="mt-auto" />
          <div className="p-4">
            <div className="flex gap-2">
              <Button className="flex-1">Send Email</Button>
              <Button variant="outline" className="flex-1">Call</Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground p-8 text-center">No contact selected</div>
      )}
    </div>
  );
}