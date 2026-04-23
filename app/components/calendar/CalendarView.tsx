'use client';

import * as React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  attendees?: string[];
}

interface CalendarViewProps {
  className?: string;
}

const mockEvents: CalendarEvent[] = [
  { id: '1', title: 'Réunion équipe', date: new Date(), time: '10:00', location: 'Salle A', attendees: ['Alice', 'Bob'] },
  { id: '2', title: 'Appel client', date: new Date(), time: '14:00', location: 'Téléphonique' },
  { id: '3', title: 'Presentation projet', date: new Date(), time: '16:00', location: 'Salle B', attendees: ['Team'] },
];

export function CalendarView({ className }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
  const [events, setEvents] = React.useState<CalendarEvent[]>(mockEvents);
  const [showAddEvent, setShowAddEvent] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({ title: '', time: '09:00', location: '', attendees: '' });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const selectedDateEvents = events.filter(
    (event) => selectedDate && isSameDay(event.date, selectedDate)
  );

  const addEvent = () => {
    if (!newEvent.title.trim() || !selectedDate) return;
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      location: newEvent.location,
      attendees: newEvent.attendees ? newEvent.attendees.split(',').map(a => a.trim()) : undefined,
    };
    setEvents([...events, event]);
    setNewEvent({ title: '', time: '09:00', location: '', attendees: '' });
    setShowAddEvent(false);
  };

  return (
    <div className={cn('flex h-full', className)}>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{format(currentDate, 'MMMM yyyy', { locale: fr })}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-7 gap-px bg-border border rounded-lg overflow-hidden">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
              <div
                key={day}
                className="bg-background px-2 py-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {days.map((day) => {
              const dayEvents = events.filter((event) => isSameDay(event.date, day));
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'bg-background px-2 py-2 min-h-25 text-left hover:bg-accent transition-colors',
                    !isCurrentMonth && 'text-muted-foreground/50',
                    isSelected && 'bg-accent'
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium',
                      isDayToday && 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 bg-primary/10 rounded truncate"
                      >
                        {event.time} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-80 border-l bg-background p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {selectedDate ? format(selectedDate, 'd MMMM', { locale: fr }) : 'Sélectionner une date'}
          </h3>
          <Button size="sm" onClick={() => setShowAddEvent(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Event
          </Button>
        </div>

        <div className="space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="font-medium text-sm">{event.title}</div>
                {event.time && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </div>
                )}
                {event.attendees && event.attendees.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {event.attendees.join(', ')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Aucun événement ce jour</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle>Nouvel événement</DialogTitle>
            </DialogHeader>
            <motion.div 
              className="grid gap-4 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <motion.div 
                className="grid gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Réunion équipe..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </motion.div>
              <motion.div 
                className="grid gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="time">Heure</Label>
                <Select 
                  value={newEvent.time} 
                  onValueChange={(value) => setNewEvent({ ...newEvent, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner l'heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div 
                className="grid gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Label htmlFor="location">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Salle A, Visioconférence..."
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </motion.div>
              <motion.div 
                className="grid gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="attendees">Participants</Label>
                <Input
                  id="attendees"
                  placeholder="Alice, Bob, Charlie..."
                  value={newEvent.attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                />
              </motion.div>
            </motion.div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAddEvent(false)}>Annuler</Button>
              <Button onClick={addEvent}>Ajouter</Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}