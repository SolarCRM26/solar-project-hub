import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Sun, LayoutDashboard, FolderKanban, ListTodo, FileText,
  HardHat, ClipboardCheck, Camera, BookOpen, Eye,
  LogOut, User, ChevronRight, Users, Building2, UserCircle, MapPin, ListChecks, BarChart3, UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Projects', url: '/admin/projects', icon: FolderKanban },
  { title: 'Tasks', url: '/admin/tasks', icon: ListTodo },
  { title: 'Documents', url: '/admin/documents', icon: FileText },
  { title: 'Checklists', url: '/admin/checklists', icon: ListChecks },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Role Requests', url: '/admin/role-requests', icon: UserCheck },
  { title: 'Organizations', url: '/admin/organizations', icon: Building2 },
  { title: 'Clients', url: '/admin/clients', icon: UserCircle },
  { title: 'Sites', url: '/admin/sites', icon: MapPin },
];

const engineerItems = [
  { title: 'My Projects', url: '/engineer', icon: FolderKanban },
  { title: 'My Tasks', url: '/engineer/tasks', icon: ClipboardCheck },
  { title: 'Daily Logs', url: '/engineer/logs', icon: BookOpen },
  { title: 'Photos', url: '/engineer/photos', icon: Camera },
];

const customerItems = [
  { title: 'My Projects', url: '/customer', icon: Eye },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { hasRole, profile, signOut } = useAuth();
  const location = useLocation();

  const isAdmin = hasRole('admin') || hasRole('project_manager');
  const isEngineer = hasRole('engineer');
  const isCustomer = hasRole('customer');
  const isQA = hasRole('qa_manager');

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <div className="p-1.5 rounded-lg bg-gradient-solar flex-shrink-0">
          <Sun className="h-5 w-5 text-solar-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-sidebar-accent-foreground">SPD Nexus</span>}
      </div>

      <SidebarContent>
        {(isAdmin || isQA) && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Administration</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end={item.url === '/admin'} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isEngineer && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Field Engineer</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {engineerItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end={item.url === '/engineer'} className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {isCustomer && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Client Portal</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {customerItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
            </div>
          )}
          {!collapsed && (
            <Button variant="ghost" size="icon" onClick={signOut} className="flex-shrink-0 text-sidebar-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
