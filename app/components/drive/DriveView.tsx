'use client';

import * as React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Folder, File, FileText, Image, Video, Music, Archive, 
  Search, Grid, List, MoreVertical, Trash2, Download, 
  Share2, Star, Clock, HardDrive, Upload, Plus, Home, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'image' | 'video' | 'audio' | 'archive';
  mimeType?: string;
  size?: number;
  modifiedAt: Date;
  starred: boolean;
  parentId: string | null;
}

interface DriveViewProps {
  className?: string;
}

const mockFiles: DriveFile[] = [
  { id: '1', name: 'Documents', type: 'folder', modifiedAt: new Date(), starred: true, parentId: null },
  { id: '2', name: 'Images', type: 'folder', modifiedAt: new Date(), starred: false, parentId: null },
  { id: '3', name: 'Projects', type: 'folder', modifiedAt: new Date(), starred: true, parentId: null },
  { id: '4', name: 'Rapport_2024.pdf', type: 'file', size: 2457600, modifiedAt: new Date(), starred: false, parentId: '1' },
  { id: '5', name: 'Presentation.pptx', type: 'file', size: 5242880, modifiedAt: new Date(), starred: false, parentId: '1' },
  { id: '6', name: ' family.jpg', type: 'image', size: 1536000, modifiedAt: new Date(), starred: true, parentId: '2' },
  { id: '7', name: 'vacances.png', type: 'image', size: 2048000, modifiedAt: new Date(), starred: false, parentId: '2' },
  { id: '8', name: 'Meeting.mp4', type: 'video', size: 104857600, modifiedAt: new Date(), starred: false, parentId: '3' },
  { id: '9', name: 'backup.zip', type: 'archive', size: 52428800, modifiedAt: new Date(), starred: false, parentId: '3' },
];

export function DriveView({ className }: DriveViewProps) {
  const [files, setFiles] = React.useState<DriveFile[]>(mockFiles);
  const [currentFolder, setCurrentFolder] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = React.useState('');

  const currentFiles = files.filter(file => file.parentId === currentFolder && file.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const breadcrumb = getBreadcrumb(currentFolder);

  function getBreadcrumb(folderId: string | null): DriveFile[] {
    const breadcrumb: DriveFile[] = [];
    let current = folderId;
    while (current) {
      const folder = files.find(f => f.id === current);
      if (folder) {
        breadcrumb.unshift(folder);
        current = folder.parentId;
      } else {
        break;
      }
    }
    return breadcrumb;
  }

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolder(folderId);
  };

  const toggleStar = (fileId: string) => {
    setFiles(files.map(f => f.id === fileId ? { ...f, starred: !f.starred } : f));
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} Go`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'folder': return <Folder className="h-10 w-10 text-blue-500" />;
      case 'image': return <Image className="h-10 w-10 text-green-500" />;
      case 'video': return <Video className="h-10 w-10 text-purple-500" />;
      case 'audio': return <Music className="h-10 w-10 text-pink-500" />;
      case 'archive': return <Archive className="h-10 w-10 text-yellow-500" />;
      default: return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  const starredCount = files.filter(f => f.starred).length;
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className={cn('flex h-full', className)}>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Drive</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <button 
                onClick={() => navigateToFolder(null)}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <HardDrive className="h-4 w-4" />
                Mon Drive
              </button>
              {breadcrumb.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  <ChevronRight className="h-4 w-4" />
                  <button 
                    onClick={() => navigateToFolder(folder.id)}
                    className="hover:text-foreground"
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Nouveau
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
          <div className="flex items-center gap-1 bg-muted rounded-md p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {currentFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {currentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => file.type === 'folder' && navigateToFolder(file.id)}
                  >
                    <div className="relative">
                      {getFileIcon(file.type)}
                      {file.starred && (
                        <Star className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <div className="text-center text-sm font-medium truncate w-full">
                      {file.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(file.modifiedAt, { addSuffix: true, locale: fr })}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}>
                        <Star className={cn("h-4 w-4", file.starred && "fill-yellow-500 text-yellow-500")} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                  <div className="col-span-6">Nom</div>
                  <div className="col-span-2">Modifié</div>
                  <div className="col-span-2">Taille</div>
                  <div className="col-span-2"></div>
                </div>
                {currentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="group grid grid-cols-12 gap-2 px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer items-center"
                    onClick={() => file.type === 'folder' && navigateToFolder(file.id)}
                  >
                    <div className="col-span-6 flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <span className="truncate">{file.name}</span>
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {format(file.modifiedAt, 'd MMM yyyy', { locale: fr })}
                    </div>
                    <div className="col-span-2 text-sm text-muted-foreground">
                      {formatSize(file.size)}
                    </div>
                    <div className="col-span-2 opacity-0 group-hover:opacity-100 flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleStar(file.id); }}>
                        <Star className={cn("h-4 w-4", file.starred && "fill-yellow-500 text-yellow-500")} />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Folder className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm font-medium">Aucun fichier</p>
              <p className="text-xs">Importer ou créer un nouveau fichier</p>
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="w-72 border-l bg-background p-4 overflow-auto">
        <h3 className="font-semibold mb-4">Stockage</h3>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Utilisé</span>
              <span className="text-lg font-bold">{formatSize(totalSize)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${Math.min((totalSize / (15 * 1024 * 1024 * 1024)) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              15 Go disponibles
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigateToFolder(null)}>
              <HardDrive className="h-4 w-4 mr-2" />
              Mon Drive
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              Favoris
              <span className="ml-auto text-xs">{starredCount}</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              Récents
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Corbeille
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}