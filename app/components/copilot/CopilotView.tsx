'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Mail, 
  Calendar, 
  FileText, 
  Zap, 
  Copy, 
  RefreshCw,
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CopilotViewProps {
  className?: string;
}

const quickActions = [
  { id: '1', title: 'Rédiger un email', description: 'Créer un email professionnel', icon: Mail },
  { id: '2', title: 'Résumer', description: 'Résumer des emails ou documents', icon: FileText },
  { id: '3', title: 'Planifier', description: 'Créer un événement calendrier', icon: Calendar },
  { id: '4', title: 'Analyser', description: 'Analyser des données ou tendances', icon: Zap },
];

const suggestedPrompts = [
  "Résumer mes emails d'hier",
  "Créer un email de suivi pour ma réunion",
  "Quelles sont mes tâches prioritaires aujourd'hui ?",
  "Préparer un compte-rendu de réunion",
  "Rédiger une réponse à un client mécontent",
  "Extraire les accións de mon inbox cette semaine",
];

export function CopilotView({ className }: CopilotViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const [chatHistory, setChatHistory] = React.useState<{id: string, title: string, preview: string}[]>([
    { id: '1', title: 'Résumé des emails', preview: 'Voici un résumé de vos emails...' },
    { id: '2', title: 'Planification semaine', preview: 'Voici votre planning estimé...' },
  ]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAssistantResponse(content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAssistantResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('résumer') || lowerQuery.includes('summar')) {
      return "Voici un résumé de vos emails récents:\n\n• 3 nouveaux emails non lus\n• 2 emails importants nécessitant une réponse\n• 1 invitation à une réunion\n\nVoulez-vous que je详细 davantage ?";
    }
    if (lowerQuery.includes('tâche') || lowerQuery.includes('todo')) {
      return "Vos tâches prioritaires aujourd'hui:\n\n1. Réviser le rapport - Haute priorité\n2. Envoyer le devis client - Moyenne priorité\n3. Préparer la présentation - Haute priorité\n\nVoulez-vous que je vous aide à les compléter ?";
    }
    if (lowerQuery.includes('email') || lowerQuery.includes('mail')) {
      return "Je peux vous aider à rédiger un email. Veuillez me préciser:\n• Le destinataire\n• L'objet\n• Le ton souhaité (professionnel, informel,etc.)\n\nOu souhaitez-vous que je suggère un modèle ?";
    }
    return "Je suis là pour vous aider! Je peux:\n• Résumer vos emails et documents\n• Rédiger des emails et réponses\n• Planifier des tâches et réunions\n• Analyser vos données\n\nQue souhaitez-vous faire ?";
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <div className={cn('flex h-full', className)}>
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold">Copilot</h2>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground px-2 py-2">RACCORDIS</div>
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className="w-full text-left px-2 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="text-sm font-medium truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground truncate">{chat.preview}</div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">Copilot</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Bonjour! Je suis Copilot</h3>
                <p className="text-muted-foreground">Votre assistant IA pour être plus productif</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.description)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="w-full max-w-md">
                <p className="text-sm text-muted-foreground mb-3">Essayer de demander:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(prompt)}
                      className="px-3 py-1.5 rounded-full bg-muted hover:bg-accent text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'assistant' 
                      ? 'bg-linear-to-br from-purple-500 to-pink-500' 
                      : 'bg-muted'
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-xs font-medium">Vous</span>
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[70%] rounded-lg p-3',
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-muted'
                  )}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Posez une question à Copilot..."
              className="min-h-15 pr-12 resize-none"
            />
            <Button
              size="icon"
              className="absolute bottom-2 right-2"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Copilot peut fare des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  );
}