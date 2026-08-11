export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  hierarchyLevel?: number;
  avatar?: string;
  password?: string; // Frontend-only demo requirement
  status?: 'Active' | 'Inactive' | 'Archived';
  createdAt?: string;
  updatedAt?: string;
  employeeId?: string;
}

export interface AuthState {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
}
