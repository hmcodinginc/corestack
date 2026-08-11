import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedLayout } from '@/layouts/ProtectedLayout';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Just pass through, layout is handled by specific guards
};

export const AdminGuard: React.FC = () => {
  const { user } = useAuth();
  
  // Hierarchy Level 1-3 = Admin/Management, 4+ = Employee
  const isAdmin = user && (user.hierarchyLevel ? user.hierarchyLevel <= 3 : ['Super Admin', 'Partner', 'Manager'].some(role => user.role?.includes(role)));
  
  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <ProtectedLayout />;
};

export const EmployeeGuard: React.FC = () => {
  const { user } = useAuth();
  
  // Wait, if it's an admin trying to access employee workspace, let them? Or redirect back?
  // "Super Admin must never be blocked by employee-level data restrictions... The Employee Portal is an additional, separate workspace"
  // Let's redirect admins out of /workspace to / if they land here, or let them view it?
  // User prompt: "Super Admin -> Existing Admin Panel, Employee -> Employee Portal"
  const isEmployee = user && (user.hierarchyLevel ? user.hierarchyLevel >= 4 : !['Super Admin', 'Partner', 'Manager'].some(role => user.role?.includes(role)));
  
  if (!isEmployee) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // We will need a WorkspaceLayout for the employee portal
  // For now, returning Outlet, App.tsx will wrap with WorkspaceLayout
  return <Outlet />;
};

export const RoleRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
