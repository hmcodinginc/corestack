import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '@/types/auth';
import { authService } from '@/services/AuthService';
import toast from 'react-hot-toast';
import { DUMMY_USER } from '@/data/dummyData';
import { settingsService } from '@/services/SettingsService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Quick migration to ensure Super Admin is replaced with Owner for existing local storage data
    ['users', 'roles', 'currentUser'].forEach(key => {
      const val = localStorage.getItem(key);
      if (val) {
        let newVal = val.replace(/Super Admin/g, 'Owner').replace(/SUPER_ADMIN/g, 'OWNER');
        newVal = newVal.replace(/"firstName":"Super"/g, '"firstName":"Firm"').replace(/"lastName":"Admin"/g, '"lastName":"Owner"');
        if (newVal !== val) localStorage.setItem(key, newVal);
      }
    });

    // Initialize dummy owner if not exists in local storage
    const usersStr = localStorage.getItem('users');
    if (!usersStr || JSON.parse(usersStr).length === 0) {
      localStorage.setItem('users', JSON.stringify([DUMMY_USER]));
    }

    const checkSession = () => {
      const session = authService.getSession();
      const settings = settingsService.getSettings();
      const timeoutMs = (settings.security.sessionTimeout || 60) * 60 * 1000;
      const autoLogout = settings.security.autoLogout !== false;

      const lastActiveStr = localStorage.getItem('corestack_last_active');
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();

      if (session) {
        if (autoLogout && (Date.now() - lastActive > timeoutMs)) {
          authService.logout();
          setAuthState({ user: null, isAuthenticated: false });
          toast.error('Session expired due to inactivity. Please log in again.');
        } else {
          setAuthState({ user: session.user, isAuthenticated: true });
        }
      } else if (authState.isAuthenticated) {
        setAuthState({ user: null, isAuthenticated: false });
        toast.error('Session expired. Please log in again.');
      }
    };

    checkSession();

    // Check session every 10 seconds
    const interval = setInterval(checkSession, 10000);
    
    // Track user activity to update last active timestamp
    const updateActivity = () => {
      localStorage.setItem('corestack_last_active', Date.now().toString());
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [authState.isAuthenticated]);

  const login = async (email: string, password: string) => {
    try {
      const session = await authService.login(email, password);
      setAuthState({ user: session.user, isAuthenticated: true });
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      await authService.register(data);
      toast.success('Registration successful. Please log in.');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!authState.user) throw new Error('Not authenticated');
    try {
      await authService.changePassword(authState.user.id, currentPassword, newPassword);
      toast.success('Password changed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
