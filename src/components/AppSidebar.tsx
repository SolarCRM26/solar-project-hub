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
  ClipboardCheck, Camera, BookOpen, Eye,
  LogOut, User, Users, Building2, UserCircle, MapPin, ListChecks, BarChart3, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Projects', url: '/admin/projects', icon: FolderKanban },
  { title: 'Tasks', url: '/admin/tasks', icon: ListTodo },
  { title: 'Documents', url: '/admin/documents', icon: FileText },
  { title: 'Checklists', url: '/admin/checklists', icon: ListChecks },
  { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
  { title: 'Audit Logs', url: '/admin/audit-logs', icon: ClipboardList },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Organizations', url: '/admin/organizations', icon: Building2 },
  { title: 'Sites', url: '/admin/sites', icon: MapPin },
];

const engineerItems = [
  { title: 'My Projects', url: '/engineer', icon: FolderKanban },
  { title: 'My Tasks', url: '/engineer/tasks', icon: ClipboardCheck },
  { title: 'Documents', url: '/engineer/documents', icon: FileText },
  { title: 'Daily Logs', url: '/engineer/logs', icon: BookOpen },
  { title: 'Photos', url: '/engineer/photos', icon: Camera },
];

const customerItems = [
  { title: 'My Projects', url: '/customer', icon: Eye },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { roles, profile, signOut } = useAuth();
  const location = useLocation();

  const effectiveRole = roles.includes('admin')
    ? 'admin'
    : roles.includes('engineer')
      ? 'engineer'
      : roles.includes('customer')
        ? 'customer'
        : null;

  const isAdmin = effectiveRole === 'admin';
  const isEngineer = effectiveRole === 'engineer';
  const isCustomer = effectiveRole === 'customer';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className={`flex items-center gap-2 py-4 border-b border-sidebar-border ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        <div className="p-1.5 rounded-lg bg-gradient-solar flex-shrink-0">
          <Sun className="h-5 w-5 text-solar-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-lg text-sidebar-accent-foreground">SPD Nexus</span>}
      </div>

      <SidebarContent>
        {isAdmin && (
          <SidebarGroup>
            {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Administration</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink to={item.url} end={item.url === '/admin'} className={`hover:bg-sidebar-accent flex items-center ${collapsed ? 'justify-center' : ''}`} activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${!collapsed ? 'mr-2' : ''}`} />
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
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink to={item.url} end={item.url === '/engineer'} className={`hover:bg-sidebar-accent flex items-center ${collapsed ? 'justify-center' : ''}`} activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${!collapsed ? 'mr-2' : ''}`} />
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
                    <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                      <NavLink to={item.url} end className={`hover:bg-sidebar-accent flex items-center ${collapsed ? 'justify-center' : ''}`} activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className={`h-4 w-4 flex-shrink-0 ${!collapsed ? 'mr-2' : ''}`} />
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
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{profile?.email}</p>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={signOut} className={`flex-shrink-0 text-sidebar-foreground hover:text-destructive ${collapsed ? 'hidden' : ''}`}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
