import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Briefcase, 
  FolderOpen, 
  Calendar,
  Bell,
  User,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/workspace', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/workspace/tasks', label: 'My Tasks', icon: CheckSquare },
  { path: '/workspace/clients', label: 'My Clients', icon: Briefcase },
  { path: '/workspace/documents', label: 'My Documents', icon: FolderOpen },
  { path: '/workspace/calendar', label: 'My Calendar', icon: Calendar },
  { path: '/workspace/notifications', label: 'Notifications', icon: Bell },
  { path: '/workspace/profile', label: 'My Profile', icon: User },
];

export const WorkspaceSidebar: React.FC<{
  isOpenMobile: boolean;
  setIsOpenMobile: (val: boolean) => void;
}> = ({ isOpenMobile, setIsOpenMobile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const NavContent = () => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/workspace'}
            onClick={() => setIsOpenMobile(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-default transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )
            }
            title={isCollapsed && !isOpenMobile ? item.label : undefined}
          >
            <Icon size={20} className={isCollapsed && !isOpenMobile ? "mx-auto shrink-0" : "shrink-0"} />
            {(!isCollapsed || isOpenMobile) && <span className="text-sm font-medium truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 256 }}
        className="bg-[var(--color-card)] border-r border-gray-200 shadow-sm hidden lg:flex flex-col h-full relative z-20 shrink-0"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="font-bold text-xl text-primary-dark whitespace-nowrap overflow-hidden"
              >
                My Workspace
              </motion.h1>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
        <NavContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 flex flex-col lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <h1 className="font-bold text-xl text-primary-dark">My Workspace</h1>
                <button 
                  onClick={() => setIsOpenMobile(false)}
                  className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
