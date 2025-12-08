// Simple user storage service until Django backend is connected
export interface UserProfile {
  id: string;
  username: string;
  password: string;
  displayName: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
  createdAt: string;
}

class UserStorageService {
  private currentUser: UserProfile | null = null;
  private readonly STORAGE_KEY = 'promptpic_user';

  // Create account
  createAccount(username: string, password: string, displayName: string, profilePicture?: string): UserProfile {
    const newUser: UserProfile = {
      id: Date.now().toString(),
      username: username.toLowerCase().trim(),
      password, // In real app, this would be hashed
      displayName: displayName.trim(),
      profilePicture,
      createdAt: new Date().toISOString()
    };

    this.currentUser = newUser;
    this.saveToStorage();
    return newUser;
  }

  // Update profile
  updateProfile(updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): UserProfile | null {
    if (!this.currentUser) return null;

    this.currentUser = {
      ...this.currentUser,
      ...updates
    };

    this.saveToStorage();
    return this.currentUser;
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    if (!this.currentUser) {
      this.loadFromStorage();
    }
    return this.currentUser;
  }

  // Check if username is available
  isUsernameAvailable(username: string): boolean {
    // In real app, this would check against database
    const currentUsername = this.currentUser?.username;
    return !currentUsername || currentUsername !== username.toLowerCase().trim();
  }

  // Login (simple check for demo)
  login(username: string, password: string): UserProfile | null {
    this.loadFromStorage();
    if (this.currentUser && 
        this.currentUser.username === username.toLowerCase().trim() && 
        this.currentUser.password === password) {
      return this.currentUser;
    }
    return null;
  }

  // Check if logged in
  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Log out current user
  logout(): void {
    this.currentUser = null;
    this.clearStorage();
    // Clear localStorage posts and current user
    localStorage.clearCurrentUser();
  }

  // Private methods for storage (using in-memory for now, could use AsyncStorage)
  private saveToStorage(): void {
    // In a real app, use AsyncStorage here
    // AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
  }

  private loadFromStorage(): void {
    // In a real app, load from AsyncStorage here
    // const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
    // if (stored) this.currentUser = JSON.parse(stored);
  }

  private clearStorage(): void {
    // In a real app, clear AsyncStorage here
    // AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  // Create demo user if none exists
  createDemoUser(): void {
    if (!this.currentUser && !this.hasCreatedDemo) {
      this.createAccount('demo_user', 'password123', 'Demo User');
      this.hasCreatedDemo = true;
    }
  }

  private hasCreatedDemo = false;
}

export const userStorage = new UserStorageService();

// Import localStorage and sync user info
import { localStorage } from './localStorage';

// Override methods to sync with localStorage
const originalCreateAccount = userStorage.createAccount.bind(userStorage);
const originalUpdateProfile = userStorage.updateProfile.bind(userStorage);

userStorage.createAccount = function(username: string, password: string, displayName: string, profilePicture?: string) {
  const user = originalCreateAccount(username, password, displayName, profilePicture);
  localStorage.setCurrentUser(user.username, user.displayName);
  return user;
};

userStorage.updateProfile = function(updates) {
  const user = originalUpdateProfile(updates);
  if (user) {
    localStorage.setCurrentUser(user.username, user.displayName);
  }
  return user;
};