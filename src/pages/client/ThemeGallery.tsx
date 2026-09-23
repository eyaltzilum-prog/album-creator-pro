/**
 * Theme/Design Gallery - Screen A
 * White page with categorized theme cards, 4 per row with chevron navigation
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { THEMES, THEME_CATEGORIES, Theme } from '@/lib/themes';

// Extended categories for the gallery display
const GALLERY_CATEGORIES = [
{ id: 'popular', name: { he: 'פופולרי', en: 'Popular' }, themes: ['minimal', 'modern', 'wedding'] },
{ id: 'wedding', name: { he: 'חתונה ואירועים', en: 'Wedding & Events' }, themes: ['wedding', 'celebration'] },
{ id: 'baby', name: { he: 'תינוקות וילדים', en: 'Baby & Children' }, themes: ['baby'] },
{ id: 'family', name: { he: 'משפחה', en: 'Family' }, themes: ['family'] },
{ id: 'travel', name: { he: 'טיולים ונופש', en: 'Travel & Vacation' }, themes: ['travel'] },
{ id: 'school', name: { he: 'בית ספר ונוער', en: 'School & Youth' }, themes: ['school'] },
{ id: 'minimal', name: { he: 'מינימליסטי', en: 'Minimalist' }, themes: ['minimal', 'modern'] }];


interface ThemeCardProps {
  theme: Theme;
  language: 'he' | 'en';
  onSelect: (theme: Theme) => void;
}

function ThemeCard({ theme, language, onSelect }: ThemeCardProps) {
  return (
    <button data-ev-id="ev_0a3dccbb4c"
    onClick={() => onSelect(theme)}
    className="group flex flex-col items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00aa9b] focus-visible:ring-offset-2 rounded-lg">

      {/* Cover mockup card */}
      <div data-ev-id="ev_72d3da5463" className="w-48 h-48 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-[#00aa9b]/30">
        <div data-ev-id="ev_27eeb7f77f"
        className="w-full h-full flex items-center justify-center p-4"
        style={{ background: theme.previewGradient }}>

          {/* Simulated book cover */}
          <div data-ev-id="ev_1e638fed0f" className="w-32 h-40 bg-white rounded shadow-lg relative overflow-hidden">
            <div data-ev-id="ev_691e973d5f"
            className="absolute inset-0 opacity-80"
            style={{ background: theme.colors.primary }} />

            <div data-ev-id="ev_30ce5d139a" className="absolute inset-0 flex flex-col items-center justify-center p-3">
              <div data-ev-id="ev_6d207f9b0e"
              className="w-16 h-16 rounded-full mb-2 opacity-30"
              style={{ background: theme.colors.accent }} />

              <div data-ev-id="ev_3ac2969b31" className="w-20 h-2 rounded bg-white/40 mb-1" />
              <div data-ev-id="ev_b823feb1a4" className="w-14 h-1.5 rounded bg-white/30" />
            </div>
          </div>
        </div>
      </div>
      {/* Theme name */}
      <span data-ev-id="ev_afbce1e978" className="text-sm text-gray-700 font-medium group-hover:text-[#00aa9b] transition-colors">
        {theme.name[language]}
      </span>
    </button>);

}

interface CategoryRowProps {
  category: {id: string;name: {he: string;en: string;};themes: string[];};
  themes: Theme[];
  language: 'he' | 'en';
  isRTL: boolean;
  onSelectTheme: (theme: Theme) => void;
}

function CategoryRow({ category, themes, language, isRTL, onSelectTheme }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(Math.abs(scrollLeft) > 10);
    setCanScrollRight(Math.abs(scrollLeft) < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [themes]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 220; // Card width + gap
    const newScroll = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount) * (isRTL ? -1 : 1);
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  if (themes.length === 0) return null;

  return (
    <div data-ev-id="ev_46159ea972" className="py-8">
      {/* Category header */}
      <div data-ev-id="ev_cca7de37f7" className="text-center mb-6">
        <h2 data-ev-id="ev_0e7b263902" className="text-xl font-semibold text-gray-800 mb-1">
          {category.name[language]}
        </h2>
        <button data-ev-id="ev_e911f38ea3" className="text-xs text-[#00aa9b] hover:underline">
          {language === 'he' ? 'הצג הכל' : 'View all'}
        </button>
      </div>

      {/* Theme cards row with navigation */}
      <div data-ev-id="ev_81a2be214c" className="relative max-w-5xl mx-auto px-12">
        {/* Left chevron */}
        <button data-ev-id="ev_05a5ae7986"
        onClick={() => scroll(isRTL ? 'right' : 'left')}
        className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white transition-colors ${!canScrollLeft && !isRTL || !canScrollRight && isRTL ? 'opacity-30 pointer-events-none' : ''}`}
        disabled={!canScrollLeft && !isRTL || !canScrollRight && isRTL}>

          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Scrollable row */}
        <div data-ev-id="ev_4a5ad88b63"
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          {themes.map((theme) =>
          <div data-ev-id="ev_8152c3e20b" key={theme.id} className="flex-shrink-0">
              <ThemeCard theme={theme} language={language} onSelect={onSelectTheme} />
            </div>
          )}
        </div>

        {/* Right chevron */}
        <button data-ev-id="ev_23f943dfb2"
        onClick={() => scroll(isRTL ? 'left' : 'right')}
        className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#00aa9b] hover:bg-[#00aa9b] hover:text-white transition-colors ${!canScrollRight && !isRTL || !canScrollLeft && isRTL ? 'opacity-30 pointer-events-none' : ''}`}
        disabled={!canScrollRight && !isRTL || !canScrollLeft && isRTL}>

          {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>);

}

