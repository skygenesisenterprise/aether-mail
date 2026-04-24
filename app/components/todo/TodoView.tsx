'use client';

import * as React from 'react';
import { format, isToday, isTomorrow, isPast, addDays, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Calendar, Flag, MoreVertical, Trash2, CheckSquare, Square, Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

interface TodoViewProps {
  className?: string;
}

const mockTodos: Todo[] = [
  { id: '1', title: 'Réviser le rapport mensuale', completed: false, dueDate: new Date(), priority: 'high', category: 'Travail' },
  { id: '2', title: 'Envoyer le devis client', completed: false, priority: 'medium', category: 'Travail' },
  { id: '3', title: 'Planifier réunion équipe', completed: true, dueDate: addDays(new Date(), 1), priority: 'medium', category: 'Travail' },
  { id: '4', title: 'Acheter supplies bureau', completed: false, priority: 'low', category: 'Personnel' },
  { id: '5', title: 'Appeler le plombier', completed: false, priority: 'high', category: 'Personnel' },
  { id: '6', title: 'Préparer présentation', completed: false, dueDate: addDays(new Date(), 3), priority: 'high', category: 'Travail' },
];

export function TodoView({ className }: TodoViewProps) {
  const [todos, setTodos] = React.useState<Todo[]>(mockTodos);
  const [newTodoTitle, setNewTodoTitle] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'today' | 'upcoming' | 'completed'>('all');
  const [showAddForm, setShowAddForm] = React.useState(false);

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: newTodoTitle,
      completed: false,
      priority: 'medium',
      category: 'Travail',
    };
    setTodos([...todos, newTodo]);
    setNewTodoTitle('');
    setShowAddForm(false);
  };

  const filteredTodos = todos.filter(todo => {
    if (activeFilter === 'completed') return todo.completed;
    if (activeFilter === 'today') return todo.dueDate && isToday(todo.dueDate);
    if (activeFilter === 'upcoming') return todo.dueDate && !isPast(startOfDay(todo.dueDate)) && !isToday(todo.dueDate);
    return true;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
    return 0;
  });

  const completedCount = todos.filter(t => t.completed).length;
  const todayCount = todos.filter(t => t.dueDate && isToday(t.dueDate) && !t.completed).length;
  const upcomingCount = todos.filter(t => t.dueDate && !isPast(startOfDay(t.dueDate)) && !isToday(t.dueDate) && !t.completed).length;

  return (
    <div className={cn('flex h-full', className)}>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Tâches</h2>
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Button 
                variant={activeFilter === 'all' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                Tous ({todos.length})
              </Button>
              <Button 
                variant={activeFilter === 'today' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setActiveFilter('today')}
              >
                Aujourd'hui ({todayCount})
              </Button>
              <Button 
                variant={activeFilter === 'upcoming' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setActiveFilter('upcoming')}
              >
                À venir ({upcomingCount})
              </Button>
              <Button 
                variant={activeFilter === 'completed' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setActiveFilter('completed')}
              >
                Terminées ({completedCount})
              </Button>
            </div>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle tâche
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {filteredTodos.length > 0 ? (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
                    todo.completed && 'opacity-60'
                  )}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="shrink-0"
                  >
                    {todo.completed ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      'font-medium truncate',
                      todo.completed && 'line-through text-muted-foreground'
                    )}>
                      {todo.title}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className={cn(
                        'px-1.5 py-0.5 rounded',
                        todo.priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
                        todo.priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                        todo.priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      )}>
                        {todo.priority === 'high' ? 'Haute' : todo.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                      {todo.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isToday(todo.dueDate) ? "Aujourd'hui" : 
                           isTomorrow(todo.dueDate) ? "Demain" : 
                           format(todo.dueDate, 'd MMM', { locale: fr })}
                        </span>
                      )}
                      <span>{todo.category}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="shrink-0"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Aucune tâche</p>
                <p className="text-xs">Créez une nouvelle tâche pour commencer</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="w-80 border-l bg-background p-4 overflow-auto">
        <h3 className="font-semibold mb-4">Résumé</h3>
        
        <div className="space-y-4">
          <div className="p-3 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">{todos.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2" 
                style={{ width: `${(completedCount / todos.length) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {completedCount} complétés ({todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%)
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Aujourd'hui
              </span>
              <span className="font-medium">{todayCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                À venir
              </span>
              <span className="font-medium">{upcomingCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Terminées
              </span>
              <span className="font-medium">{completedCount}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">Priorité</div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-500" />
                Haute
              </span>
              <span className="font-medium">{todos.filter(t => t.priority === 'high').length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-yellow-500" />
                Moyenne
              </span>
              <span className="font-medium">{todos.filter(t => t.priority === 'medium').length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-green-500" />
                Basse
              </span>
              <span className="font-medium">{todos.filter(t => t.priority === 'low').length}</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                placeholder="Titre de la tâche..."
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select defaultValue="Travail">
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travail">Travail</SelectItem>
                  <SelectItem value="Personnel">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Annuler</Button>
            <Button onClick={addTodo}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}