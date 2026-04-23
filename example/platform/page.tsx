"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  Bell,
  Share2,
  Mail,
  DollarSign,
  BarChart3,
  Globe,
  Activity,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { StatsCard } from "@/components/admin/stats-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const viewsData = [
  { date: "Lun", views: 12400, visitors: 8200 },
  { date: "Mar", views: 14200, visitors: 9100 },
  { date: "Mer", views: 18900, visitors: 12300 },
  { date: "Jeu", views: 16100, visitors: 10800 },
  { date: "Ven", views: 21500, visitors: 14200 },
  { date: "Sam", views: 19300, visitors: 12900 },
  { date: "Dim", views: 15600, visitors: 10100 },
];

const socialData = [
  { platform: "Twitter", followers: 45230, growth: 5.2, color: "#000000" },
  { platform: "Facebook", followers: 125400, growth: 2.1, color: "#1877F2" },
  { platform: "Instagram", followers: 89200, growth: 8.4, color: "#E1306C" },
  { platform: "LinkedIn", followers: 15600, growth: 12.3, color: "#0A66C2" },
];

const categoryData = [
  { category: "Politique", articles: 45, color: "#8B5CF6" },
  { category: "Économie", articles: 38, color: "#06B6D4" },
  { category: "International", articles: 32, color: "#10B981" },
  { category: "Culture", articles: 28, color: "#F59E0B" },
  { category: "Sport", articles: 24, color: "#EF4444" },
];

const recentArticles = [
  {
    id: 1,
    title: "Les nouvelles mesures économiques annoncées par le gouvernement",
    category: "Économie",
    author: "Marie Dupont",
    status: "published",
    views: 3420,
    date: "Il y a 2h",
  },
  {
    id: 2,
    title: "Sommet international sur le climat : les enjeux majeurs",
    category: "International",
    author: "Jean Martin",
    status: "published",
    views: 2890,
    date: "Il y a 4h",
  },
  {
    id: 3,
    title: "Réforme de l'éducation : ce qui va changer",
    category: "Politique",
    author: "Sophie Bernard",
    status: "draft",
    views: 0,
    date: "Il y a 5h",
  },
  {
    id: 4,
    title: "Le nouveau festival de musique fait sensation",
    category: "Culture",
    author: "Lucas Petit",
    status: "review",
    views: 0,
    date: "Il y a 6h",
  },
  {
    id: 5,
    title: "Victoire historique de l'équipe nationale",
    category: "Sport",
    author: "Emma Leroy",
    status: "published",
    views: 5670,
    date: "Il y a 8h",
  },
];

const topAuthors = [
  { name: "Marie Dupont", articles: 24, views: 45200, avatar: "" },
  { name: "Jean Martin", articles: 19, views: 38100, avatar: "" },
  { name: "Sophie Bernard", articles: 17, views: 32800, avatar: "" },
  { name: "Lucas Petit", articles: 15, views: 28400, avatar: "" },
];

const recentActivity = [
  {
    type: "article",
    user: "Marie Dupont",
    action: "a publié",
    target: "Les nouvelles mesures économiques",
    time: "Il y a 2h",
    icon: FileText,
  },
  {
    type: "comment",
    user: "Jean Martin",
    action: "a commenté",
    target: "Sommet international sur le climat",
    time: "Il y a 3h",
    icon: MessageSquare,
  },
  {
    type: "user",
    user: "Sophie Bernard",
    action: "s'est inscrit",
    target: "",
    time: "Il y a 4h",
    icon: Users,
  },
  {
    type: "social",
    user: "System",
    action: "a publié sur",
    target: "Twitter",
    time: "Il y a 5h",
    icon: Share2,
  },
  {
    type: "newsletter",
    user: "Lucas Petit",
    action: "a envoyé",
    target: "Newsletter hebdomadaire",
    time: "Il y a 6h",
    icon: Mail,
  },
];

const quickActions = [
  { label: "Nouvel article", href: "/dashboard/articles/new", icon: Plus, color: "bg-blue-500" },
  { label: "Voir le site", href: "/", icon: Globe, color: "bg-green-500" },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell, color: "bg-orange-500" },
  { label: "Statistiques", href: "/dashboard/analytics", icon: BarChart3, color: "bg-purple-500" },
];

