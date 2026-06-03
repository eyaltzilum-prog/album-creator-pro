import { ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookOpen, LogOut, Globe, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const { user, profile, loading, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div data-ev-id="ev_5ba0e2b7d1" className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div data-ev-id="ev_890fb88204" className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header data-ev-id="ev_d697d3a6bb" className="h-16 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
        <div data-ev-id="ev_a26080187e" className="flex items-center gap-3">
          <div data-ev-id="ev_e891433297" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 data-ev-id="ev_8e8b8926ac" className="font-bold text-xl text-foreground">{t('app_name')}</h1>
        </div>

        <div data-ev-id="ev_60940c2692" className="flex items-center gap-4">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
            className="gap-2">

            <Globe className="w-4 h-4" />
            {language === 'he' ? 'EN' : 'עב'}
          </Button>

          {/* User Menu */}
          <div data-ev-id="ev_bab61f5edd" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted">
            <div data-ev-id="ev_727dc02342" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div data-ev-id="ev_8ab5807fa1" className="hidden sm:block">
              <p data-ev-id="ev_4ac7ad121d" className="text-sm font-medium">{profile?.full_name || t('client')}</p>
              <p data-ev-id="ev_9a6beda8d2" className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignOut}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('logout')}>

            <LogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main data-ev-id="ev_a49dd42418" className="flex-1">
        {children}
      </main>
    </div>);

}