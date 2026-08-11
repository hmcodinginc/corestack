import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { WorkspaceSidebar } from '@/components/WorkspaceSidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { Menu } from 'lucide-react';

export const WorkspaceLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[var(--color-background)] overflow-hidden">
      <WorkspaceSidebar isOpenMobile={isMobileSidebarOpen} setIsOpenMobile={setIsMobileSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex items-center px-4 h-16 bg-white border-b border-gray-200 shrink-0">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-2 mr-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-bold text-xl text-primary-dark">My Workspace</h1>
        </div>

        <div className="hidden lg:block">
          <TopNavbar />
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          <div className="mx-auto max-w-7xl w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
