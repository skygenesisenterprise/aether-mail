"use client";

import { useState, useMemo } from "react";
import SidebarNav from "../components/SidebarNav";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Link,
  CheckSquare,
  X,
  AlertCircle,
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: "meeting" | "call" | "webinar" | "task";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  organizer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  participants: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: "accepted" | "declined" | "tentative" | "pending";
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  isRecurring?: boolean;
  priority?: "low" | "medium" | "high";
  tags?: string[];
}

interface CalendarDay {
  date: Date;
  meetings: Meeting[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "list">(
    "week",
  );
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Données de démonstration pour les réunions
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "1",
      title: "Réunion d'équipe - Sprint Planning",
      description:
        "Planification du prochain sprint et revue des tâches en cours",
      startTime: new Date(2024, 11, 6, 10, 0),
      endTime: new Date(2024, 11, 6, 11, 30),
      type: "meeting",
      status: "scheduled",
      isVirtual: true,
      meetingLink: "https://meet.aether.mail/sprint-planning",
      organizer: {
        id: "1",
        name: "Jean Dupont",
        email: "jean.dupont@aether.mail",
        avatar: "/avatars/jean.jpg",
      },
      participants: [
        {
          id: "2",
          name: "Marie Martin",
          email: "marie.martin@aether.mail",
          status: "accepted",
        },
        {
          id: "3",
          name: "Pierre Bernard",
          email: "pierre.bernard@aether.mail",
          status: "tentative",
        },
      ],
      documents: [
        {
          id: "1",
          name: "Sprint_Backlog.pdf",
          type: "pdf",
          url: "/docs/sprint-backlog.pdf",
        },
      ],
      priority: "high",
      tags: ["sprint", "planning", "équipe"],
    },
    {
      id: "2",
      title: "Appel client - Projet Aether",
      description: "Discussion des besoins et avancement du projet",
      startTime: new Date(2024, 11, 6, 14, 0),
      endTime: new Date(2024, 11, 6, 15, 0),
      type: "call",
      status: "scheduled",
      isVirtual: true,
      meetingLink: "https://meet.aether.mail/client-aether",
      organizer: {
        id: "1",
        name: "Jean Dupont",
        email: "jean.dupont@aether.mail",
      },
      participants: [
        {
          id: "4",
          name: "Sophie Laurent",
          email: "sophie.laurent@aether.mail",
          status: "accepted",
        },
      ],
      priority: "medium",
      tags: ["client", "projet", "commercial"],
    },
    {
      id: "3",
      title: "Review technique - API Gateway",
      description: "Revue de l'architecture et optimisation des performances",
      startTime: new Date(2024, 11, 7, 9, 0),
      endTime: new Date(2024, 11, 7, 10, 30),
      type: "meeting",
      status: "scheduled",
      location: "Salle de réunion A",
      isVirtual: false,
      organizer: {
        id: "5",
        name: "Thomas Robert",
        email: "thomas.robert@aether.mail",
      },
      participants: [
        {
          id: "1",
          name: "Jean Dupont",
          email: "jean.dupont@aether.mail",
          status: "accepted",
        },
        {
          id: "6",
          name: "Alice Petit",
          email: "alice.petit@aether.mail",
          status: "pending",
        },
      ],
      priority: "high",
      tags: ["technique", "api", "architecture"],
    },
  ]);

  // Filtrer les réunions selon la recherche
  const filteredMeetings = useMemo(() => {
    if (!searchQuery) return meetings;

    const query = searchQuery.toLowerCase();
    return meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(query) ||
        meeting.description?.toLowerCase().includes(query) ||
        meeting.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
        meeting.participants.some((p) => p.name.toLowerCase().includes(query)),
    );
  }, [meetings, searchQuery]);

  // Générer les jours du calendrier pour la vue mois
  const generateCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayMeetings = filteredMeetings.filter(
        (meeting) => meeting.startTime.toDateString() === date.toDateString(),
      );

      days.push({
        date,
        meetings: dayMeetings,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: date.toDateString() === selectedDate.toDateString(),
      });
    }

    return days;
  }, [currentDate, filteredMeetings, selectedDate]);

  // Obtenir les réunions pour la vue semaine
  const getWeekMeetings = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return weekDays.map((date) => ({
      date,
      meetings: filteredMeetings.filter(
        (meeting) => meeting.startTime.toDateString() === date.toDateString(),
      ),
    }));
  }, [currentDate, filteredMeetings]);

  // Navigation dans le temps
  const navigatePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() - 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() - 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case "list":
        newDate.setDate(newDate.getDate() - 7);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "day":
        newDate.setDate(newDate.getDate() + 1);
        break;
      case "week":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "month":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case "list":
        newDate.setDate(newDate.getDate() + 7);
        break;
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Formater l'heure
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtenir la couleur selon le type de réunion
  const getMeetingTypeColor = (type: Meeting["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500";
      case "call":
        return "bg-green-500";
      case "webinar":
        return "bg-purple-500";
      case "task":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  // Obtenir l'icône selon le type de réunion
  const getMeetingTypeIcon = (type: Meeting["type"]) => {
    switch (type) {
      case "meeting":
        return Users;
      case "call":
        return Video;
      case "webinar":
        return Video;
      case "task":
        return CheckSquare;
      default:
        return Calendar;
    }
  };

  // Rendu de la vue mois
  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
      {/* En-têtes des jours */}
      {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day) => (
        <div
          key={day}
          className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground"
        >
          {day}
        </div>
      ))}

      {/* Jours du mois */}
      {generateCalendarDays.map((day, index) => (
        <div
          key={index}
          className={`bg-background min-h-[100px] p-2 cursor-pointer transition-colors hover:bg-muted/50 ${
            !day.isCurrentMonth ? "opacity-50" : ""
          } ${day.isToday ? "bg-primary/5" : ""} ${
            day.isSelected ? "bg-primary/10" : ""
          }`}
          onClick={() => setSelectedDate(day.date)}
        >
          <div className="flex justify-between items-start mb-1">
            <span
              className={`text-sm font-medium ${
                day.isToday ? "text-primary" : "text-foreground"
              }`}
            >
              {day.date.getDate()}
            </span>
            {day.meetings.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {day.meetings.length}
              </Badge>
            )}
          </div>
          <div className="space-y-1">
            {day.meetings.slice(0, 3).map((meeting) => {
              const Icon = getMeetingTypeIcon(meeting.type);
              return (
                <div
                  key={meeting.id}
                  className="flex items-center gap-1 text-xs p-1 rounded bg-muted/50 truncate cursor-pointer hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMeeting(meeting);
                  }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getMeetingTypeColor(meeting.type)}`}
                  />
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{meeting.title}</span>
                </div>
              );
            })}
            {day.meetings.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{day.meetings.length - 3} plus
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Rendu de la vue semaine
  const renderWeekView = () => (
    <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
      {/* Colonne des heures */}
      <div className="bg-muted">
        <div className="h-12 border-b border-border" />
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="h-20 border-b border-border p-2 text-xs text-muted-foreground"
          >
            {8 + i}:00
          </div>
        ))}
      </div>

      {/* Jours de la semaine */}
      {getWeekMeetings.map(({ date, meetings }, dayIndex) => (
        <div key={dayIndex} className="bg-background min-h-[600px]">
          {/* En-tête du jour */}
          <div className="h-12 border-b border-border p-2 text-center">
            <div className="text-sm font-medium">
              {date.toLocaleDateString("fr-FR", { weekday: "short" })}
            </div>
            <div className="text-xs text-muted-foreground">
              {date.getDate()}{" "}
              {date.toLocaleDateString("fr-FR", { month: "short" })}
            </div>
          </div>

          {/* Créneaux horaires et réunions */}
          <div className="relative">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-20 border-b border-border/50" />
            ))}

            {/* Réunions du jour */}
            {meetings.map((meeting) => {
              const startHour = meeting.startTime.getHours();
              const startMinute = meeting.startTime.getMinutes();
              const endHour = meeting.endTime.getHours();
              const endMinute = meeting.endTime.getMinutes();

              const top = (startHour - 8) * 80 + (startMinute / 60) * 80;
              const height =
                (endHour - startHour) * 80 +
                ((endMinute - startMinute) / 60) * 80;

              if (meeting.startTime.toDateString() === date.toDateString()) {
                const Icon = getMeetingTypeIcon(meeting.type);
                return (
                  <div
                    key={meeting.id}
                    className={`absolute left-1 right-1 ${getMeetingTypeColor(meeting.type)} bg-opacity-20 border border-current rounded-lg p-2 cursor-pointer hover:bg-opacity-30 transition-colors`}
                    style={{ top: `${top}px`, height: `${height}px` }}
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Icon className="w-3 h-3" />
                      <span className="text-xs font-medium truncate">
                        {formatTime(meeting.startTime)} - {meeting.title}
                      </span>
                    </div>
                    {meeting.participants.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="text-xs">
                          {meeting.participants.length + 1}
                        </span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      ))}
    </div>
  );

  // Rendu de la vue jour
  const renderDayView = () => {
    const dayMeetings = filteredMeetings.filter(
      (meeting) =>
        meeting.startTime.toDateString() === selectedDate.toDateString(),
    );

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium">
            {selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {dayMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Calendar vide pour cette journée
              </CardContent>
            </Card>
          ) : (
            dayMeetings.map((meeting) => {
              const Icon = getMeetingTypeIcon(meeting.type);
              return (
                <Card
                  key={meeting.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${getMeetingTypeColor(meeting.type)} bg-opacity-20`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(meeting.startTime)} -{" "}
                            {formatTime(meeting.endTime)}
                          </p>
                          {meeting.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {meeting.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {meeting.isVirtual && meeting.meetingLink && (
                              <div className="flex items-center gap-1">
                                <Video className="w-4 h-4" />
                                <span>Visio</span>
                              </div>
                            )}
                            {meeting.location && !meeting.isVirtual && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>
                                {meeting.participants.length + 1} participants
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {meeting.priority === "high" && (
                          <Badge variant="destructive">Haute</Badge>
                        )}
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Rendu de la vue liste
  const renderListView = () => {
    const sortedMeetings = [...filteredMeetings].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime(),
    );

    return (
      <div className="space-y-4">
        {sortedMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucune réunion prévue
            </CardContent>
          </Card>
        ) : (
          sortedMeetings.map((meeting) => {
            const Icon = getMeetingTypeIcon(meeting.type);
            return (
              <Card
                key={meeting.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedMeeting(meeting)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${getMeetingTypeColor(meeting.type)} bg-opacity-20`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {meeting.startTime.toLocaleDateString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          • {formatTime(meeting.startTime)} -{" "}
                          {formatTime(meeting.endTime)}
                        </p>
                        {meeting.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {meeting.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {meeting.isVirtual && meeting.meetingLink && (
                            <div className="flex items-center gap-1">
                              <Video className="w-4 h-4" />
                              <span>Visio</span>
                            </div>
                          )}
                          {meeting.location && !meeting.isVirtual && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{meeting.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {meeting.participants.length + 1} participants
                            </span>
                          </div>
                        </div>
                        {meeting.tags && meeting.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {meeting.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.status === "in-progress" && (
                        <Badge variant="default">En cours</Badge>
                      )}
                      {meeting.status === "completed" && (
                        <Badge variant="secondary">Terminée</Badge>
                      )}
                      {meeting.priority === "high" && (
                        <Badge variant="destructive">Haute</Badge>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };

  // Panneau droit - Détails de la réunion
  const renderMeetingDetails = () => {
    if (!selectedMeeting) {
      return (
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-medium mb-4">Détails de la réunion</h3>
            <Button className="w-full" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle réunion
            </Button>
          </div>

          <div className="flex-1 p-6">
            <div className="text-center text-muted-foreground space-y-4">
              <Calendar className="w-12 h-12 mx-auto opacity-50" />
              <p>Sélectionnez une réunion pour voir les détails</p>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">Réunions à venir</p>
                {filteredMeetings
                  .filter((m) => m.startTime > new Date())
                  .slice(0, 3)
                  .map((meeting) => (
                    <div
                      key={meeting.id}
                      className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors text-left"
                      onClick={() => setSelectedMeeting(meeting)}
                    >
                      <p className="font-medium text-sm">{meeting.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meeting.startTime.toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const Icon = getMeetingTypeIcon(selectedMeeting.type);

    return (
      <div className="h-full flex flex-col">
        {/* En-tête */}
        <div className="p-6 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${getMeetingTypeColor(selectedMeeting.type)} bg-opacity-20`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{selectedMeeting.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedMeeting.startTime.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedMeeting(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-2">
            {selectedMeeting.status === "scheduled" && (
              <Button className="flex-1">
                <Video className="w-4 h-4 mr-2" />
                Rejoindre
              </Button>
            )}
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
            <Button variant="outline">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div>
              <h4 className="font-medium mb-3">Informations</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {formatTime(selectedMeeting.startTime)} -{" "}
                    {formatTime(selectedMeeting.endTime)}
                  </span>
                </div>
                {selectedMeeting.isVirtual && selectedMeeting.meetingLink && (
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-muted-foreground" />
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Rejoindre la visioconférence
                    </Button>
                  </div>
                )}
                {selectedMeeting.location && !selectedMeeting.isVirtual && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedMeeting.location}</span>
                  </div>
                )}
                {selectedMeeting.priority && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <Badge
                      variant={
                        selectedMeeting.priority === "high"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      Priorité{" "}
                      {selectedMeeting.priority === "high"
                        ? "haute"
                        : selectedMeeting.priority === "medium"
                          ? "moyenne"
                          : "basse"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedMeeting.description && (
              <div>
                <h4 className="font-medium mb-3">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedMeeting.description}
                </p>
              </div>
            )}

            {/* Participants */}
            <div>
              <h4 className="font-medium mb-3">
                Participants ({selectedMeeting.participants.length + 1})
              </h4>
              <div className="space-y-2">
                {/* Organisateur */}
                <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedMeeting.organizer.avatar} />
                    <AvatarFallback>
                      {selectedMeeting.organizer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {selectedMeeting.organizer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMeeting.organizer.email}
                    </p>
                  </div>
                  <Badge variant="secondary">Organisateur</Badge>
                </div>

                {/* Autres participants */}
                {selectedMeeting.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-2"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {participant.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        participant.status === "accepted"
                          ? "default"
                          : participant.status === "declined"
                            ? "destructive"
                            : participant.status === "tentative"
                              ? "secondary"
                              : "outline"
                      }
                    >
                      {participant.status === "accepted"
                        ? "Accepté"
                        : participant.status === "declined"
                          ? "Décliné"
                          : participant.status === "tentative"
                            ? "Peut-être"
                            : "En attente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            {selectedMeeting.documents &&
              selectedMeeting.documents.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Documents</h4>
                  <div className="space-y-2">
                    {selectedMeeting.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 p-2 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm flex-1">{doc.name}</span>
                        <Button variant="ghost" size="icon">
                          <Link className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Tags */}
            {selectedMeeting.tags && selectedMeeting.tags.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <Header
        title="Aether Calendar"
        showSearch={true}
        showUserMenu={true}
        showNavigation={true}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Colonne de gauche : App Switcher uniquement */}
        <SidebarNav className="w-16" />

        {/* Colonne du centre : Calendrier */}
        <div className="flex-1 flex flex-col border-r border-border">
          {/* Barre d'outils du calendrier */}
          <div className="p-4 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={navigatePrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={navigateNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={navigateToday}>
                  Aujourd'hui
                </Button>
                <div className="h-6 w-px bg-border mx-2" />
                <h2 className="text-lg font-medium">
                  {currentDate.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher une réunion..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle réunion
                </Button>
              </div>
            </div>

            {/* Tabs pour les modes de vue */}
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as any)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="day">Jour</TabsTrigger>
                <TabsTrigger value="week">Semaine</TabsTrigger>
                <TabsTrigger value="month">Mois</TabsTrigger>
                <TabsTrigger value="list">Liste</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Contenu du calendrier */}
          <div className="flex-1 p-4 overflow-auto">
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as any)}
            >
              <TabsContent value="day" className="mt-0">
                {renderDayView()}
              </TabsContent>
              <TabsContent value="week" className="mt-0">
                {renderWeekView()}
              </TabsContent>
              <TabsContent value="month" className="mt-0">
                {renderMonthView()}
              </TabsContent>
              <TabsContent value="list" className="mt-0">
                {renderListView()}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Colonne de droite : Détails de la réunion */}
        <div className="w-96 bg-card">{renderMeetingDetails()}</div>
      </div>
    </div>
  );
}
