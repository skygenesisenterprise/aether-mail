'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, Search, Users, User, Mail, Phone, 
  MapPin, ChevronRight, Folder, FolderOpen, 
  MoreVertical, Star, MessageSquare, Calendar,
  Network
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  managerId?: string;
  reports: number;
}

interface Department {
  id: string;
  name: string;
  parentId?: string;
}

interface OrgExplorerViewProps {
  className?: string;
}

const mockDepartments: Department[] = [
  { id: '1', name: 'Direction' },
  { id: '2', name: 'Ingénierie', parentId: '1' },
  { id: '3', name: 'Produit', parentId: '1' },
  { id: '4', name: 'Marketing', parentId: '1' },
  { id: '5', name: 'Ventes', parentId: '1' },
  { id: '6', name: 'RH', parentId: '1' },
  { id: '7', name: 'Finance', parentId: '1' },
  { id: '8', name: 'Développement Frontend', parentId: '2' },
  { id: '9', name: 'Développement Backend', parentId: '2' },
  { id: '10', name: 'DevOps', parentId: '2' },
];

const mockEmployees: Employee[] = [
  { id: '1', name: 'Jean Dupont', title: 'PDG', department: 'Direction', email: 'jean.dupont@company.com', phone: '+33 6 12 34 56 78', location: 'Paris', reports: 5 },
  { id: '2', name: 'Marie Martin', title: 'CTO', department: 'Ingénierie', email: 'marie.martin@company.com', phone: '+33 6 23 45 67 89', location: 'Paris', reports: 3, managerId: '1' },
  { id: '3', name: 'Pierre Durant', title: 'VP Produit', department: 'Produit', email: 'pierre.durant@company.com', location: 'Paris', reports: 2, managerId: '1' },
  { id: '4', name: 'Sophie Bernard', title: 'VP Marketing', department: 'Marketing', email: 'sophie.bernard@company.com', location: 'Lyon', reports: 4, managerId: '1' },
  { id: '5', name: 'Lucas Petit', title: 'VP Ventes', department: 'Ventes', email: 'lucas.petit@company.com', location: 'Paris', reports: 6, managerId: '1' },
  { id: '6', name: 'Emma Moreau', title: 'Directrice RH', department: 'RH', email: 'emma.moreau@company.com', location: 'Paris', reports: 2, managerId: '1' },
  { id: '7', name: 'Thomas Laurent', title: 'Senior Developer', department: 'Développement Frontend', email: 'thomas.laurent@company.com', location: 'Lyon', reports: 0, managerId: '2' },
  { id: '8', name: 'Camille Girard', title: 'Senior Developer', department: 'Développement Backend', email: 'camille.girard@company.com', location: 'Paris', reports: 0, managerId: '2' },
  { id: '9', name: 'Antoine Rousseau', title: 'DevOps Engineer', department: 'DevOps', email: 'antoine.rousseau@company.com', location: 'Remote', reports: 0, managerId: '2' },
  { id: '10', name: 'Julie Dubois', title: 'Marketing Manager', department: 'Marketing', email: 'julie.dubois@company.com', location: 'Lyon', reports: 0, managerId: '4' },
];

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    'Direction': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    'Ingénierie': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'Produit': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    'Marketing': 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    'Ventes': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    'RH': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    'Finance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };
  return colors[department] || 'bg-gray-100 text-gray-700';
}

export function OrgExplorerView({ className }: OrgExplorerViewProps) {
  const [employees, setEmployees] = React.useState<Employee[]>(mockEmployees);
  const [departments, setDepartments] = React.useState<Department[]>(mockDepartments);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'department' | 'list'>('department');

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     emp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = !selectedDepartment || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const departmentList = departments.filter(d => !d.parentId);
  const subDepartments = selectedDepartment 
    ? departments.filter(d => d.parentId === selectedDepartment)
    : [];

  const departmentEmployees = selectedDepartment
    ? employees.filter(e => e.department === departments.find(d => d.id === selectedDepartment)?.name)
    : [];

  return (
    <div className={cn('flex h-full', className)}>
      <div className="w-64 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold">Organisation</h2>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setSelectedDepartment(null); setSelectedEmployee(null); }}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors',
                !selectedDepartment ? 'bg-accent' : 'hover:bg-accent/50'
              )}
            >
              <Network className="h-4 w-4" />
              <span className="text-sm">Vue d'ensemble</span>
            </button>

            <Separator className="my-2" />

            <div className="text-xs font-medium text-muted-foreground px-2 py-2">Départements</div>
            {departmentList.map((dept) => {
              const deptEmployees = employees.filter(e => e.department === dept.name);
              return (
                <button
                  key={dept.id}
                  onClick={() => { setSelectedDepartment(dept.id); setSelectedEmployee(null); }}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-2 rounded-md text-left transition-colors',
                    selectedDepartment === dept.id ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{dept.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{deptEmployees.length}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">
              {selectedDepartment 
                ? departments.find(d => d.id === selectedDepartment)?.name || 'Organisation'
                : selectedEmployee?.name || 'Organisation'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredEmployees.length} employés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'department' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('department')}
            >
              <Folder className="h-4 w-4 mr-1" />
              Départements
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Users className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 px-6 py-3 border-b">
          <div className="relative flex-1 max-w-sm">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
            <Input 
              placeholder="Rechercher un employé..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {selectedEmployee ? (
            <div className="max-w-lg mx-auto">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {getInitials(selectedEmployee.name)}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.title}</p>
                  <span className={cn(
                    'inline-block mt-2 px-2 py-1 rounded text-sm',
                    getDepartmentColor(selectedEmployee.department)
                  )}>
                    {selectedEmployee.department}
                  </span>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${selectedEmployee.email}`} className="text-primary hover:underline">
                    {selectedEmployee.email}
                  </a>
                </div>
                {selectedEmployee.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                )}
                {selectedEmployee.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedEmployee.location}</span>
                  </div>
                )}
                {selectedEmployee.reports > 0 && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedEmployee.reports} rapporteur{selectedEmployee.reports > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex gap-2">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier
                </Button>
              </div>
            </div>
          ) : viewMode === 'department' && subDepartments.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sous-départements</h3>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {subDepartments.map((dept) => {
                  const deptEmployees = employees.filter(e => e.department === dept.name);
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setSelectedDepartment(dept.id)}
                      className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors text-left"
                    >
                      <Folder className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">{deptEmployees.length} employés</div>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Membres du département</h3>
              <div className="grid grid-cols-2 gap-4">
                {departmentEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {getInitials(emp.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{emp.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{emp.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border hover:bg-accent/50 transition-colors text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {getInitials(emp.name)}
                  </div>
                  <div>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-sm text-muted-foreground">{emp.title}</div>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs',
                    getDepartmentColor(emp.department)
                  )}>
                    {emp.department}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}