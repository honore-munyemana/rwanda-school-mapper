// User roles for RBAC
export type UserRole = 'admin' | 'validator' | 'mapper' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

// Verification status types
export type VerificationStatus = 'Verified' | 'Pending' | 'Unverified' | 'Rejected';

// School types
export type SchoolType = 'Public' | 'Private';

// Education levels
export type EducationLevel = 'Primary' | 'Secondary' | 'TVET' | 'Combined';

// Map filter state
export interface MapFilters {
  status: VerificationStatus | 'All';
  district: string | 'All';
  schoolType: SchoolType | 'All';
  educationLevel: EducationLevel | 'All';
}

// Navigation items
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}

// Dashboard statistics
export interface DashboardStats {
  totalSchools: number;
  verifiedSchools: number;
  pendingSchools: number;
  unverifiedSchools: number;
  rejectedSchools: number;
  verificationRate: number;
  publicSchools: number;
  privateSchools: number;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
