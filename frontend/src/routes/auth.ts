export type AuthRole = 'Admin' | 'Verifier' | 'Public User';

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: AuthRole;
  phone?: string;
  organization?: string;
  areaProvince?: string;
  areaDistrict?: string;
}

export interface AuthState {
  userId: string;
  role: AuthRole;
  isAuthenticated: boolean;
}

const USERS_KEY = 'ssevms_users';
const AUTH_KEY = 'ssevms_auth';

export function getDashboardPathForRole(role: AuthRole) {
  if (role === 'Admin') return '/admin';
  if (role === 'Verifier') return '/verifier';
  return '/public';
}

export function getAllUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

export function saveUser(user: StoredUser) {
  const users = getAllUsers();
  // Check if user already exists
  const exists = users.find(u => u.email === user.email);
  if (exists) {
    // Update existing user (optional for this prototype, but good practice)
    const updatedUsers = users.map(u => u.email === user.email ? user : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  } else {
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function setAuthState(auth: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function getAuthState(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_KEY);
}

// Helper to get current logged in user details
export function getCurrentUser(): StoredUser | null {
  const auth = getAuthState();
  if (!auth || !auth.isAuthenticated) return null;
  const users = getAllUsers();
  return users.find(u => u.id === auth.userId) || null;
}