export default function ThemeGallery() {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/album/new' } });
    }
  }, [user, navigate]);

  const handleSelectTheme = (theme: Theme | null) => {
    // Navigate to setup modal with selected theme
    navigate('/album/setup', { state: { selectedTheme: theme } });
  };

  const handleStartBlank = () => {
    navigate('/album/setup', { state: { selectedTheme: null } });
  };

  // Group themes by category
  const getThemesForCategory = (categoryThemeIds: string[]) => {
    return THEMES.filter((t) => categoryThemeIds.includes(t.id) || categoryThemeIds.includes(t.category));
  };

  if (!user) {
    return (
      <div data-ev-id="ev_b678bb4b2f" className="min-h-screen bg-white flex items-center justify-center">
        <div data-ev-id="ev_3ce0956c46" className="animate-spin w-8 h-8 border-2 border-[#00aa9b] border-t-transparent rounded-full" />
      </div>);

  }

  return (
    <div data-ev-id="ev_8e7bc9ca24" className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header data-ev-id="ev_70ce7e376a" className="py-6 border-b border-gray-100">
        <div data-ev-id="ev_502f14a244" className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button data-ev-id="ev_6c6e93af99"
          onClick={() => navigate('/projects')}
          className="text-gray-500 hover:text-gray-700 text-sm">

            {language === 'he' ? '← חזרה לאלבומים' : '← Back to albums'}
          </button>
          <h1 data-ev-id="ev_5601bbc2af" className="text-lg font-medium text-gray-800">
            {language === 'he' ? 'יצירת אלבום חדש' : 'Create New Album'}
          </h1>
          <div data-ev-id="ev_86a9bbe4be" className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main content */}
      <main data-ev-id="ev_83ef541da6" className="py-12">
        {/* Intro */}
        <div data-ev-id="ev_a4ef860132" className="text-center mb-12">
          <h1 data-ev-id="ev_cb38256477" className="text-3xl font-bold text-gray-900 mb-3">
            {language === 'he' ? 'בחרו נושא לאלבום' : 'Choose a theme for your album'}
          </h1>
          <p data-ev-id="ev_9d35f325f6" className="text-gray-500 max-w-md mx-auto">
            {language === 'he' ?
            'בחרו מתוך מגוון עיצובים מוכנים או התחילו מאלבום ריק' :
            'Choose from a variety of ready-made designs or start with a blank album'}
          </p>
        </div>

        {/* Start without design option */}
        <div data-ev-id="ev_ca80f7ec5d" className="max-w-5xl mx-auto px-6 mb-8">
          <button data-ev-id="ev_9a5a689c59"
          onClick={handleStartBlank}
          className="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#00aa9b] hover:bg-[#00aa9b]/5 transition-colors flex items-center justify-center gap-3 text-gray-600 hover:text-[#00aa9b]">

            <BookOpen className="w-5 h-5" />
            <span data-ev-id="ev_bfdcff359d" className="font-medium">
              {language === 'he' ? 'התחל ללא עיצוב בסיס' : 'Start without a base design'}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div data-ev-id="ev_f1c7e2e8f8" className="max-w-5xl mx-auto px-6 mb-8">
          <div data-ev-id="ev_3a20bca569" className="flex items-center gap-4">
            <div data-ev-id="ev_2e82be5b0b" className="flex-1 h-px bg-gray-200" />
            <span data-ev-id="ev_f17ef4f68b" className="text-sm text-gray-400">
              {language === 'he' ? 'או בחרו עיצוב' : 'or choose a design'}
            </span>
            <div data-ev-id="ev_fe78463a4a" className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Category rows */}
        <div data-ev-id="ev_d4a40e775c" className="divide-y divide-gray-100">
          {GALLERY_CATEGORIES.map((category) => {
            const categoryThemes = getThemesForCategory(category.themes);
            return (
              <CategoryRow
                key={category.id}
                category={category}
                themes={categoryThemes}
                language={language}
                isRTL={isRTL}
                onSelectTheme={handleSelectTheme} />);


          })}
        </div>
      </main>
    </div>);

}