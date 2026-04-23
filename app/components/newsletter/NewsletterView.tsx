'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Rss, Plus, Search, ExternalLink, Star, MoreVertical, 
  Trash2, RefreshCw, Globe, Calendar, Clock, Tag, Archive,
  CheckCircle, Circle, ArrowUpRight
} from 'lucide-react';

interface Feed {
  id: string;
  name: string;
  url: string;
  icon?: string;
  unreadCount: number;
  lastUpdated: Date;
}

interface Article {
  id: string;
  feedId: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  publishedAt: Date;
  read: boolean;
  starred: boolean;
  author?: string;
}

interface NewsletterViewProps {
  className?: string;
}

const mockFeeds: Feed[] = [
  { id: '1', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', unreadCount: 12, lastUpdated: new Date() },
  { id: '2', name: 'Le Monde', url: 'https://www.lemonde.fr/rss/feed.xml', unreadCount: 8, lastUpdated: new Date() },
  { id: '3', name: 'Hacker News', url: 'https://hnrss.org/frontpage', unreadCount: 25, lastUpdated: new Date() },
  { id: '4', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', unreadCount: 5, lastUpdated: new Date() },
];

const mockArticles: Article[] = [
  { id: '1', feedId: '1', title: 'AI Startup Raises $100M in Series B', summary: 'A leading AI company has raised a massive round of funding to accelerate its development of autonomous agents.', url: '#', publishedAt: new Date(), read: false, starred: true, author: 'Sarah Johnson' },
  { id: '2', feedId: '1', title: 'New iPhone Features Leaked', summary: 'Apple\'s next generation iPhone rumored to include groundbreaking AI features and improved camera system.', url: '#', publishedAt: new Date(), read: false, starred: false, author: 'Mark Chen' },
  { id: '3', feedId: '2', title: 'Climate Summit Reaches Historic Agreement', summary: 'World leaders have agreed on a new framework to combat climate change with ambitious targets.', url: '#', publishedAt: new Date(), read: false, starred: false, author: 'Pierre Dubois' },
  { id: '4', feedId: '3', title: 'Show HN: I built a weather app in 100 lines', summary: 'A hacker shares their minimal weather application built with just 100 lines of code.', url: '#', publishedAt: new Date(), read: true, starred: false },
  { id: '5', feedId: '3', title: 'Ask HN: What\'s your favorite dev tool?', summary: 'The Hacker News community shares their most beloved developer tools and utilities.', url: '#', publishedAt: new Date(), read: true, starred: true },
  { id: '6', feedId: '4', title: 'Review: The Best Laptop of 2024', summary: 'We tested the top laptops of the year to find the perfect balance of power and portability.', url: '#', publishedAt: new Date(), read: false, starred: false },
];

export function NewsletterView({ className }: NewsletterViewProps) {
  const [feeds, setFeeds] = React.useState<Feed[]>(mockFeeds);
  const [articles, setArticles] = React.useState<Article[]>(mockArticles);
  const [selectedFeed, setSelectedFeed] = React.useState<string | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = React.useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showAddFeed, setShowAddFeed] = React.useState(false);
  const [newFeedUrl, setNewFeedUrl] = React.useState('');
  const [newFeedName, setNewFeedName] = React.useState('');

  const filteredArticles = articles.filter(article => {
    const matchesFeed = selectedFeed === 'all' || article.feedId === selectedFeed;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeed && matchesSearch;
  });

  const unreadCounts = selectedFeed === 'all' 
    ? articles.filter(a => !a.read).length 
    : articles.filter(a => a.feedId === selectedFeed && !a.read).length;

  const selectArticle = (article: Article) => {
    setSelectedArticle(article);
    setArticles(articles.map(a => a.id === article.id ? { ...a, read: true } : a));
    setFeeds(feeds.map(f => {
      const feedArticles = articles.filter(a => a.feedId === f.id && !a.read);
      if (feedArticles.length > 0) return { ...f, unreadCount: feedArticles.length - 1 };
      return f;
    }));
  };

  const toggleStar = (articleId: string) => {
    setArticles(articles.map(a => a.id === articleId ? { ...a, starred: !a.starred } : a));
  };

  const markAllRead = () => {
    setArticles(articles.map(a => ({ ...a, read: true })));
    setFeeds(feeds.map(f => ({ ...f, unreadCount: 0 })));
  };

  const addFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;
    const newFeed: Feed = {
      id: Date.now().toString(),
      name: newFeedName,
      url: newFeedUrl,
      unreadCount: 0,
      lastUpdated: new Date(),
    };
    setFeeds([...feeds, newFeed]);
    setNewFeedName('');
    setNewFeedUrl('');
    setShowAddFeed(false);
  };

  const deleteFeed = (feedId: string) => {
    setFeeds(feeds.filter(f => f.id !== feedId));
    setArticles(articles.filter(a => a.feedId !== feedId));
    if (selectedFeed === feedId) setSelectedFeed('all');
  };

  const selectedFeedData = feeds.find(f => f.id === selectedFeed);

  return (
    <div className={cn('flex h-full', className)}>
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Rss className="h-4 w-4 text-orange-500" />
              <h2 className="font-semibold text-sm">Flux RSS</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowAddFeed(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <button
              onClick={() => setSelectedFeed('all')}
              className={cn(
                'w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors',
                selectedFeed === 'all' ? 'bg-accent' : 'hover:bg-accent/50'
              )}
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Tous les flux</span>
              </div>
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {articles.filter(a => !a.read).length}
              </span>
            </button>

            <Separator className="my-2" />

            {feeds.map((feed) => (
              <div key={feed.id} className="group">
                <button
                  onClick={() => setSelectedFeed(feed.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors',
                    selectedFeed === feed.id ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Rss className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="text-sm truncate">{feed.name}</span>
                  </div>
                  {feed.unreadCount > 0 && (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {feed.unreadCount}
                    </span>
                  )}
                </button>
                <div className="hidden group-hover:flex gap-1 px-2 pb-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => window.open(feed.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-destructive"
                    onClick={() => deleteFeed(feed.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">
              {selectedFeed === 'all' ? 'Tous les articles' : selectedFeedData?.name || 'Flux RSS'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {unreadCounts} non lus
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Tout marquer comme lu
            </Button>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-3 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input 
              placeholder="Rechercher..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredArticles.length > 0 ? (
            <div className="divide-y">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => selectArticle(article)}
                  className={cn(
                    'flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors cursor-pointer',
                    !article.read && 'bg-accent/20'
                  )}
                >
                  {article.read ? (
                    <Circle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={cn(
                          'font-medium truncate',
                          !article.read && 'font-semibold'
                        )}>
                          {article.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {article.summary}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {article.starred && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); toggleStar(article.id); }}
                        >
                          <Star className={cn("h-4 w-4", article.starred && "fill-yellow-500 text-yellow-500")} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(article.publishedAt, { addSuffix: true, locale: fr })}
                      </span>
                      {article.author && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {article.author}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Rss className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">Aucun article</p>
              <p className="text-xs">Abonnez-vous à des flux RSS pour recevoir leurs articles</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {selectedArticle && (
        <div className="w-100 border-l bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toggleStar(selectedArticle.id)}>
                <Star className={cn("h-4 w-4", selectedArticle.starred && "fill-yellow-500 text-yellow-500")} />
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => window.open(selectedArticle.url, '_blank')}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <h1 className="text-xl font-semibold">{selectedArticle.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(selectedArticle.publishedAt, 'PPp', { locale: fr })}
              </span>
              {selectedArticle.author && (
                <span className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {selectedArticle.author}
                </span>
              )}
            </div>
            <Separator className="my-4" />
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p>{selectedArticle.summary}</p>
              {selectedArticle.content && <div className="mt-4" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />}
            </div>
          </ScrollArea>
        </div>
      )}

      <Dialog open={showAddFeed} onOpenChange={setShowAddFeed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un flux RSS</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du flux</Label>
              <Input
                id="name"
                placeholder="ex: TechCrunch"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL du flux</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddFeed(false)}>Annuler</Button>
            <Button onClick={addFeed}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}