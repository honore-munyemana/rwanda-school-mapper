import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuthState, getCurrentUser, clearAuthState, getAllUsers, type StoredUser } from '@/routes/auth';

interface UserContextValue {
  currentUser: StoredUser | null;
  users: StoredUser[];
  logout: () => void;
  refreshAuth: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(getCurrentUser());
  const [users, setUsers] = useState<StoredUser[]>(getAllUsers());

  const refreshAuth = () => {
    setCurrentUser(getCurrentUser());
    setUsers(getAllUsers());
  };

  const logout = () => {
    clearAuthState();
    setCurrentUser(null);
  };

  // Listen for storage changes (optional, but helps if multiple tabs are open)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
