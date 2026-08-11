import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute, AdminGuard, EmployeeGuard } from '@/components/RouteGuards';
import AuthLayout from '@/layouts/AuthLayout';
import { settingsService } from '@/services/SettingsService';

// Lazy load pages for performance
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));

const Dashboard = lazy(() => import('@/pages/Dashboard'));

const DepartmentList = lazy(() => import('@/modules/departments/pages/DepartmentList'));
const DepartmentForm = lazy(() => import('@/modules/departments/pages/DepartmentForm'));
const DepartmentDetails = lazy(() => import('@/modules/departments/pages/DepartmentDetails'));

const RoleList = lazy(() => import('@/modules/roles/pages/RoleList'));
const RoleForm = lazy(() => import('@/modules/roles/pages/RoleForm'));
const RoleDetails = lazy(() => import('@/modules/roles/pages/RoleDetails'));

const DesignationList = lazy(() => import('@/modules/designations/pages/DesignationList'));
const DesignationForm = lazy(() => import('@/modules/designations/pages/DesignationForm'));
const DesignationDetails = lazy(() => import('@/modules/designations/pages/DesignationDetails'));

const EmployeeList = lazy(() => import('@/modules/employees/pages/EmployeeList'));
const EmployeeForm = lazy(() => import('@/modules/employees/pages/EmployeeForm'));
const EmployeeDetails = lazy(() => import('@/modules/employees/pages/EmployeeDetails'));

const ClientList = lazy(() => import('@/modules/clients/pages/ClientList'));
const ClientForm = lazy(() => import('@/modules/clients/pages/ClientForm'));
const ClientDetails = lazy(() => import('@/modules/clients/pages/ClientDetails'));

const DocumentList = lazy(() => import('@/modules/documents/pages/DocumentList'));

const TaskList = lazy(() => import('@/modules/tasks/pages/TaskList'));
const TaskForm = lazy(() => import('@/modules/tasks/pages/TaskForm'));
const TaskDetails = lazy(() => import('@/modules/tasks/pages/TaskDetails'));

const InvoiceList = lazy(() => import('@/modules/billing/pages/InvoiceList'));
const InvoiceForm = lazy(() => import('@/modules/billing/pages/InvoiceForm'));
const InvoiceDetails = lazy(() => import('@/modules/billing/pages/InvoiceDetails'));

// Modules - Reports
const ReportsDashboard = lazy(() => import('@/modules/reports/pages/ReportsDashboard'));
const CustomReports = lazy(() => import('@/modules/reports/pages/CustomReports'));

// Modules - Notifications
const NotificationCenter = lazy(() => import('@/modules/notifications/pages/NotificationCenter'));
const NotificationPreferences = lazy(() => import('@/modules/notifications/pages/NotificationPreferences'));
const NotificationTemplates = lazy(() => import('@/modules/notifications/pages/NotificationTemplates'));
const CommunicationHistory = lazy(() => import('@/modules/notifications/pages/CommunicationHistory'));
const ReminderManagement = lazy(() => import('@/modules/notifications/pages/ReminderManagement'));
const ClientBroadcast = lazy(() => import('@/modules/notifications/pages/ClientBroadcast'));

// Modules - Settings
const SettingsLayout = lazy(() => import('@/modules/settings/layouts/SettingsLayout'));
const FirmProfile = lazy(() => import('@/modules/settings/pages/FirmProfile'));
const UserProfile = lazy(() => import('@/modules/settings/pages/UserProfile'));
const AppearanceSettings = lazy(() => import('@/modules/settings/pages/AppearanceSettings'));
const GeneralSettings = lazy(() => import('@/modules/settings/pages/GeneralSettings'));
const SecuritySettings = lazy(() => import('@/modules/settings/pages/SecuritySettings'));
const BillingSettings = lazy(() => import('@/modules/settings/pages/BillingSettings'));
const DocumentSettings = lazy(() => import('@/modules/settings/pages/DocumentSettings'));
const TaskSettings = lazy(() => import('@/modules/settings/pages/TaskSettings'));
const PermissionSettings = lazy(() => import('@/modules/settings/pages/PermissionSettings'));
const DataManagement = lazy(() => import('@/modules/settings/pages/DataManagement'));
const SystemInformation = lazy(() => import('@/modules/settings/pages/SystemInformation'));

