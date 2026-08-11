import { User } from '@/types/auth';
import { StorageService } from './StorageService';
import { activityLogService } from './ActivityLogService';

// Simulating an extended token format that includes expiry
export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export class AuthService extends StorageService<any> {
  private static readonly SESSION_KEY = 'corestack_session';
  private static readonly TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    super('users');
  }

  public async login(email: string, password: string): Promise<AuthSession> {
    await this.delay(500); // simulate network latency
    const normalizedEmail = email.trim().toLowerCase();
    
    const usersStr = localStorage.getItem('users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Attempt login
    const user = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status === 'Inactive' || user.status === 'Archived') {
      throw new Error('Account is inactive or archived. Please contact an administrator.');
    }

    if (user.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Exclude password from session
    const { password: _password, ...userWithoutPassword } = user;

    const session: AuthSession = {
      user: userWithoutPassword as User,
      token: `fake-jwt-token-${crypto.randomUUID()}`,
      expiresAt: Date.now() + AuthService.TOKEN_EXPIRY_MS,
    };
    
    localStorage.setItem(AuthService.SESSION_KEY, JSON.stringify(session));
    
    // Log login without exposing password
    activityLogService.log({
      action: 'Login',
      module: 'Authentication',
      entityType: 'User',
      entityId: user.id,
      entityName: user.email,
      description: `User ${user.email} logged in successfully`,
      severity: 'Success'
    });

    return session;
  }

  public async register(data: Omit<User, 'id' | 'role' | 'status' | 'createdAt' | 'updatedAt'>): Promise<void> {
    await this.delay(500);
    const normalizedEmail = data.email.trim().toLowerCase();
    
    const usersStr = localStorage.getItem('users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const existingUser = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (existingUser) {
      throw new Error('A user with this email already exists.');
    }

    const newUser: User = {
      ...data,
      email: normalizedEmail, // Save normalized
      id: crypto.randomUUID(),
      role: 'Staff Accountant', // Default employee role
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // We do NOT log the password
    activityLogService.log({
      action: 'Create' as any,
      module: 'Authentication',
      entityType: 'User',
      entityId: newUser.id,
      entityName: newUser.email,
      description: `New user ${newUser.email} registered`,
      severity: 'Info'
    });
  }

  public async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.delay(300);
    
    const usersStr = localStorage.getItem('users');
    if (!usersStr) throw new Error('User data not found');
    
    let users: User[] = JSON.parse(usersStr);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const user = users[userIndex];

    if (user.password !== currentPassword) {
      throw new Error('Incorrect current password');
    }

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from current password');
    }

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));

    activityLogService.log({
      action: 'Update' as any,
      module: 'Authentication',
      entityType: 'User',
      entityId: user.id,
      entityName: user.email,
      description: `User ${user.email} changed their password`,
      severity: 'Info'
    });
  }

  public logout(): void {
    const sessionStr = localStorage.getItem(AuthService.SESSION_KEY);
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr) as AuthSession;
        activityLogService.log({
          action: 'Logout',
          module: 'Authentication',
          entityType: 'User',
          entityId: session.user.id,
          entityName: session.user.email,
          description: `User ${session.user.email} logged out`,
          severity: 'Info'
        });
      } catch (e) {}
    }
    localStorage.removeItem(AuthService.SESSION_KEY);
  }

  public getSession(): AuthSession | null {
    const sessionStr = localStorage.getItem(AuthService.SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr) as AuthSession;
      if (Date.now() > session.expiresAt) {
        this.logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }
}

export const authService = new AuthService();
