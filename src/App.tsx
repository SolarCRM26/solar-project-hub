import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelection from "./pages/RoleSelection";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectDetail from "./pages/admin/AdminProjectDetail";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminClients from "./pages/admin/AdminClients";
import AdminSites from "./pages/admin/AdminSites";
import AdminChecklists from "./pages/admin/AdminChecklists";
import AdminReports from "./pages/admin/AdminReports";
import AdminRoleRequests from "./pages/admin/AdminRoleRequests";
import EngineerDashboard from "./pages/engineer/EngineerDashboard";
import EngineerTasks from "./pages/engineer/EngineerTasks";
import EngineerLogs from "./pages/engineer/EngineerLogs";
import EngineerPhotos from "./pages/engineer/EngineerPhotos";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/" element={<Index />} />
              
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route path="/admin/projects/:id" element={<AdminProjectDetail />} />
                  <Route path="/admin/tasks" element={<AdminTasks />} />
                  <Route path="/admin/documents" element={<AdminDocuments />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/organizations" element={<AdminOrganizations />} />
                  <Route path="/admin/clients" element={<AdminClients />} />
                  <Route path="/admin/sites" element={<AdminSites />} />
                  <Route path="/admin/checklists" element={<AdminChecklists />} />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route path="/admin/role-requests" element={<AdminRoleRequests />} />

                  {/* Engineer routes */}
                  <Route path="/engineer" element={<EngineerDashboard />} />
                  <Route path="/engineer/tasks" element={<EngineerTasks />} />
                  <Route path="/engineer/logs" element={<EngineerLogs />} />
                  <Route path="/engineer/photos" element={<EngineerPhotos />} />

                  {/* Customer routes */}
                  <Route path="/customer" element={<CustomerDashboard />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
