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
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
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
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminHR from "./pages/admin/AdminHR";
import AdminPVMonitor from "./pages/admin/AdminPVMonitor";
import SalesDashboard from "./pages/sales/SalesDashboard";
import EngineerDashboard from "./pages/engineer/EngineerDashboard";
import EngineerTasks from "./pages/engineer/EngineerTasks";
import EngineerLogs from "./pages/engineer/EngineerLogs";
import EngineerPhotos from "./pages/engineer/EngineerPhotos";
import EngineerDocuments from "./pages/engineer/EngineerDocuments";
import ProcurementDashboard from "./pages/procurement/ProcurementDashboard";
import ExecutionDashboard from "./pages/execution/ExecutionDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import CustomerDocuments from "./pages/customer/CustomerDocuments";
import CustomerCloseout from "./pages/customer/CustomerCloseout";
import PublicInfoPage from "./pages/public/PublicInfoPage";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/info/:slug" element={<PublicInfoPage />} />

              {/* Admin-only routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/projects" element={<AdminProjects />} />
                  <Route
                    path="/admin/projects/:id"
                    element={<AdminProjectDetail />}
                  />
                  <Route path="/admin/tasks" element={<AdminTasks />} />
                  <Route path="/admin/documents" element={<AdminDocuments />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route
                    path="/admin/organizations"
                    element={<AdminOrganizations />}
                  />
                  <Route path="/admin/sites" element={<AdminSites />} />
                  <Route
                    path="/admin/checklists"
                    element={<AdminChecklists />}
                  />
                  <Route path="/admin/hr" element={<AdminHR />} />
                  <Route
                    path="/admin/pv-monitor"
                    element={<AdminPVMonitor />}
                  />
                  <Route path="/admin/reports" element={<AdminReports />} />
                  <Route
                    path="/admin/role-requests"
                    element={<AdminRoleRequests />}
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={<AdminAuditLogs />}
                  />
                </Route>
              </Route>

              {/* Sales-only routes */}
              <Route element={<ProtectedRoute allowedRoles={["sales"]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/sales" element={<SalesDashboard />} />
                </Route>
              </Route>

              {/* Engineering-only routes */}
              <Route
                element={<ProtectedRoute allowedRoles={["engineering"]} />}
              >
                <Route element={<DashboardLayout />}>
                  <Route path="/engineering" element={<EngineerDashboard />} />
                  <Route path="/engineer" element={<EngineerDashboard />} />
                  <Route path="/field" element={<EngineerDashboard />} />
                  <Route
                    path="/engineering/tasks"
                    element={<EngineerTasks />}
                  />
                  <Route path="/engineer/tasks" element={<EngineerTasks />} />
                  <Route path="/field/tasks" element={<EngineerTasks />} />
                  <Route path="/engineer/logs" element={<EngineerLogs />} />
                  <Route path="/field/logs" element={<EngineerLogs />} />
                  <Route path="/engineer/photos" element={<EngineerPhotos />} />
                  <Route path="/field/photos" element={<EngineerPhotos />} />
                  <Route
                    path="/engineering/documents"
                    element={<EngineerDocuments />}
                  />
                  <Route
                    path="/engineer/documents"
                    element={<EngineerDocuments />}
                  />
                  <Route
                    path="/field/documents"
                    element={<EngineerDocuments />}
                  />
                </Route>
              </Route>

              {/* Procurement-only routes */}
              <Route
                element={<ProtectedRoute allowedRoles={["procurement"]} />}
              >
                <Route element={<DashboardLayout />}>
                  <Route
                    path="/procurement"
                    element={<ProcurementDashboard />}
                  />
                </Route>
              </Route>

              {/* Execution-only routes */}
              <Route element={<ProtectedRoute allowedRoles={["execution"]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/execution" element={<ExecutionDashboard />} />
                  <Route path="/execution/tasks" element={<EngineerTasks />} />
                  <Route path="/execution/logs" element={<EngineerLogs />} />
                  <Route
                    path="/execution/photos"
                    element={<EngineerPhotos />}
                  />
                  <Route
                    path="/execution/documents"
                    element={<EngineerDocuments />}
                  />
                </Route>
              </Route>

              {/* Client-only routes */}
              <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/client" element={<ClientDashboard />} />
                  <Route
                    path="/client/documents"
                    element={<CustomerDocuments />}
                  />
                  <Route
                    path="/client/closeout"
                    element={<CustomerCloseout />}
                  />
                  <Route path="/customer" element={<ClientDashboard />} />
                  <Route
                    path="/customer/documents"
                    element={<CustomerDocuments />}
                  />
                  <Route
                    path="/customer/closeout"
                    element={<CustomerCloseout />}
                  />
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
