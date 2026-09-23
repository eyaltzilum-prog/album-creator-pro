/**
 * Theme/Design Gallery - Screen A
 * White page with categorized theme cards, 4 per row with realistic photobook cover previews
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { THEMES, Theme } from '@/lib/themes';

// Extended theme variants for richer gallery
const GALLERY_THEMES: Array<Theme & {variantId?: string;}> = [
...THEMES,
// Add visual variants of existing themes for fuller gallery
{ ...THEMES[0], id: 'minimal-warm', variantId: 'minimal', name: { he: 'מינימלי חם', en: 'Warm Minimal' }, previewGradient: 'linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%)', colors: { ...THEMES[0].colors, primary: '#c9a87c', accent: '#8b7355' } },
{ ...THEMES[1], id: 'modern-blue', variantId: 'modern', name: { he: 'מודרני כחול', en: 'Blue Modern' }, previewGradient: 'linear-gradient(135deg, #1a365d 0%, #2c5282 100%)', colors: { ...THEMES[1].colors, primary: '#2b6cb0', accent: '#63b3ed' } },
{ ...THEMES[2], id: 'wedding-blush', variantId: 'wedding', name: { he: 'חתונה רומנטית', en: 'Blush Wedding' }, previewGradient: 'linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%)', colors: { ...THEMES[2].colors, primary: '#e8b4b8', accent: '#c97b84' } },
{ ...THEMES[3], id: 'baby-blue', variantId: 'baby', name: { he: 'תינוק כחול', en: 'Baby Blue' }, previewGradient: 'linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%)', colors: { ...THEMES[3].colors, primary: '#90cdf4', accent: '#4299e1' } },
{ ...THEMES[4], id: 'family-earth', variantId: 'family', name: { he: 'משפחה אדמה', en: 'Earth Family' }, previewGradient: 'linear-gradient(135deg, #f5f0e6 0%, #d4c4a8 100%)', colors: { ...THEMES[4].colors, primary: '#8b7355', accent: '#6b4423' } },
{ ...THEMES[5], id: 'travel-sunset', variantId: 'travel', name: { he: 'טיול שקיעה', en: 'Sunset Travel' }, previewGradient: 'linear-gradient(135deg, #fbd38d 0%, #f6ad55 100%)', colors: { ...THEMES[5].colors, primary: '#dd6b20', accent: '#c05621' } },
{ ...THEMES[6], id: 'celebration-gold', variantId: 'celebration', name: { he: 'חגיגה זהובה', en: 'Gold Celebration' }, previewGradient: 'linear-gradient(135deg, #fefcbf 0%, #ecc94b 100%)', colors: { ...THEMES[6].colors, primary: '#d69e2e', accent: '#b7791f' } },
{ ...THEMES[7], id: 'school-bright', variantId: 'school', name: { he: 'בית ספר צבעוני', en: 'Bright School' }, previewGradient: 'linear-gradient(135deg, #c6f6d5 0%, #68d391 100%)', colors: { ...THEMES[7].colors, primary: '#38a169', accent: '#276749' } }];


// Gallery categories with theme IDs
const GALLERY_CATEGORIES = [
{ id: 'popular', name: { he: 'פופולרי', en: 'Popular' }, themes: ['minimal', 'modern', 'wedding', 'family'] },
{ id: 'wedding', name: { he: 'חתונה ואירועים', en: 'Wedding & Events' }, themes: ['wedding', 'wedding-blush', 'celebration', 'celebration-gold'] },
{ id: 'baby', name: { he: 'תינוקות וילדים', en: 'Baby & Children' }, themes: ['baby', 'baby-blue', 'minimal-warm', 'family'] },
{ id: 'family', name: { he: 'משפחה', en: 'Family' }, themes: ['family', 'family-earth', 'minimal', 'minimal-warm'] },
{ id: 'travel', name: { he: 'טיולים ונופש', en: 'Travel & Vacation' }, themes: ['travel', 'travel-sunset', 'modern', 'modern-blue'] },
{ id: 'school', name: { he: 'בית ספר ונוער', en: 'School & Youth' }, themes: ['school', 'school-bright', 'celebration', 'modern'] },
{ id: 'minimal', name: { he: 'מינימליסטי', en: 'Minimalist' }, themes: ['minimal', 'minimal-warm', 'modern', 'modern-blue'] }];


// Realistic photobook cover component
function PhotobookCover({ theme, size = 'normal' }: {theme: Theme & {variantId?: string;};size?: 'small' | 'normal';}) {
  const dimensions = size === 'normal' ? { w: 140, h: 175 } : { w: 100, h: 125 };
  const { colors, previewGradient } = theme;

  // Generate unique visual based on theme category
  const getCoverVisual = () => {
    const category = theme.category;

    switch (category) {
      case 'wedding':
        return (
          <>
            {/* Elegant frame with photo area */}
            <div data-ev-id="ev_87eb48f382" className="absolute inset-3 rounded border border-white/30">
              <div data-ev-id="ev_8675906070" className="absolute inset-2 rounded bg-white/15" />
            </div>
            {/* Decorative elements */}
            <div data-ev-id="ev_5b8d01fc8b" className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white/40" />
            <div data-ev-id="ev_c4a47710b3" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_9f5e1e9f27" className="w-16 h-1.5 rounded bg-white/50" />
              <div data-ev-id="ev_a38d16907b" className="w-10 h-1 rounded bg-white/30" />
            </div>
          </>);

      case 'baby':
        return (
          <>
            {/* Circular photo frame */}
            <div data-ev-id="ev_9c060bff38" className="absolute top-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 border-2 border-white/30" />
            {/* Cute elements */}
            <div data-ev-id="ev_110925aa84" className="absolute top-3 right-3 w-3 h-3 rounded-full" style={{ background: colors.accent }} />
            <div data-ev-id="ev_841a9e7f6c" className="absolute top-5 right-5 w-2 h-2 rounded-full" style={{ background: colors.accent, opacity: 0.6 }} />
            <div data-ev-id="ev_e0595663de" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_37be767e0b" className="w-14 h-1.5 rounded bg-white/50" />
              <div data-ev-id="ev_5cc1c444d6" className="w-8 h-1 rounded bg-white/30" />
            </div>
          </>);

      case 'travel':
        return (
          <>
            {/* Panoramic photo area */}
            <div data-ev-id="ev_54be976305" className="absolute top-4 left-3 right-3 h-16 rounded bg-white/15 border border-white/20" />
            {/* Decorative compass/map hint */}
            <div data-ev-id="ev_26eaaba908" className="absolute bottom-12 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-white/30" />
            <div data-ev-id="ev_4de0c9e804" className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_c6493f7e37" className="w-16 h-1.5 rounded bg-white/50" />
            </div>
          </>);

      case 'school':
        return (
          <>
            {/* Grid photo layout */}
            <div data-ev-id="ev_f98788a981" className="absolute top-4 left-3 right-3 grid grid-cols-2 gap-1">
              <div data-ev-id="ev_0ea7f0f1a3" className="h-10 rounded bg-white/15" />
              <div data-ev-id="ev_04307285cf" className="h-10 rounded bg-white/15" />
              <div data-ev-id="ev_c850552606" className="h-10 rounded bg-white/15" />
              <div data-ev-id="ev_39ebcc3a37" className="h-10 rounded bg-white/15" />
            </div>
            <div data-ev-id="ev_2a54daa407" className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_61aa21a18b" className="w-14 h-1.5 rounded bg-white/50" />
              <div data-ev-id="ev_689f16f9dd" className="w-10 h-1 rounded bg-white/30" />
            </div>
          </>);

      case 'celebration':
        return (
          <>
            {/* Festive layout */}
            <div data-ev-id="ev_cd32d2d284" className="absolute top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-lg bg-white/15 border border-white/25" />
            {/* Confetti hints */}
            <div data-ev-id="ev_6326dcb030" className="absolute top-3 left-4 w-2 h-2 rounded-full" style={{ background: colors.accent }} />
            <div data-ev-id="ev_de3528aa34" className="absolute top-6 right-4 w-1.5 h-1.5 rounded-full" style={{ background: colors.accent, opacity: 0.7 }} />
            <div data-ev-id="ev_b0b3b80ff3" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_5de5225dab" className="w-12 h-1.5 rounded bg-white/50" />
              <div data-ev-id="ev_caf25b7ceb" className="w-16 h-1 rounded bg-white/30" />
            </div>
          </>);

      case 'family':
        return (
          <>
            {/* Large portrait frame */}
            <div data-ev-id="ev_acf155fae9" className="absolute top-4 left-4 right-4 h-20 rounded bg-white/15 border border-white/20" />
            {/* Warm text area */}
            <div data-ev-id="ev_6cb80af099" className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_0be5d31305" className="w-16 h-2 rounded bg-white/50" />
              <div data-ev-id="ev_0ac544c2f6" className="w-10 h-1 rounded bg-white/30" />
            </div>
          </>);

      case 'modern':
        return (
          <>
            {/* Geometric layout */}
            <div data-ev-id="ev_92b3238c80" className="absolute top-4 left-3 w-16 h-20 rounded bg-white/10" />
            <div data-ev-id="ev_8152c3e20b" className="absolute top-6 right-3 w-10 h-10 rounded bg-white/15" />
            <div data-ev-id="ev_96767efd16" className="absolute bottom-12 right-3 w-10 h-8 rounded bg-white/10" />
            <div data-ev-id="ev_733ff31278" className="absolute bottom-4 left-3 flex flex-col gap-1">
              <div data-ev-id="ev_64da820b0c" className="w-12 h-1.5 rounded bg-white/50" />
              <div data-ev-id="ev_3643b704fb" className="w-8 h-1 rounded bg-white/30" />
            </div>
          </>);

      default: // minimal
        return (
          <>
            {/* Clean centered photo */}
            <div data-ev-id="ev_46b7a430e8" className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-16 rounded bg-white/10 border border-white/15" />
            <div data-ev-id="ev_3443738ebb" className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <div data-ev-id="ev_ef1c52ef58" className="w-14 h-1.5 rounded bg-white/40" />
              <div data-ev-id="ev_517e1907e6" className="w-8 h-1 rounded bg-white/25" />
            </div>
          </>);

    }
  };

  return (
    <div data-ev-id="ev_38d10663ac" className="relative" style={{ width: dimensions.w + 24, height: dimensions.h + 35 }}>
      {/* Floor shadow */}
      <div data-ev-id="ev_11c357f8f9"
      className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/15 rounded-full blur-lg"
      style={{ width: dimensions.w * 0.85, height: 15 }} />

      
      {/* Book body */}
      <div data-ev-id="ev_db99ed637d" className="relative" style={{ width: dimensions.w, height: dimensions.h }}>
        {/* Back cover hint */}
        <div data-ev-id="ev_779db5e2d4"
        className="absolute top-1 -right-1 rounded-r"
        style={{
          width: dimensions.w - 8,
          height: dimensions.h - 2,
          background: `${colors.primary}88`
        }} />

        
        {/* Spine */}
        <div data-ev-id="ev_5a79e89f59"
        className="absolute top-0 left-0 h-full w-4 rounded-l z-10"
        style={{
          background: `linear-gradient(90deg, ${colors.primary}ee 0%, ${colors.primary} 50%, ${colors.primary}dd 100%)`,
          boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.15), 1px 0 2px rgba(0,0,0,0.1)'
        }} />

        
        {/* Front cover */}
        <div data-ev-id="ev_e8bfcc26bd"
        className="absolute top-0 left-3 right-0 h-full rounded-r overflow-hidden shadow-xl"
        style={{
          background: previewGradient,
          border: `1px solid ${colors.primary}22`
        }}>

          {getCoverVisual()}
        </div>
        
        {/* Edge highlight */}
        <div data-ev-id="ev_5642d5f76a"
        className="absolute top-0 right-0 w-px h-full bg-white/30 rounded-r" />

        
        {/* Top edge highlight */}
        <div data-ev-id="ev_6af6746d8e"
        className="absolute top-0 left-4 right-0 h-px bg-white/20" />

      </div>
    </div>);

}