const viewsChartConfig = {
  views: { label: "Vues", color: "oklch(0.5 0.2 25)" },
  visitors: { label: "Visiteurs", color: "oklch(0.7 0.15 250)" },
};

const categoryChartConfig = {
  articles: { label: "Articles", color: "oklch(0.5 0.2 25)" },
};

function getStatusBadge(status: string) {
  switch (status) {
    case "published":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publié</Badge>;
    case "draft":
      return <Badge variant="secondary">Brouillon</Badge>;
    case "review":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En révision</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("14d");

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenue sur la console d&apos;administration de The Etheria Times
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <Calendar className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="14d">14 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">3 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className="h-auto py-4 flex flex-col items-center gap-2"
            asChild
          >
            <Link href={action.href}>
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Stats Cards Row 1 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Articles publiés"
          value="1,247"
          change="+12%"
          changeType="positive"
          description="vs période précédente"
          icon={FileText}
        />
        <StatsCard
          title="Vues totales"
          value="2.4M"
          change="+18%"
          changeType="positive"
          description="vs période précédente"
          icon={Eye}
        />
        <StatsCard
          title="Abonnés"
          value="48,293"
          change="+5.2%"
          changeType="positive"
          description="vs période précédente"
          icon={Users}
        />
        <StatsCard
          title="Commentaires"
          value="12,847"
          change="-3%"
          changeType="negative"
          description="vs période précédente"
          icon={MessageSquare}
        />
      </div>

      {/* Stats Cards Row 2 - Social & Revenue */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Abonnés sociaux"
          value="275K"
          change="+7.2%"
          changeType="positive"
          description="vs période précédente"
          icon={Share2}
        />
        <StatsCard
          title="Newsletter"
          value="5,420"
          change="+8.5%"
          changeType="positive"
          description="vs période précédente"
          icon={Mail}
        />
        <StatsCard
          title="Revenus pub"
          value="€12,450"
          change="+15%"
          changeType="positive"
          description="vs période précédente"
          icon={DollarSign}
        />
        <StatsCard
          title="Taux d'engagement"
          value="4.2%"
          change="+0.8%"
          changeType="positive"
          description="vs période précédente"
          icon={Activity}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Views Chart */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Trafic du site</CardTitle>
                <CardDescription>Vues et visiteurs cette semaine</CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Vues</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[oklch(0.7_0.15_250)]" />
                  <span className="text-muted-foreground">Visiteurs</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={viewsChartConfig} className="h-70 w-full">
              <AreaChart data={viewsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="var(--color-visitors)"
                  strokeWidth={2}
                  fill="url(#fillVisitors)"
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  strokeWidth={2}
                  fill="url(#fillViews)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Social Overview */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Réseaux sociaux</CardTitle>
                <CardDescription>Abonnés par plateforme</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/social-analytics" className="gap-1">
                  Voir tout
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialData.map((social) => (
                <div key={social.platform} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: social.color }}
                    />
                    <span className="text-sm font-medium">{social.platform}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatNumber(social.followers)}</span>
                    <Badge variant="outline" className="text-xs text-green-600">
                      <ArrowUpRight className="h-3 w-3 mr-1" />+{social.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Charts */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Categories */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Articles par catégorie</CardTitle>
            <CardDescription>Répartition ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-62.5 w-full">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="articles" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Activité récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 px-6 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">{activity.action}</span>
                      {activity.target && (
                        <>
                          {" "}
                          <span className="font-medium">{activity.target}</span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Articles & Top Authors */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Articles */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Articles récents</CardTitle>
                <CardDescription>Les derniers articles créés ou modifiés</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/articles" className="gap-1">
                  Voir tout
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                        {article.category}
                      </Badge>
                      {getStatusBadge(article.status)}
                    </div>
                    <h4 className="font-medium text-sm truncate">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px] bg-muted">
                            {getInitials(article.author)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{article.author}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.date}
                      </span>
                      {article.views > 0 && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views.toLocaleString("en-US")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Voir</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Authors */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top rédacteurs</CardTitle>
                <CardDescription>Ce mois-ci</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {topAuthors.map((author, index) => (
                <div key={author.name} className="flex items-center gap-3 px-6 py-3">
                  <span className="text-sm font-medium text-muted-foreground w-4">{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{author.name}</p>
                    <p className="text-xs text-muted-foreground">{author.views} vues</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
