import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    const isEmployee = user.hierarchyLevel ? user.hierarchyLevel >= 4 : !['Owner', 'Partner', 'Manager'].some(role => user.role?.includes(role));
    return <Navigate to={isEmployee ? "/workspace" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full sm:w-full bg-[var(--color-card)] rounded-default shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-primary-dark">CA Firm ERP</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
