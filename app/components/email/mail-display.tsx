import * as React from "react";
import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { addHours } from "date-fns";
import { format } from "date-fns";
import { nextSaturday } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
  X,
} from "lucide-react";

import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cleanEmailText, linkifyText, looksLikeMarkdown } from "@/lib/email-text-cleaner";

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
}

interface MailDisplayProps {
  mail: MailItem | null;
  onClose?: () => void;
}

function sanitizeHtml(html: string): string {
  if (!html) return "";

  let cleaned = html;

  cleaned = cleaned
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/on\w+=([^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/data:image\/svg[^;]*;base64/gi, "")
    .replace(/<meta[^>]*http-equiv=["']?refresh["']?[^>]*>/gi, "")
    .replace(/<link[^>]*>/gi, "");

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleaned, "text/html");

    const scripts = doc.querySelectorAll("script");
    scripts.forEach(s => s.remove());

    const styles = doc.querySelectorAll("style");
    styles.forEach(s => s.remove());

    const noscripts = doc.querySelectorAll("noscript");
    noscripts.forEach(ns => ns.remove());

    const iframes = doc.querySelectorAll("iframe");
    iframes.forEach(i => i.remove());

    const objects = doc.querySelectorAll("object, embed");
    objects.forEach(o => o.remove());

    const elements = doc.querySelectorAll("*");
    for (const el of elements) {
      const htmlEl = el as HTMLElement;
      const eventAttrs = ["onclick", "onload", "onerror", "onmouseover", "onmouseout", "onsubmit", "onchange", "onfocus", "onblur", "onkeydown", "onkeyup", "onkeypress"];
      for (const attr of eventAttrs) {
        if (htmlEl.hasAttribute(attr)) {
          htmlEl.removeAttribute(attr);
        }
      }
      const href = htmlEl.getAttribute("href");
      if (href && href.toLowerCase().startsWith("javascript:")) {
        htmlEl.removeAttribute("href");
      }
    }

    const images = doc.querySelectorAll("img");
    images.forEach((img) => {
      const src = img.getAttribute("src");
      if (src && src.toLowerCase().startsWith("cid:")) {
        const alt = img.getAttribute("alt") || "Embedded image";
        const placeholder = doc.createElement("span");
        placeholder.textContent = `[${alt}]`;
        placeholder.setAttribute("class", "cid-image-placeholder");
        img.replaceWith(placeholder);
      }
    });

    cleaned = doc.body.innerHTML;
  } catch {
    return cleaned;
  }

  return cleaned;
}

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  a: ({ node, ...props }) => (
    <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all" />
  ),
  code: ({ node, ...props }) => (
    <code {...props} className="bg-muted rounded px-1 py-0.5 text-xs font-mono" />
  ),
  pre: ({ node, ...props }) => (
    <pre {...props} className="bg-muted rounded p-3 overflow-auto text-xs my-2" />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote {...props} className="border-l-2 border-border pl-3 italic text-muted-foreground my-2" />
  ),
  ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-2" />,
  ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-2" />,
  h1: ({ node, ...props }) => <h1 {...props} className="text-xl font-bold my-3" />,
  h2: ({ node, ...props }) => <h2 {...props} className="text-lg font-bold my-2" />,
  h3: ({ node, ...props }) => <h3 {...props} className="text-base font-bold my-2" />,
  h4: ({ node, ...props }) => <h4 {...props} className="text-sm font-bold my-1" />,
  h5: ({ node, ...props }) => <h5 {...props} className="text-sm font-semibold my-1" />,
  h6: ({ node, ...props }) => <h6 {...props} className="text-xs font-semibold my-1" />,
  p: ({ node, ...props }) => <p {...props} className="my-1.5" />,
  table: ({ node, ...props }) => (
    <table {...props} className="w-full border-collapse my-2 text-xs" />
  ),
  th: ({ node, ...props }) => (
    <th {...props} className="border border-border px-2 py-1 font-semibold bg-muted text-left" />
  ),
  td: ({ node, ...props }) => (
    <td {...props} className="border border-border px-2 py-1" />
  ),
  hr: ({ node, ...props }) => <hr {...props} className="border-border my-3" />,
};