// Modules - Audit
const AuditDashboard = lazy(() => import('@/modules/audit/pages/AuditDashboard'));
const AuditLogTable = lazy(() => import('@/modules/audit/pages/AuditLogTable'));
const ActivityDetails = lazy(() => import('@/modules/audit/pages/ActivityDetails'));

// Modules - Assignments
const AssignmentDashboard = lazy(() => import('@/modules/assignments/pages/AssignmentDashboard'));
const EmployeeWorkloadList = lazy(() => import('@/modules/assignments/pages/EmployeeWorkloadList'));
const EmployeeWorkloadDetails = lazy(() => import('@/modules/assignments/pages/EmployeeWorkloadDetails'));
const UnassignedWork = lazy(() => import('@/modules/assignments/pages/UnassignedWork'));

// Modules - Workspace
const WorkspaceLayout = lazy(() => import('@/layouts/WorkspaceLayout'));
const WorkspaceDashboard = lazy(() => import('@/modules/workspace/pages/WorkspaceDashboard'));
const MyTasks = lazy(() => import('@/modules/workspace/pages/MyTasks'));
const WorkspaceTaskDetails = lazy(() => import('@/modules/workspace/pages/WorkspaceTaskDetails'));
const MyClients = lazy(() => import('@/modules/workspace/pages/MyClients'));
const WorkspaceClientDetails = lazy(() => import('@/modules/workspace/pages/WorkspaceClientDetails'));
const MyDocuments = lazy(() => import('@/modules/workspace/pages/MyDocuments'));
const MyCalendar = lazy(() => import('@/modules/workspace/pages/MyCalendar'));
const MyProfile = lazy(() => import('@/modules/workspace/pages/MyProfile'));

