
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  password: string;
  role: UserRole;
  canDownload: boolean;
  isBlocked?: boolean;
  lastLogin?: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  duration?: string;
  rating?: string;
  year?: string;
  storageType?: 'local' | 'external';
  originalExtension?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
