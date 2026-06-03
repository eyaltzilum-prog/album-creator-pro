import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, profile, loading, isAdmin } = useAuth();
  const { isRTL } = useLanguage();

  if (loading) {
    return (
      <div data-ev-id="ev_89bd5b77d7" className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <div data-ev-id="ev_6072a7d108" className="min-h-screen bg-background">
      <AdminSidebar />
      <main data-ev-id="ev_0ea6f96a11" className={`${isRTL ? 'mr-64' : 'ml-64'} min-h-screen`}>
        <div data-ev-id="ev_b586a3dbb7" className="p-6">
          {children}
        </div>
      </main>
    </div>);

}