'use client';

import * as React from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const selectedDateEvents = events.filter(
    (event) => selectedDate && isSameDay(event.date, selectedDate)
  );

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
                    'bg-background px-2 py-2 min-h-[100px] text-left hover:bg-accent transition-colors',
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau
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
    </div>
  );
}