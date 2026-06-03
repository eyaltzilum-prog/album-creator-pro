import { NavLink, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Palette,
  CheckSquare,
  Settings,
  LogOut,
  BookOpen,
  Globe } from
'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export function AdminSidebar() {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: t('dashboard'), end: true },
  { to: '/admin/clients', icon: Users, label: t('clients') },
  { to: '/admin/assets', icon: Palette, label: t('assets') },
  { to: '/admin/reviews', icon: CheckSquare, label: t('reviews') },
  { to: '/admin/settings', icon: Settings, label: t('settings') }];


  return (
    <aside data-ev-id="ev_ea8b0867b4" className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-[100dvh] w-64 bg-sidebar text-sidebar-foreground flex flex-col z-40 overflow-hidden`}>
      {/* Logo */}
      <div data-ev-id="ev_1445acdc03" className="p-6 border-b border-white/10">
        <div data-ev-id="ev_74e46a67a2" className="flex items-center gap-3">
          <div data-ev-id="ev_fc7a2c6094" className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div data-ev-id="ev_2605d516f8">
            <h1 data-ev-id="ev_df20c4b7c7" className="font-bold text-lg">{t('app_name')}</h1>
            <p data-ev-id="ev_cc4a8bf4e8" className="text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav data-ev-id="ev_6918d6b8d3" className="flex-1 p-4 overflow-y-auto">
        <ul data-ev-id="ev_d2f880ed88" className="flex flex-col gap-1">
          {navItems.map((item) =>
          <li data-ev-id="ev_5a4c0c3008" key={item.to}>
              <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ?
              'bg-sidebar-active text-white' :
              'text-sidebar-foreground/80 hover:bg-sidebar-hover'}
                `
              }>

                <item.icon className="w-5 h-5" />
                <span data-ev-id="ev_8cd05c09be">{item.label}</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {/* User & Settings */}
      <div data-ev-id="ev_f9530f3d8e" className="p-4 pb-6 border-t border-white/10 flex-shrink-0">
        {/* Language Toggle */}
        <button data-ev-id="ev_9c99b7fbd1"
        onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-hover transition-colors mb-2">

          <Globe className="w-5 h-5" />
          <span data-ev-id="ev_95ab6a69f7">{language === 'he' ? 'English' : 'עברית'}</span>
        </button>

        {/* User Info */}
        <div data-ev-id="ev_6ee5c1fedd" className="px-4 py-3 rounded-lg bg-sidebar-hover/50 mb-2">
          <p data-ev-id="ev_667c61e016" className="font-medium text-sm">{profile?.full_name || profile?.email}</p>
          <p data-ev-id="ev_aa53f2c225" className="text-xs text-sidebar-foreground/60">{profile?.email}</p>
        </div>

        {/* Logout */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">

          <LogOut className="w-5 h-5" />
          <span data-ev-id="ev_e0722ac7be">{t('logout')}</span>
        </motion.button>
      </div>
    </aside>);

}