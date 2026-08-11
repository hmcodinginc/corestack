import { User } from '@/types/auth';
import { saveData } from '@/utils/localStorage';

export const DUMMY_USER: User = {
  id: '1',
  email: 'admin@demo.com',
  firstName: 'Super',
  lastName: 'Admin',
  role: 'Super Admin',
  avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=3b82f6&color=fff',
  password: '123456',
  status: 'Active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const initializeDummyData = () => {
  // We'll populate this more as we add modules
  const isInitialized = localStorage.getItem('isInitialized');
  if (!isInitialized) {
    saveData('users', [DUMMY_USER]);
    saveData('isInitialized', true);
  }
};