interface ThemeCardProps {
  theme: Theme & {variantId?: string;};
  language: 'he' | 'en';
  onSelect: (theme: Theme) => void;
}

function ThemeCard({ theme, language, onSelect }: ThemeCardProps) {
  // Get the base theme for selection (use variantId if this is a variant)
  const baseTheme = theme.variantId ?
  THEMES.find((t) => t.id === theme.variantId) || theme :
  theme;

  return (
    <button data-ev-id="ev_8ba0deb3b0"
    onClick={() => onSelect(baseTheme as Theme)}
    className="group flex flex-col items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00aa9b] focus-visible:ring-offset-4 rounded-xl p-2 hover:bg-gray-50 transition-colors">

      {/* Cover mockup */}
      <div data-ev-id="ev_7b1a24d972" className="transform group-hover:scale-105 transition-transform duration-300">
        <PhotobookCover theme={theme} size="normal" />
      </div>
      
      {/* Theme name */}
      <span data-ev-id="ev_18fbea8a3e" className="text-sm text-gray-700 font-medium group-hover:text-[#00aa9b] transition-colors text-center">
        {theme.name[language]}
      </span>
    </button>);

}

interface CategoryRowProps {
  category: {id: string;name: {he: string;en: string;};themes: string[];};
  themes: Array<Theme & {variantId?: string;}>;
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
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [themes]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    const mult = isRTL ? -1 : 1;
    const newScroll = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount) * mult;
    scrollRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  if (themes.length === 0) return null;

  return (
    <div data-ev-id="ev_789a95af0c" className="py-10">
      {/* Category header - centered */}
      <div data-ev-id="ev_be1c8c68f1" className="text-center mb-8">
        <h2 data-ev-id="ev_cf518686df" className="text-xl font-semibold text-gray-800 mb-1">
          {category.name[language]}
        </h2>
        <button data-ev-id="ev_198a737c49" className="text-xs text-[#00aa9b] hover:underline">
          {language === 'he' ? 'הצג הכל' : 'View all'}
        </button>
      </div>

      {/* Theme cards row - 4 per row with generous whitespace */}
      <div data-ev-id="ev_6425fd97c9" className="relative max-w-5xl mx-auto px-16">
        {/* Left chevron */}
        <button data-ev-id="ev_ddc9224d73"
        onClick={() => scroll(isRTL ? 'right' : 'left')}
        className={`absolute ${isRTL ? 'right-2' : 'left-2'} top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#00aa9b]/70 hover:bg-[#00aa9b] hover:text-white transition-colors ${!canScrollLeft && !isRTL || !canScrollRight && isRTL ? 'opacity-0 pointer-events-none' : ''}`}
        disabled={!canScrollLeft && !isRTL || !canScrollRight && isRTL}>

          {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>

        {/* Scrollable row - show 4 cards */}
        <div data-ev-id="ev_27c4ab8aa2"
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth py-4 justify-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

          {themes.map((theme, idx) =>
          <div data-ev-id="ev_85bfbeca07" key={`${theme.id}-${idx}`} className="flex-shrink-0">
              <ThemeCard theme={theme} language={language} onSelect={onSelectTheme} />
            </div>
          )}
        </div>

        {/* Right chevron */}
        <button data-ev-id="ev_aaab679abe"
        onClick={() => scroll(isRTL ? 'left' : 'right')}
        className={`absolute ${isRTL ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-md text-[#00aa9b]/70 hover:bg-[#00aa9b] hover:text-white transition-colors ${!canScrollRight && !isRTL || !canScrollLeft && isRTL ? 'opacity-0 pointer-events-none' : ''}`}
        disabled={!canScrollRight && !isRTL || !canScrollLeft && isRTL}>

          {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>);

}

export default function ThemeGallery() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Check if returning from setup with a theme
  const returnTheme = location.state?.returnTheme as Theme | null;

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { returnTo: '/album/new' } });
    }
  }, [user, navigate]);

  const handleSelectTheme = (theme: Theme | null) => {
    navigate('/album/setup', { state: { selectedTheme: theme } });
  };

  const handleStartBlank = () => {
    navigate('/album/setup', { state: { selectedTheme: null } });
  };

  // Get themes for a category
  const getThemesForCategory = (categoryThemeIds: string[]) => {
    return categoryThemeIds.
    map((id) => GALLERY_THEMES.find((t) => t.id === id)).
    filter((t): t is Theme & {variantId?: string;} => t !== undefined);
  };

  if (!user) {
    return (
      <div data-ev-id="ev_e7ebc8574b" className="min-h-screen bg-white flex items-center justify-center">
        <div data-ev-id="ev_2d300fce8c" className="animate-spin w-8 h-8 border-2 border-[#00aa9b] border-t-transparent rounded-full" />
      </div>);

  }

  return (
    <div data-ev-id="ev_27b2434052" className="min-h-screen bg-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header data-ev-id="ev_1384967875" className="py-5 border-b border-gray-100">
        <div data-ev-id="ev_9067b45667" className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button data-ev-id="ev_962cb73de0"
          onClick={() => navigate('/projects')}
          className="text-gray-500 hover:text-gray-700 text-sm">

            {language === 'he' ? '← חזרה לאלבומים' : '← Back to albums'}
          </button>
          <h1 data-ev-id="ev_a1cb093dde" className="text-lg font-medium text-gray-800">
            {language === 'he' ? 'יצירת אלבום חדש' : 'Create New Album'}
          </h1>
          <div data-ev-id="ev_73ce0934e9" className="w-28" />
        </div>
      </header>

      {/* Main content */}
      <main data-ev-id="ev_a5a84d3b8b" className="py-12">
        {/* Intro */}
        <div data-ev-id="ev_3914a5c6cb" className="text-center mb-10">
          <h1 data-ev-id="ev_7a4ae82b21" className="text-3xl font-bold text-gray-900 mb-3">
            {language === 'he' ? 'בחרו נושא לאלבום' : 'Choose a theme for your album'}
          </h1>
          <p data-ev-id="ev_b51e689501" className="text-gray-500 max-w-md mx-auto">
            {language === 'he' ?
            'בחרו מתוך מגוון עיצובים מוכנים או התחילו מאלבום ריק' :
            'Choose from a variety of ready-made designs or start with a blank album'}
          </p>
        </div>

        {/* Start without design option */}
        <div data-ev-id="ev_d3b46f8e74" className="max-w-4xl mx-auto px-6 mb-6">
          <button data-ev-id="ev_9bd36794fd"
          onClick={handleStartBlank}
          className="w-full py-4 px-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#00aa9b] hover:bg-[#00aa9b]/5 transition-colors flex items-center justify-center gap-3 text-gray-500 hover:text-[#00aa9b]">

            <BookOpen className="w-5 h-5" />
            <span data-ev-id="ev_ea5d73e460" className="font-medium">
              {language === 'he' ? 'התחל ללא עיצוב בסיס' : 'Start without a base design'}
            </span>
          </button>
        </div>

        {/* Separator */}
        <div data-ev-id="ev_7a625fa6eb" className="max-w-4xl mx-auto px-6 mb-6">
          <div data-ev-id="ev_af3cf16244" className="flex items-center gap-4">
            <div data-ev-id="ev_112d778770" className="flex-1 h-px bg-gray-200" />
            <span data-ev-id="ev_93be8f4df6" className="text-sm text-gray-400">
              {language === 'he' ? 'או בחרו עיצוב' : 'or choose a design'}
            </span>
            <div data-ev-id="ev_6587105dc5" className="flex-1 h-px bg-gray-200" />
          </div>
        </div>

        {/* Category rows */}
        <div data-ev-id="ev_ff4dcf7d2e" className="divide-y divide-gray-100">
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