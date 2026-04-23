'use client';

import * as React from 'react';
import {
  X,
  Send,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmailEditorProps {
  onClose: () => void;
}

export function EmailEditor({ onClose }: EmailEditorProps) {
  const [to, setTo] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const handleSend = async () => {
    if (!to || !subject) return;
    setIsSending(true);
    console.log('Sending email to:', to, 'subject:', subject);
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="font-semibold">New Email</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full"
          />
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full"
          />
        </div>

        <Textarea
          placeholder="Write your message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="min-h-75 w-full resize-none"
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSend} disabled={isSending || !to || !subject}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
          <Button variant="ghost" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}