function MailDisplayContent({ mail, onClose }: MailDisplayProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sanitizedHtml = useMemo(() => {
    if (!mail?.html) return null;
    const cleaned = sanitizeHtml(mail.html);
    const textContent = cleaned.replace(/<[^>]+>/g, "").replace(/\s/g, "");
    if (!textContent) return null;
    return cleaned;
  }, [mail?.html]);

  const cleanedText = useMemo(() => {
    if (!mail?.text) return "";
    return cleanEmailText(mail.text);
  }, [mail?.text]);

  const linkedText = useMemo(() => {
    if (!cleanedText) return "";
    return linkifyText(cleanedText);
  }, [cleanedText]);

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
          <Button variant="ghost" size="icon" disabled={!mail} title="Archive">
            <Archive className="h-4 w-4" />
            <span className="sr-only">Archive</span>
          </Button>
          <Button variant="ghost" size="icon" disabled={!mail} title="Move to junk">
            <ArchiveX className="h-4 w-4" />
            <span className="sr-only">Move to junk</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={!mail} 
            title="Move to trash"
            className="text-destructive hover:text-destructive focus-visible:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Move to trash</span>
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!mail} title="Snooze">
                <Clock className="h-4 w-4" />
                <span className="sr-only">Snooze</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto p-0">
              <div className="flex flex-col gap-2 border-r px-2 py-4">
                <div className="px-4 text-sm font-medium">Snooze until</div>
                <div className="grid min-w-62.5 gap-1">
                  <Button variant="ghost" className="justify-start font-normal">
                    Later today{" "}
                    <span className="text-muted-foreground ml-auto">
                      {format(addHours(selectedDate, 4), "E, h:mm b")}
                    </span>
                  </Button>
                  <Button variant="ghost" className="justify-start font-normal">
                    Tomorrow
                    <span className="text-muted-foreground ml-auto">
                      {format(addDays(selectedDate, 1), "E, h:mm b")}
                    </span>
                  </Button>
                  <Button variant="ghost" className="justify-start font-normal">
                    This weekend
                    <span className="text-muted-foreground ml-auto">
                      {format(nextSaturday(selectedDate), "E, h:mm b")}
                    </span>
                  </Button>
                  <Button variant="ghost" className="justify-start font-normal">
                    Next week
                    <span className="text-muted-foreground ml-auto">
                      {format(addDays(selectedDate, 7), "E, h:mm b")}
                    </span>
                  </Button>
                </div>
              </div>
              <div className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  classNames={{ today: "bg-none" }}
                  required
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled={!mail} title="Reply">
            <Reply className="h-4 w-4" />
            <span className="sr-only">Reply</span>
          </Button>
          <Button variant="ghost" size="icon" disabled={!mail} title="Reply all">
            <ReplyAll className="h-4 w-4" />
            <span className="sr-only">Reply all</span>
          </Button>
          <Button variant="ghost" size="icon" disabled={!mail} title="Forward">
            <Forward className="h-4 w-4" />
            <span className="sr-only">Forward</span>
          </Button>
        </div>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!mail}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      {mail ? (
        <div className="flex flex-1 flex-col">
          <div className="flex items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <Avatar>
                <AvatarImage alt={mail.name} />
                <AvatarFallback>
                  {mail.name
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <div className="font-semibold">{mail.name}</div>
                <div className="line-clamp-1 text-xs">{mail.subject}</div>
                <div className="line-clamp-1 text-xs">
                  <span className="font-medium">Reply-To:</span> {mail.email}
                </div>
              </div>
            </div>
            {mail.date && (
              <div className="text-muted-foreground ml-auto text-xs">
                {format(new Date(mail.date), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          {sanitizedHtml ? (
            <div 
              className="flex-1 p-4 text-sm overflow-auto email-content"
              style={{ maxWidth: '100%', overflowX: 'hidden' }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
            />
          ) : (
            <div className="flex-1 p-4 text-sm overflow-auto email-content">
              {looksLikeMarkdown(cleanedText) ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {cleanedText}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap wrap-break-words" dangerouslySetInnerHTML={{ __html: linkedText }} />
              )}
            </div>
          )}
          <Separator className="mt-auto" />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <Textarea className="p-4" placeholder={`Reply ${mail.name}...`} />
                <div className="flex items-center">
                  <Label htmlFor="mute" className="flex items-center gap-2 text-xs font-normal">
                    <Switch id="mute" aria-label="Mute thread" /> Mute this thread
                  </Label>
                  <Button onClick={(e) => e.preventDefault()} size="sm" className="ml-auto">
                    Send
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground p-8 text-center">No message selected</div>
      )}
    </div>
  );
}

export const MailDisplay = React.memo(MailDisplayContent);