// Page Loader for Suspense fallback
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-[var(--color-background)]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  useEffect(() => {
    const applyTheme = () => {
      const theme = settingsService.getSettings().appearance.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    applyTheme();
    window.addEventListener('corestack:settings_updated', applyTheme);
    return () => window.removeEventListener('corestack:settings_updated', applyTheme);
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  {/* Admin Routes */}
                  <Route element={<AdminGuard />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Department Routes */}
                    <Route path="/departments" element={<DepartmentList />} />
                    <Route path="/departments/new" element={<DepartmentForm />} />
                    <Route path="/departments/:id" element={<DepartmentDetails />} />
                    <Route path="/departments/:id/edit" element={<DepartmentForm />} />
                    
                    {/* Role Routes */}
                    <Route path="/roles" element={<RoleList />} />
                    <Route path="/roles/new" element={<RoleForm />} />
                    <Route path="/roles/:id" element={<RoleDetails />} />
                    <Route path="/roles/:id/edit" element={<RoleForm />} />
                    
                    {/* Designation Routes */}
                    <Route path="/designations" element={<DesignationList />} />
                    <Route path="/designations/new" element={<DesignationForm />} />
                    <Route path="/designations/:id" element={<DesignationDetails />} />
                    <Route path="/designations/:id/edit" element={<DesignationForm />} />

                    {/* Employee Routes */}
                    <Route path="/employees" element={<EmployeeList />} />
                    <Route path="/employees/new" element={<EmployeeForm />} />
                    <Route path="/employees/:id" element={<EmployeeDetails />} />
                    <Route path="/employees/:id/edit" element={<EmployeeForm />} />

                    {/* Client Routes */}
                    <Route path="/clients" element={<ClientList />} />
                    <Route path="/clients/new" element={<ClientForm />} />
                    <Route path="/clients/:id" element={<ClientDetails />} />
                    <Route path="/clients/:id/edit" element={<ClientForm />} />

                    {/* Document Routes */}
                    <Route path="/documents" element={<DocumentList />} />

                    {/* Task Routes */}
                    <Route path="/tasks" element={<TaskList />} />
                    <Route path="/tasks/new" element={<TaskForm />} />
                    <Route path="/tasks/:id" element={<TaskDetails />} />
                    <Route path="/tasks/:id/edit" element={<TaskForm />} />

                    {/* Billing Routes */}
                    <Route path="/billing" element={<InvoiceList />} />
                    <Route path="/billing/new" element={<InvoiceForm />} />
                    <Route path="/billing/quotation/new" element={<InvoiceForm />} />
                    <Route path="/billing/:id" element={<InvoiceDetails />} />
                    <Route path="/billing/:id/edit" element={<InvoiceForm />} />

                    {/* Reports Routes */}
                    <Route path="/reports" element={<ReportsDashboard />} />
                    <Route path="/reports/custom" element={<CustomReports />} />

                    {/* Notifications Routes */}
                    <Route path="/notifications" element={<NotificationCenter />} />
                    <Route path="/notifications/preferences" element={<NotificationPreferences />} />
                    <Route path="/notifications/templates" element={<NotificationTemplates />} />
                    <Route path="/notifications/history" element={<CommunicationHistory />} />
                    <Route path="/notifications/reminders" element={<ReminderManagement />} />
                    <Route path="/notifications/clients" element={<ClientBroadcast />} />

                    {/* Audit Routes */}
                    <Route path="/audit" element={<AuditDashboard />} />
                    <Route path="/audit/logs" element={<AuditLogTable />} />
                    <Route path="/audit/:id" element={<ActivityDetails />} />

                    {/* Assignment Routes */}
                    <Route path="/assignments" element={<AssignmentDashboard />} />
                    <Route path="/assignments/workload" element={<EmployeeWorkloadList />} />
                    <Route path="/assignments/workload/:id" element={<EmployeeWorkloadDetails />} />
                    <Route path="/assignments/unassigned" element={<UnassignedWork />} />

                    {/* Settings Routes (Nested inside SettingsLayout) */}
                    <Route path="/settings" element={<SettingsLayout />}>
                      {/* Default redirect to firm profile */}
                      <Route index element={<FirmProfile />} />
                      <Route path="firm" element={<FirmProfile />} />
                      <Route path="profile" element={<UserProfile />} />
                      <Route path="appearance" element={<AppearanceSettings />} />
                      <Route path="general" element={<GeneralSettings />} />
                      <Route path="security" element={<SecuritySettings />} />
                      <Route path="notifications" element={<NotificationPreferences />} />
                      <Route path="billing" element={<BillingSettings />} />
                      <Route path="documents" element={<DocumentSettings />} />
                      <Route path="tasks" element={<TaskSettings />} />
                      <Route path="permissions" element={<PermissionSettings />} />
                      <Route path="data" element={<DataManagement />} />
                      <Route path="system" element={<SystemInformation />} />
                    </Route>
                  </Route>

                  {/* Employee Routes */}
                  <Route element={<EmployeeGuard />}>
                    <Route path="/workspace" element={<WorkspaceLayout />}>
                      <Route index element={<WorkspaceDashboard />} />
                      <Route path="tasks" element={<MyTasks />} />
                      <Route path="tasks/:id" element={<WorkspaceTaskDetails />} />
                      <Route path="clients" element={<MyClients />} />
                      <Route path="clients/:id" element={<WorkspaceClientDetails />} />
                      <Route path="documents" element={<MyDocuments />} />
                      <Route path="calendar" element={<MyCalendar />} />
                      <Route path="notifications" element={<NotificationCenter />} />
                      <Route path="profile" element={<MyProfile />} />
                    </Route>
                  </Route>
                </Route>

                {/* Error Routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
