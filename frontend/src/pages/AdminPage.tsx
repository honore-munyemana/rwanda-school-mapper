import { DashboardLayout } from '@/components/layout/DashboardLayout';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';

export default function AdminPage() {
  return (
    <DashboardLayout>
      <AdminDashboard />
    </DashboardLayout>
  );
}
